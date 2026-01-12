import React from 'react';
import { motion } from 'framer-motion';

const ShishaPipeIllustration = ({ className = '' }) => {
  return (
    <motion.svg
      viewBox="0 0 200 400"
      className={`${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
    >
      {/* Base (water bowl) - Complete vase shape */}
      <motion.path
        d="M 60 320 Q 50 340 48 360 Q 48 380 100 380 Q 152 380 152 360 Q 150 340 140 320 Z"
        stroke="rgba(227, 139, 41, 0.5)"
        strokeWidth="2"
        fill="rgba(14, 14, 14, 0.6)"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 3, delay: 0.5 }}
      />

      {/* Base neck connection */}
      <motion.rect
        x="95"
        y="310"
        width="10"
        height="12"
        stroke="rgba(227, 139, 41, 0.5)"
        strokeWidth="1.5"
        fill="rgba(227, 139, 41, 0.1)"
        rx="1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 1 }}
      />

      {/* Water level */}
      <motion.ellipse
        cx="100"
        cy="345"
        rx="40"
        ry="10"
        stroke="rgba(100, 180, 255, 0.4)"
        strokeWidth="1"
        fill="rgba(100, 180, 255, 0.15)"
        animate={{
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      {/* Water shimmer effect */}
      <motion.ellipse
        cx="100"
        cy="345"
        rx="25"
        ry="5"
        fill="rgba(150, 200, 255, 0.3)"
        filter="blur(2px)"
        animate={{
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      {/* Downstem */}
      <motion.line
        x1="100"
        y1="280"
        x2="100"
        y2="355"
        stroke="rgba(227, 139, 41, 0.4)"
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, delay: 1 }}
      />

      {/* Stem (main body) */}
      <motion.rect
        x="95"
        y="120"
        width="10"
        height="160"
        stroke="rgba(227, 139, 41, 0.4)"
        strokeWidth="1.5"
        fill="rgba(227, 139, 41, 0.03)"
        rx="2"
        initial={{ height: 0, y: 280 }}
        animate={{ height: 160, y: 120 }}
        transition={{ duration: 2, delay: 1.5 }}
      />

      {/* Decorative bands on stem */}
      {[140, 180, 220, 260].map((y, i) => (
        <motion.line
          key={i}
          x1="90"
          y1={y}
          x2="110"
          y2={y}
          stroke="rgba(227, 139, 41, 0.5)"
          strokeWidth="2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 2 + i * 0.1 }}
        />
      ))}

      {/* Hose port */}
      <motion.line
        x1="95"
        y1="200"
        x2="40"
        y2="200"
        stroke="rgba(227, 139, 41, 0.4)"
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, delay: 2.5 }}
      />

      {/* Hose - more detailed and visible */}
      <motion.path
        d="M 40 200 Q 30 205 25 215 Q 18 230 15 245 Q 13 260 18 275"
        stroke="rgba(180, 180, 180, 0.6)"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, delay: 3 }}
      />

      {/* Hose inner detail */}
      <motion.path
        d="M 40 200 Q 30 205 25 215 Q 18 230 15 245 Q 13 260 18 275"
        stroke="rgba(100, 100, 100, 0.4)"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, delay: 3.2 }}
      />

      {/* Hose ribbing texture */}
      {[210, 220, 230, 240, 250, 260].map((offset, i) => (
        <motion.line
          key={`rib-${i}`}
          x1={40 - i * 3}
          y1={200 + i * 12}
          x2={36 - i * 3}
          y2={202 + i * 12}
          stroke="rgba(130, 130, 130, 0.3)"
          strokeWidth="1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ duration: 0.3, delay: 3.5 + i * 0.1 }}
        />
      ))}

      {/* Mouthpiece handle */}
      <motion.ellipse
        cx="18"
        cy="275"
        rx="8"
        ry="12"
        stroke="rgba(227, 139, 41, 0.6)"
        strokeWidth="1.5"
        fill="rgba(80, 50, 30, 0.6)"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 4 }}
      />

      {/* Mouthpiece tip */}
      <motion.rect
        x="14"
        y="283"
        width="8"
        height="10"
        rx="2"
        stroke="rgba(227, 139, 41, 0.5)"
        strokeWidth="1.5"
        fill="rgba(227, 139, 41, 0.2)"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 4.2 }}
      />

      {/* Bowl connector */}
      <motion.line
        x1="100"
        y1="120"
        x2="100"
        y2="95"
        stroke="rgba(227, 139, 41, 0.5)"
        strokeWidth="3"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, delay: 3.2 }}
      />

      {/* Bowl (top) - More detailed clay bowl */}
      <motion.path
        d="M 75 95 L 78 110 Q 78 118 100 118 Q 122 118 122 110 L 125 95 Q 125 88 100 88 Q 75 88 75 95 Z"
        stroke="rgba(227, 139, 41, 0.6)"
        strokeWidth="2"
        fill="rgba(139, 69, 19, 0.3)"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, delay: 3.5 }}
      />

      {/* Bowl rim detail */}
      <motion.ellipse
        cx="100"
        cy="88"
        rx="12"
        ry="3"
        stroke="rgba(227, 139, 41, 0.5)"
        strokeWidth="1.5"
        fill="rgba(227, 139, 41, 0.1)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 4 }}
      />

      {/* Tobacco in bowl */}
      <motion.ellipse
        cx="100"
        cy="105"
        rx="18"
        ry="6"
        stroke="rgba(139, 69, 19, 0.6)"
        strokeWidth="1"
        fill="rgba(139, 69, 19, 0.4)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 4.5 }}
      />

      {/* Foil on bowl */}
      <motion.ellipse
        cx="100"
        cy="93"
        rx="20"
        ry="4"
        stroke="rgba(192, 192, 192, 0.6)"
        strokeWidth="1.5"
        fill="rgba(192, 192, 192, 0.2)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 5 }}
      />

      {/* Foil holes (perforations) */}
      {[85, 95, 105, 115].map((x, i) => (
        <motion.circle
          key={`hole-${i}`}
          cx={x}
          cy="93"
          r="0.8"
          fill="rgba(50, 50, 50, 0.6)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 5.3 + i * 0.1 }}
        />
      ))}

      {/* Charcoal pieces on top */}
      <motion.rect
        x="85"
        y="78"
        width="12"
        height="10"
        rx="2"
        stroke="rgba(227, 139, 41, 0.7)"
        strokeWidth="1"
        fill="rgba(50, 30, 20, 0.8)"
        initial={{ opacity: 0, y: 68 }}
        animate={{ opacity: 1, y: 78 }}
        transition={{ duration: 1, delay: 5.5 }}
      />

      <motion.rect
        x="103"
        y="76"
        width="13"
        height="11"
        rx="2"
        stroke="rgba(227, 139, 41, 0.7)"
        strokeWidth="1"
        fill="rgba(50, 30, 20, 0.8)"
        initial={{ opacity: 0, y: 66 }}
        animate={{ opacity: 1, y: 76 }}
        transition={{ duration: 1, delay: 5.7 }}
      />

      {/* Glowing coal effect - multiple pieces */}
      <motion.rect
        x="85"
        y="78"
        width="12"
        height="10"
        rx="2"
        fill="rgba(227, 139, 41, 0.6)"
        filter="blur(3px)"
        animate={{
          opacity: [0.4, 1, 0.4],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      <motion.rect
        x="103"
        y="76"
        width="13"
        height="11"
        rx="2"
        fill="rgba(227, 139, 41, 0.6)"
        filter="blur(3px)"
        animate={{
          opacity: [0.5, 1, 0.5],
        }}
        transition={{ duration: 2.2, repeat: Infinity, delay: 0.3 }}
      />

      {/* Smoke particles rising from coal - more visible */}
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.circle
          key={`smoke-${i}`}
          cx={88 + i * 6}
          cy="75"
          r="4"
          fill="rgba(220, 220, 220, 0.6)"
          filter="blur(3px)"
          animate={{
            y: [-5, -50],
            x: [(i - 2) * 2, (i - 2) * 8],
            opacity: [0.7, 0],
            scale: [1, 2.5],
          }}
          transition={{
            duration: 4,
            delay: i * 0.6 + 6,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      ))}

      {/* Wind cover (optional decorative element) */}
      <motion.circle
        cx="100"
        cy="100"
        r="22"
        stroke="rgba(227, 139, 41, 0.2)"
        strokeWidth="1"
        fill="none"
        strokeDasharray="4 4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5, rotate: 360 }}
        transition={{
          opacity: { duration: 1, delay: 5.5 },
          rotate: { duration: 30, repeat: Infinity, ease: 'linear' },
        }}
      />
    </motion.svg>
  );
};

export default ShishaPipeIllustration;
