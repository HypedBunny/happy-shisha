import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import MinimalShishaPipe from './MinimalShishaPipe';

const HeroSection = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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

  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative h-screen w-full overflow-hidden flex items-center justify-center"
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
        <motion.h1
          className="text-5xl md:text-7xl lg:text-8xl font-light tracking-wider text-soft-white mb-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        >
          Premium Mobile Shisha
        </motion.h1>

        <motion.p
          className="text-xl md:text-3xl font-light text-smoke mb-12 tracking-wide"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
        >
          Wherever the night takes you
        </motion.p>

        <motion.button
          onClick={scrollToContact}
          className="relative px-12 py-4 text-lg font-medium text-soft-white bg-gradient-to-r from-amber to-amber/80 rounded-full overflow-hidden group"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="relative z-10">Get Pricing</span>
          <motion.div
            className="absolute inset-0 bg-amber/50"
            animate={{
              boxShadow: [
                '0 0 20px rgba(227, 139, 41, 0.4)',
                '0 0 40px rgba(227, 139, 41, 0.6)',
                '0 0 20px rgba(227, 139, 41, 0.4)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
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
