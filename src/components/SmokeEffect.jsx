import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const SmokeEffect = ({ intensity = 'medium' }) => {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 100 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  const smokeParticles = intensity === 'heavy' ? 20 : intensity === 'medium' ? 12 : 8;

  const createSmokeParticle = (index) => {
    const startX = Math.random() * 100;
    const endX = startX + (Math.random() - 0.5) * 80;
    const duration = 15 + Math.random() * 10;
    const delay = Math.random() * 8;
    const size = 300 + Math.random() * 500;

    return {
      startX,
      endX,
      duration,
      delay,
      size,
      id: `smoke-${index}`,
    };
  };

  const particles = Array.from({ length: smokeParticles }, (_, i) => createSmokeParticle(i));

  return (
    <>
      {/* Main smoke particles rising from bottom */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              left: `${particle.startX}%`,
              bottom: '-15%',
              background: 'radial-gradient(circle at 40% 40%, rgba(200, 200, 200, 0.25), rgba(154, 154, 154, 0.15), rgba(100, 100, 100, 0.08), transparent)',
              filter: 'blur(40px)',
              mixBlendMode: 'screen',
            }}
            animate={{
              x: [
                '0vw',
                `${(particle.endX - particle.startX) * 0.25}vw`,
                `${(particle.endX - particle.startX) * 0.6}vw`,
                `${(particle.endX - particle.startX)}vw`,
              ],
              y: [
                '0vh',
                '-35vh',
                '-75vh',
                '-130vh',
              ],
              scale: [0.6, 1.3, 1.8, 2.2],
              opacity: [0, 0.6, 0.4, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: 'easeInOut',
              times: [0, 0.25, 0.65, 1],
            }}
          />
        ))}

        {/* Horizontal drifting smoke layers */}
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={`drift-${i}`}
            className="absolute"
            style={{
              width: '700px',
              height: '700px',
              left: `${(i * 15) % 100}%`,
              top: `${10 + (i * 12) % 70}%`,
              background: 'radial-gradient(ellipse at center, rgba(180, 180, 180, 0.2), rgba(154, 154, 154, 0.1), transparent 65%)',
              filter: 'blur(60px)',
              mixBlendMode: 'screen',
            }}
            animate={{
              x: ['-30vw', '30vw', '-30vw'],
              y: ['-15vh', '15vh', '-15vh'],
              scale: [1.2, 1.6, 1.2],
              opacity: [0.3, 0.5, 0.3],
              rotate: [0, 90, 0],
            }}
            transition={{
              duration: 20 + i * 4,
              delay: i * 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Amber-tinted smoke wisps */}
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={`wisp-${i}`}
            className="absolute"
            style={{
              width: '500px',
              height: '500px',
              left: `${(i * 18) % 95}%`,
              top: `${(i * 20) % 75}%`,
              background: 'radial-gradient(circle, rgba(227, 139, 41, 0.15), rgba(227, 139, 41, 0.08), transparent 70%)',
              filter: 'blur(70px)',
              mixBlendMode: 'screen',
            }}
            animate={{
              x: ['-25vw', '25vw', '-25vw'],
              y: ['-20vh', '20vh', '-20vh'],
              scale: [1, 1.5, 1],
              opacity: [0.25, 0.45, 0.25],
            }}
            transition={{
              duration: 22 + i * 3,
              delay: i * 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

    </>
  );
};

export default SmokeEffect;
