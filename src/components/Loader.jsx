import React from 'react';
import { motion } from 'framer-motion';
import { Wind } from 'lucide-react';

const Loader = () => {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated Background Glow */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber/20 rounded-full blur-[150px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Loader Content */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Animated Icon */}
        <motion.div
          className="relative"
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <motion.div
            className="w-24 h-24 rounded-full border-4 border-amber/30 border-t-amber"
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{
              rotate: -360,
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            <Wind className="w-10 h-10 text-amber" />
          </motion.div>
        </motion.div>

        {/* Brand Text */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-4xl font-light text-soft-white tracking-wider mb-2">
            Happy Shisha
          </h2>
          <motion.p
            className="text-smoke text-sm tracking-widest"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            PREMIUM EXPERIENCE
          </motion.p>
        </motion.div>

        {/* Smoke Particles */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`smoke-${i}`}
            className="absolute w-2 h-2 rounded-full bg-smoke/30"
            style={{
              left: `${50 + (i - 2) * 10}%`,
              bottom: '30%',
            }}
            animate={{
              y: [-20, -100],
              opacity: [0, 0.6, 0],
              scale: [1, 2, 3],
            }}
            transition={{
              duration: 3,
              delay: i * 0.4,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default Loader;
