import React, { useEffect, useRef } from 'react';

const CursorSmoke = () => {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const mouse = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const animationFrameId = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    let width = window.innerWidth;
    let height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;

    // Particle class
    class SmokeParticle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 3;
        this.vy = -Math.random() * 2 - 0.5;
        this.size = Math.random() * 60 + 30;
        this.life = 1;
        this.decay = Math.random() * 0.006 + 0.004;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.08;
        // More amber smoke
        this.color = Math.random() > 0.4
          ? { r: 227, g: 139, b: 41 }
          : { r: 220, g: 220, b: 220 };
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.97;
        this.vy *= 0.97;
        this.size += 0.8;
        this.life -= this.decay;
        this.rotation += this.rotationSpeed;
      }

      draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        // Very visible opacity
        ctx.globalAlpha = this.life * 0.9;
        ctx.globalCompositeOperation = 'screen';

        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
        gradient.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.life * 0.9})`);
        gradient.addColorStop(0.4, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.life * 0.6})`);
        gradient.addColorStop(0.7, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.life * 0.3})`);
        gradient.addColorStop(1, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      isDead() {
        return this.life <= 0;
      }
    }

    // Mouse move handler - spawn more particles
    const handleMouseMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;

      // Create MORE particles for visibility
      for (let i = 0; i < 4; i++) {
        particles.current.push(
          new SmokeParticle(
            mouse.current.x + (Math.random() - 0.5) * 20,
            mouse.current.y + (Math.random() - 0.5) * 20
          )
        );
      }
    };

    // Animation loop
    const animate = () => {
      // Don't clear completely - creates trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, width, height);

      // Update and draw particles
      particles.current = particles.current.filter((particle) => {
        particle.update();
        particle.draw(ctx);
        return !particle.isDead();
      });

      // Limit particles count for performance
      if (particles.current.length > 200) {
        particles.current = particles.current.slice(-200);
      }

      animationFrameId.current = requestAnimationFrame(animate);
    };

    // Handle resize
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    // Event listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    // Start animation
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{
        mixBlendMode: 'screen',
        opacity: 1,
      }}
    />
  );
};

export default CursorSmoke;
