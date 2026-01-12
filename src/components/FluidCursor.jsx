import React, { useEffect, useRef } from 'react';

const FluidCursor = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    // Config
    const config = {
      TEXTURE_DOWNSAMPLE: 1,
      DENSITY_DISSIPATION: 0.975,
      VELOCITY_DISSIPATION: 0.98,
      PRESSURE_DISSIPATION: 0.85,
      PRESSURE_ITERATIONS: 20,
      CURL: 32,
      SPLAT_RADIUS: 0.0025,
    };

    // Pointer
    class Pointer {
      constructor() {
        this.x = 0;
        this.y = 0;
        this.dx = 0;
        this.dy = 0;
        this.down = true;
        this.moved = false;
        this.color = [0.9, 0.6, 0.4];
      }
    }

    const pointers = [new Pointer()];

    // Get WebGL context
    const getWebGLContext = () => {
      const params = { alpha: true, depth: false, stencil: false, antialias: false, premultipliedAlpha: true };
      let gl = canvas.getContext('webgl2', params) || canvas.getContext('webgl', params);

      if (!gl) return null;

      const isWebGL2 = gl instanceof WebGL2RenderingContext;
      let halfFloat, supportLinearFiltering;

      if (isWebGL2) {
        gl.getExtension('EXT_color_buffer_float');
        supportLinearFiltering = gl.getExtension('OES_texture_float_linear');
      } else {
        halfFloat = gl.getExtension('OES_texture_half_float');
        supportLinearFiltering = gl.getExtension('OES_texture_half_float_linear');
      }

      gl.clearColor(0.0, 0.0, 0.0, 0.0);

      const halfFloatTexType = isWebGL2 ? gl.HALF_FLOAT : halfFloat?.HALF_FLOAT_OES;

      const getSupportedFormat = (internalFormat, format, type) => {
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);

        const fbo = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

        return gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE
          ? { internalFormat, format }
          : null;
      };

      let formatRGBA, formatRG, formatR;

      if (isWebGL2) {
        formatRGBA = getSupportedFormat(gl.RGBA16F, gl.RGBA, halfFloatTexType);
        formatRG = getSupportedFormat(gl.RG16F, gl.RG, halfFloatTexType);
        formatR = getSupportedFormat(gl.R16F, gl.RED, halfFloatTexType);
      } else {
        formatRGBA = getSupportedFormat(gl.RGBA, gl.RGBA, halfFloatTexType);
        formatRG = getSupportedFormat(gl.RGBA, gl.RGBA, halfFloatTexType);
        formatR = getSupportedFormat(gl.RGBA, gl.RGBA, halfFloatTexType);
      }

      return {
        gl,
        ext: { formatRGBA, formatRG, formatR, halfFloatTexType, supportLinearFiltering },
      };
    };

    const context = getWebGLContext();
    if (!context) return;

    const { gl, ext } = context;

    // Compile shader
    const compileShader = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };

    // GLProgram class
    class GLProgram {
      constructor(vertexShader, fragmentShader) {
        this.uniforms = {};
        this.program = gl.createProgram();
        gl.attachShader(this.program, vertexShader);
        gl.attachShader(this.program, fragmentShader);
        gl.linkProgram(this.program);

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

    // Shaders
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
        gl_FragColor = texture2D(uTexture, vUv);
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
      void main () {
        vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
        gl_FragColor = dissipation * texture2D(uSource, coord);
        gl_FragColor.a = 1.0;
      }
    `);

    const divergenceShader = compileShader(gl.FRAGMENT_SHADER, `
      precision highp float;
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
        gl_FragColor = vec4(vorticity, 0.0, 0.0, 1.0);
      }
    `);

    const vorticityShader = compileShader(gl.FRAGMENT_SHADER, `
      precision highp float;
      varying vec2 vUv;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uVelocity;
      uniform sampler2D uCurl;
      uniform float curl;
      uniform float dt;
      void main () {
        float T = texture2D(uCurl, vT).x;
        float B = texture2D(uCurl, vB).x;
        float C = texture2D(uCurl, vUv).x;
        vec2 force = vec2(abs(T) - abs(B), 0.0);
        force *= 1.0 / length(force + 0.00001) * curl * C;
        vec2 vel = texture2D(uVelocity, vUv).xy;
        gl_FragColor = vec4(vel + force * dt, 0.0, 1.0);
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
        float divergence = texture2D(uDivergence, vUv).x;
        float pressure = (L + R + B + T - divergence) * 0.25;
        gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
      }
    `);

    const gradientSubtractShader = compileShader(gl.FRAGMENT_SHADER, `
      precision highp float;
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

    // Create programs
    const programs = {
      display: new GLProgram(baseVertexShader, displayShader),
      splat: new GLProgram(baseVertexShader, splatShader),
      advection: new GLProgram(baseVertexShader, advectionShader),
      divergence: new GLProgram(baseVertexShader, divergenceShader),
      curl: new GLProgram(baseVertexShader, curlShader),
      vorticity: new GLProgram(baseVertexShader, vorticityShader),
      pressure: new GLProgram(baseVertexShader, pressureShader),
      gradientSubtract: new GLProgram(baseVertexShader, gradientSubtractShader),
      clear: new GLProgram(baseVertexShader, clearShader),
    };

    // FBO helpers
    const createFBO = (texId, w, h, internalFormat, format, type, param) => {
      gl.activeTexture(gl.TEXTURE0 + texId);
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

      return [texture, fbo, texId];
    };

    const createDoubleFBO = (texId, w, h, internalFormat, format, type, param) => {
      let fbo1 = createFBO(texId, w, h, internalFormat, format, type, param);
      let fbo2 = createFBO(texId + 1, w, h, internalFormat, format, type, param);
      return {
        get read() {
          return fbo1;
        },
        get write() {
          return fbo2;
        },
        swap() {
          [fbo1, fbo2] = [fbo2, fbo1];
        },
      };
    };

    const textureWidth = gl.drawingBufferWidth >> config.TEXTURE_DOWNSAMPLE;
    const textureHeight = gl.drawingBufferHeight >> config.TEXTURE_DOWNSAMPLE;
    const texType = ext.halfFloatTexType;
    const rgba = ext.formatRGBA;
    const rg = ext.formatRG;
    const r = ext.formatR;

    const density = createDoubleFBO(2, textureWidth, textureHeight, rgba.internalFormat, rgba.format, texType, ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST);
    const velocity = createDoubleFBO(0, textureWidth, textureHeight, rg.internalFormat, rg.format, texType, ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST);
    const divergence = createFBO(4, textureWidth, textureHeight, r.internalFormat, r.format, texType, gl.NEAREST);
    const curl = createFBO(5, textureWidth, textureHeight, r.internalFormat, r.format, texType, gl.NEAREST);
    const pressure = createDoubleFBO(6, textureWidth, textureHeight, r.internalFormat, r.format, texType, gl.NEAREST);

    // Blit setup
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

    // Splat
    const splat = (x, y, dx, dy, color) => {
      programs.splat.bind();
      gl.uniform1i(programs.splat.uniforms.uTarget, velocity.read[2]);
      gl.uniform1f(programs.splat.uniforms.aspectRatio, canvas.width / canvas.height);
      gl.uniform2f(programs.splat.uniforms.point, x / canvas.width, 1.0 - y / canvas.height);
      gl.uniform3f(programs.splat.uniforms.color, dx, -dy, 1.0);
      gl.uniform1f(programs.splat.uniforms.radius, config.SPLAT_RADIUS);
      blit(velocity.write[1]);
      velocity.swap();

      gl.uniform1i(programs.splat.uniforms.uTarget, density.read[2]);
      gl.uniform3f(programs.splat.uniforms.color, color[0] * 0.6, color[1] * 0.6, color[2] * 0.6);
      blit(density.write[1]);
      density.swap();
    };

    // Update loop
    let lastTime = Date.now();
    const update = () => {
      const dt = Math.min((Date.now() - lastTime) / 1000, 0.016);
      lastTime = Date.now();

      gl.viewport(0, 0, textureWidth, textureHeight);

      programs.advection.bind();
      gl.uniform2f(programs.advection.uniforms.texelSize, 1.0 / textureWidth, 1.0 / textureHeight);
      gl.uniform1i(programs.advection.uniforms.uVelocity, velocity.read[2]);
      gl.uniform1i(programs.advection.uniforms.uSource, velocity.read[2]);
      gl.uniform1f(programs.advection.uniforms.dt, dt);
      gl.uniform1f(programs.advection.uniforms.dissipation, config.VELOCITY_DISSIPATION);
      blit(velocity.write[1]);
      velocity.swap();

      gl.uniform1i(programs.advection.uniforms.uVelocity, velocity.read[2]);
      gl.uniform1i(programs.advection.uniforms.uSource, density.read[2]);
      gl.uniform1f(programs.advection.uniforms.dissipation, config.DENSITY_DISSIPATION);
      blit(density.write[1]);
      density.swap();

      pointers.forEach((pointer) => {
        if (pointer.moved) {
          splat(pointer.x, pointer.y, pointer.dx, pointer.dy, pointer.color);
          pointer.moved = false;
        }
      });

      programs.curl.bind();
      gl.uniform2f(programs.curl.uniforms.texelSize, 1.0 / textureWidth, 1.0 / textureHeight);
      gl.uniform1i(programs.curl.uniforms.uVelocity, velocity.read[2]);
      blit(curl[1]);

      programs.vorticity.bind();
      gl.uniform2f(programs.vorticity.uniforms.texelSize, 1.0 / textureWidth, 1.0 / textureHeight);
      gl.uniform1i(programs.vorticity.uniforms.uVelocity, velocity.read[2]);
      gl.uniform1i(programs.vorticity.uniforms.uCurl, curl[2]);
      gl.uniform1f(programs.vorticity.uniforms.curl, config.CURL);
      gl.uniform1f(programs.vorticity.uniforms.dt, dt);
      blit(velocity.write[1]);
      velocity.swap();

      programs.divergence.bind();
      gl.uniform2f(programs.divergence.uniforms.texelSize, 1.0 / textureWidth, 1.0 / textureHeight);
      gl.uniform1i(programs.divergence.uniforms.uVelocity, velocity.read[2]);
      blit(divergence[1]);

      programs.clear.bind();
      let pressureTexId = pressure.read[2];
      gl.activeTexture(gl.TEXTURE0 + pressureTexId);
      gl.bindTexture(gl.TEXTURE_2D, pressure.read[0]);
      gl.uniform1i(programs.clear.uniforms.uTexture, pressureTexId);
      gl.uniform1f(programs.clear.uniforms.value, config.PRESSURE_DISSIPATION);
      blit(pressure.write[1]);
      pressure.swap();

      programs.pressure.bind();
      gl.uniform2f(programs.pressure.uniforms.texelSize, 1.0 / textureWidth, 1.0 / textureHeight);
      gl.uniform1i(programs.pressure.uniforms.uDivergence, divergence[2]);
      pressureTexId = pressure.read[2];
      gl.uniform1i(programs.pressure.uniforms.uPressure, pressureTexId);
      gl.activeTexture(gl.TEXTURE0 + pressureTexId);
      for (let i = 0; i < config.PRESSURE_ITERATIONS; i++) {
        gl.bindTexture(gl.TEXTURE_2D, pressure.read[0]);
        blit(pressure.write[1]);
        pressure.swap();
      }

      programs.gradientSubtract.bind();
      gl.uniform2f(programs.gradientSubtract.uniforms.texelSize, 1.0 / textureWidth, 1.0 / textureHeight);
      gl.uniform1i(programs.gradientSubtract.uniforms.uPressure, pressure.read[2]);
      gl.uniform1i(programs.gradientSubtract.uniforms.uVelocity, velocity.read[2]);
      blit(velocity.write[1]);
      velocity.swap();

      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      programs.display.bind();
      gl.uniform1i(programs.display.uniforms.uTexture, density.read[2]);
      blit(null);

      requestAnimationFrame(update);
    };

    // Mouse events
    const handleMouseMove = (e) => {
      pointers[0].moved = pointers[0].down;
      pointers[0].dx = (e.offsetX - pointers[0].x) * 7.0;
      pointers[0].dy = (e.offsetY - pointers[0].y) * 7.0;
      pointers[0].x = e.offsetX;
      pointers[0].y = e.offsetY;
    };

    canvas.addEventListener('mousemove', handleMouseMove);

    update();

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ mixBlendMode: 'screen', opacity: 0.85 }}
    />
  );
};

export default FluidCursor;
