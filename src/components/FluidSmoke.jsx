import React, { useEffect, useRef } from 'react';

const FluidSmoke = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const config = {
      SIM_RESOLUTION: 128,
      DYE_RESOLUTION: 512,
      DENSITY_DISSIPATION: 0.97,
      VELOCITY_DISSIPATION: 0.98,
      PRESSURE: 0.8,
      PRESSURE_ITERATIONS: 20,
      CURL: 30,
      SPLAT_RADIUS: 0.005,
      SPLAT_FORCE: 6000,
      COLOR_UPDATE_SPEED: 10
    };

    const pointer = {
      x: 0,
      y: 0,
      dx: 0,
      dy: 0,
      moved: false,
      color: [0.9, 0.6, 0.3]
    };

    // WebGL setup
    const gl = canvas.getContext('webgl2', { alpha: true, antialias: false }) ||
               canvas.getContext('webgl', { alpha: true, antialias: false });

    if (!gl) {
      console.error('WebGL not supported');
      return;
    }

    const isWebGL2 = gl instanceof WebGL2RenderingContext;

    let halfFloat, supportLinearFiltering;
    if (isWebGL2) {
      gl.getExtension('EXT_color_buffer_float');
      supportLinearFiltering = gl.getExtension('OES_texture_float_linear');
    } else {
      halfFloat = gl.getExtension('OES_texture_half_float');
      supportLinearFiltering = gl.getExtension('OES_texture_half_float_linear');
    }

    const halfFloatTexType = isWebGL2 ? gl.HALF_FLOAT : halfFloat?.HALF_FLOAT_OES;

    gl.clearColor(0, 0, 0, 0);

    const compileShader = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        return null;
      }
      return shader;
    };

    class Program {
      constructor(vertexShader, fragmentShader) {
        this.uniforms = {};
        this.program = gl.createProgram();
        gl.attachShader(this.program, vertexShader);
        gl.attachShader(this.program, fragmentShader);
        gl.linkProgram(this.program);

        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
          console.error(gl.getProgramInfoLog(this.program));
        }

        const uniformCount = gl.getProgramParameter(this.program, gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < uniformCount; i++) {
          const uniformName = gl.getActiveUniform(this.program, i).name;
          this.uniforms[uniformName] = gl.getUniformLocation(this.program, uniformName);
        }
      }

      bind() {
        gl.useProgram(this.program);
      }
    }

    const baseVertexShader = compileShader(gl.VERTEX_SHADER, `
      precision highp float;
      attribute vec2 aPosition;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform vec2 texelSize;
      void main () {
        vUv = aPosition * 0.5 + 0.5;
        vL = vUv - vec2(texelSize.x, 0.0);
        vR = vUv + vec2(texelSize.x, 0.0);
        vT = vUv + vec2(0.0, texelSize.y);
        vB = vUv - vec2(0.0, texelSize.y);
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `);

    const displayShader = compileShader(gl.FRAGMENT_SHADER, `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uTexture;
      void main () {
        vec3 color = texture2D(uTexture, vUv).rgb;
        gl_FragColor = vec4(color, 1.0);
      }
    `);

    const splatShader = compileShader(gl.FRAGMENT_SHADER, `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uTarget;
      uniform float aspectRatio;
      uniform vec3 color;
      uniform vec2 point;
      uniform float radius;
      void main () {
        vec2 p = vUv - point.xy;
        p.x *= aspectRatio;
        vec3 splat = exp(-dot(p, p) / radius) * color;
        vec3 base = texture2D(uTarget, vUv).xyz;
        gl_FragColor = vec4(base + splat, 1.0);
      }
    `);

    const advectionShader = compileShader(gl.FRAGMENT_SHADER, `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uVelocity;
      uniform sampler2D uSource;
      uniform vec2 texelSize;
      uniform float dt;
      uniform float dissipation;
      vec4 bilerp(sampler2D sam, vec2 p, vec2 texelSize) {
        vec2 st = p / texelSize - 0.5;
        vec2 iuv = floor(st);
        vec2 fuv = fract(st);
        vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * texelSize);
        vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * texelSize);
        vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * texelSize);
        vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * texelSize);
        return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
      }
      void main () {
        vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
        gl_FragColor = dissipation * bilerp(uSource, coord, texelSize);
      }
    `);

    const divergenceShader = compileShader(gl.FRAGMENT_SHADER, `
      precision highp float;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uVelocity;
      void main () {
        float L = texture2D(uVelocity, vL).x;
        float R = texture2D(uVelocity, vR).x;
        float T = texture2D(uVelocity, vT).y;
        float B = texture2D(uVelocity, vB).y;
        float div = 0.5 * (R - L + T - B);
        gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
      }
    `);

    const curlShader = compileShader(gl.FRAGMENT_SHADER, `
      precision highp float;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uVelocity;
      void main () {
        float L = texture2D(uVelocity, vL).y;
        float R = texture2D(uVelocity, vR).y;
        float T = texture2D(uVelocity, vT).x;
        float B = texture2D(uVelocity, vB).x;
        float vorticity = R - L - T + B;
        gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
      }
    `);

    const vorticityShader = compileShader(gl.FRAGMENT_SHADER, `
      precision highp float;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uVelocity;
      uniform sampler2D uCurl;
      uniform float curl;
      uniform float dt;
      void main () {
        float L = texture2D(uCurl, vL).x;
        float R = texture2D(uCurl, vR).x;
        float T = texture2D(uCurl, vT).x;
        float B = texture2D(uCurl, vB).x;
        float C = texture2D(uCurl, vUv).x;
        vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
        force /= length(force) + 0.0001;
        force *= curl * C;
        force.y *= -1.0;
        vec2 velocity = texture2D(uVelocity, vUv).xy;
        velocity += force * dt;
        velocity = min(max(velocity, -1000.0), 1000.0);
        gl_FragColor = vec4(velocity, 0.0, 1.0);
      }
    `);

    const pressureShader = compileShader(gl.FRAGMENT_SHADER, `
      precision highp float;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uPressure;
      uniform sampler2D uDivergence;
      void main () {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        float C = texture2D(uPressure, vUv).x;
        float divergence = texture2D(uDivergence, vUv).x;
        float pressure = (L + R + B + T - divergence) * 0.25;
        gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
      }
    `);

    const gradientSubtractShader = compileShader(gl.FRAGMENT_SHADER, `
      precision highp float;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uPressure;
      uniform sampler2D uVelocity;
      void main () {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        vec2 velocity = texture2D(uVelocity, vUv).xy;
        velocity.xy -= vec2(R - L, T - B);
        gl_FragColor = vec4(velocity, 0.0, 1.0);
      }
    `);

    const clearShader = compileShader(gl.FRAGMENT_SHADER, `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uTexture;
      uniform float value;
      void main () {
        gl_FragColor = value * texture2D(uTexture, vUv);
      }
    `);

    const programs = {
      display: new Program(baseVertexShader, displayShader),
      splat: new Program(baseVertexShader, splatShader),
      advection: new Program(baseVertexShader, advectionShader),
      divergence: new Program(baseVertexShader, divergenceShader),
      curl: new Program(baseVertexShader, curlShader),
      vorticity: new Program(baseVertexShader, vorticityShader),
      pressure: new Program(baseVertexShader, pressureShader),
      gradientSubtract: new Program(baseVertexShader, gradientSubtractShader),
      clear: new Program(baseVertexShader, clearShader)
    };

    const createFBO = (w, h, internalFormat, format, type, param) => {
      gl.activeTexture(gl.TEXTURE0);
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);
      const fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
      gl.viewport(0, 0, w, h);
      gl.clear(gl.COLOR_BUFFER_BIT);
      return { texture, fbo, width: w, height: h };
    };

    const createDoubleFBO = (w, h, internalFormat, format, type, param) => {
      let fbo1 = createFBO(w, h, internalFormat, format, type, param);
      let fbo2 = createFBO(w, h, internalFormat, format, type, param);
      return {
        width: w,
        height: h,
        get read() { return fbo1; },
        set read(value) { fbo1 = value; },
        get write() { return fbo2; },
        set write(value) { fbo2 = value; },
        swap() { [fbo1, fbo2] = [fbo2, fbo1]; }
      };
    };

    let simWidth = config.SIM_RESOLUTION;
    let simHeight = Math.round(config.SIM_RESOLUTION * (canvas.height / canvas.width));
    let dyeWidth = config.DYE_RESOLUTION;
    let dyeHeight = Math.round(config.DYE_RESOLUTION * (canvas.height / canvas.width));

    // Use UNSIGNED_BYTE for compatibility
    const texType = gl.UNSIGNED_BYTE;
    const filtering = gl.LINEAR;

    // Use RGBA/UNSIGNED_BYTE for all textures
    let dye = createDoubleFBO(dyeWidth, dyeHeight, gl.RGBA, gl.RGBA, texType, filtering);
    let velocity = createDoubleFBO(simWidth, simHeight, gl.RGBA, gl.RGBA, texType, filtering);
    let divergence = createFBO(simWidth, simHeight, gl.RGBA, gl.RGBA, texType, gl.NEAREST);
    let curl = createFBO(simWidth, simHeight, gl.RGBA, gl.RGBA, texType, gl.NEAREST);
    let pressure = createDoubleFBO(simWidth, simHeight, gl.RGBA, gl.RGBA, texType, gl.NEAREST);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);

    const blit = (destination) => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, destination);
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    };

    const splat = (x, y, dx, dy, color) => {
      programs.splat.bind();
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, velocity.read.texture);
      gl.uniform1i(programs.splat.uniforms.uTarget, 0);
      gl.uniform1f(programs.splat.uniforms.aspectRatio, canvas.width / canvas.height);
      gl.uniform2f(programs.splat.uniforms.point, x, y);
      gl.uniform3f(programs.splat.uniforms.color, dx, dy, 0.0);
      gl.uniform1f(programs.splat.uniforms.radius, config.SPLAT_RADIUS / 100.0);
      blit(velocity.write.fbo);
      velocity.swap();

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, dye.read.texture);
      gl.uniform1i(programs.splat.uniforms.uTarget, 0);
      gl.uniform3f(programs.splat.uniforms.color, color[0], color[1], color[2]);
      blit(dye.write.fbo);
      dye.swap();
    };

    let lastTime = Date.now();
    const update = () => {
      const dt = Math.min((Date.now() - lastTime) / 1000, 0.016);
      lastTime = Date.now();

      if (pointer.moved) {
        pointer.moved = false;
        splat(pointer.x, pointer.y, pointer.dx, pointer.dy, pointer.color);
      }

      programs.curl.bind();
      gl.uniform2f(programs.curl.uniforms.texelSize, 1.0 / simWidth, 1.0 / simHeight);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, velocity.read.texture);
      gl.uniform1i(programs.curl.uniforms.uVelocity, 0);
      blit(curl.fbo);

      programs.vorticity.bind();
      gl.uniform2f(programs.vorticity.uniforms.texelSize, 1.0 / simWidth, 1.0 / simHeight);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, velocity.read.texture);
      gl.uniform1i(programs.vorticity.uniforms.uVelocity, 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, curl.texture);
      gl.uniform1i(programs.vorticity.uniforms.uCurl, 1);
      gl.uniform1f(programs.vorticity.uniforms.curl, config.CURL);
      gl.uniform1f(programs.vorticity.uniforms.dt, dt);
      blit(velocity.write.fbo);
      velocity.swap();

      programs.divergence.bind();
      gl.uniform2f(programs.divergence.uniforms.texelSize, 1.0 / simWidth, 1.0 / simHeight);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, velocity.read.texture);
      gl.uniform1i(programs.divergence.uniforms.uVelocity, 0);
      blit(divergence.fbo);

      programs.clear.bind();
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, pressure.read.texture);
      gl.uniform1i(programs.clear.uniforms.uTexture, 0);
      gl.uniform1f(programs.clear.uniforms.value, config.PRESSURE);
      blit(pressure.write.fbo);
      pressure.swap();

      programs.pressure.bind();
      gl.uniform2f(programs.pressure.uniforms.texelSize, 1.0 / simWidth, 1.0 / simHeight);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, divergence.texture);
      gl.uniform1i(programs.pressure.uniforms.uDivergence, 1);
      for (let i = 0; i < config.PRESSURE_ITERATIONS; i++) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, pressure.read.texture);
        gl.uniform1i(programs.pressure.uniforms.uPressure, 0);
        blit(pressure.write.fbo);
        pressure.swap();
      }

      programs.gradientSubtract.bind();
      gl.uniform2f(programs.gradientSubtract.uniforms.texelSize, 1.0 / simWidth, 1.0 / simHeight);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, pressure.read.texture);
      gl.uniform1i(programs.gradientSubtract.uniforms.uPressure, 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, velocity.read.texture);
      gl.uniform1i(programs.gradientSubtract.uniforms.uVelocity, 1);
      blit(velocity.write.fbo);
      velocity.swap();

      programs.advection.bind();
      gl.uniform2f(programs.advection.uniforms.texelSize, 1.0 / simWidth, 1.0 / simHeight);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, velocity.read.texture);
      gl.uniform1i(programs.advection.uniforms.uVelocity, 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, velocity.read.texture);
      gl.uniform1i(programs.advection.uniforms.uSource, 1);
      gl.uniform1f(programs.advection.uniforms.dt, dt);
      gl.uniform1f(programs.advection.uniforms.dissipation, config.VELOCITY_DISSIPATION);
      blit(velocity.write.fbo);
      velocity.swap();

      gl.uniform2f(programs.advection.uniforms.texelSize, 1.0 / dyeWidth, 1.0 / dyeHeight);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, velocity.read.texture);
      gl.uniform1i(programs.advection.uniforms.uVelocity, 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, dye.read.texture);
      gl.uniform1i(programs.advection.uniforms.uSource, 1);
      gl.uniform1f(programs.advection.uniforms.dissipation, config.DENSITY_DISSIPATION);
      blit(dye.write.fbo);
      dye.swap();

      gl.viewport(0, 0, canvas.width, canvas.height);
      programs.display.bind();
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, dye.read.texture);
      gl.uniform1i(programs.display.uniforms.uTexture, 0);
      blit(null);

      requestAnimationFrame(update);
    };

    canvas.addEventListener('mousemove', (e) => {
      pointer.moved = true;
      pointer.dx = (e.clientX - pointer.x) * config.SPLAT_FORCE;
      pointer.dy = (e.clientY - pointer.y) * config.SPLAT_FORCE;
      pointer.x = e.clientX / canvas.width;
      pointer.y = 1.0 - e.clientY / canvas.height;
    });

    update();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ mixBlendMode: 'screen', opacity: 0.9 }}
    />
  );
};

export default FluidSmoke;
