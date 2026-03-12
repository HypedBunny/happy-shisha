import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import MinimalShishaPipe from './MinimalShishaPipe';

import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleBookNow = () => {
    navigate('/book');
  };

  return (
    <section className="relative h-screen w-full overflow-hidden flex items-center justify-center mb-0"
      style={{
        background: 'radial-gradient(ellipse at center, rgba(30, 30, 30, 1) 0%, rgba(14, 14, 14, 1) 100%)',
      }}
    >
      {/* Subtle texture overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        }}
      />

      {/* Parallax Content */}
      <motion.div
        className="relative z-10 text-center px-6 max-w-6xl"
        style={{
          x: mousePosition.x,
          y: mousePosition.y,
        }}
        transition={{ type: 'spring', stiffness: 50, damping: 20 }}
      >
        <motion.div
          className="mb-6 flex flex-col items-center justify-center text-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
        >
          <span className="text-amber/90 text-3xl md:text-5xl lg:text-6xl block mb-2 lowercase italic font-serif tracking-wide drop-shadow-md">Happy Events</span>
          <span className="text-lg md:text-xl block mb-8 text-smoke/70 tracking-[0.4em] uppercase">Presents</span>

          <img
            src="/logo.png"
            alt="Happy Events Presents Happy Shisha Logo"
            className="w-48 h-48 md:w-64 md:h-64 object-contain filter drop-shadow-2xl hover:scale-105 transition-transform duration-500 ease-out"
          />
        </motion.div>

        <motion.p
          className="text-xl md:text-3xl font-light text-smoke mb-12 tracking-wide"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
        >
          Wherever the night takes you
        </motion.p>

        <motion.button
          onClick={handleBookNow}
          className="relative px-16 py-5 text-xl font-semibold text-charcoal bg-gradient-to-r from-amber via-amber/90 to-amber rounded-full overflow-hidden group shadow-2xl"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          whileHover={{ scale: 1.1, y: -5 }}
          whileTap={{ scale: 0.9 }}
        >
          {/* Animated gradient background */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-amber/80 via-yellow-500 to-amber/80"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
            }}
          />

          {/* Pulsing glow effect */}
          <motion.div
            className="absolute inset-0"
            animate={{
              boxShadow: [
                '0 0 20px rgba(227, 139, 41, 0.5)',
                '0 0 40px rgba(227, 139, 41, 0.8)',
                '0 0 60px rgba(227, 139, 41, 1)',
                '0 0 40px rgba(227, 139, 41, 0.8)',
                '0 0 20px rgba(227, 139, 41, 0.5)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />

          {/* Shimmer effect on hover */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100"
            initial={{ x: '-100%' }}
            whileHover={{
              x: '100%',
              transition: { duration: 0.6, ease: 'easeInOut' },
            }}
          />

          <span className="relative z-10 tracking-wide drop-shadow-lg">BOOK NOW!</span>
        </motion.button>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <ChevronDown className="w-8 h-8 text-amber opacity-60" />
      </motion.div>

      {/* Ambient Glow */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-1/3 bg-amber/10 blur-[120px] rounded-full" />
    </section>
  );
};

export default HeroSection;
