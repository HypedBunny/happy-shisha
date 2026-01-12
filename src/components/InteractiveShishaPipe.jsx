import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

const InteractiveShishaPipe = ({ className = '', position = 'center' }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`${className} relative`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.svg
        viewBox="0 0 300 500"
        className="w-full h-full drop-shadow-2xl"
        animate={{ scale: isHovered ? 1.05 : 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Base (glass water chamber) */}
        <defs>
          <linearGradient id="glassGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(100, 100, 100, 0.3)" />
            <stop offset="50%" stopColor="rgba(150, 150, 150, 0.2)" />
            <stop offset="100%" stopColor="rgba(80, 80, 80, 0.4)" />
          </linearGradient>
          <radialGradient id="waterGradient">
            <stop offset="0%" stopColor="rgba(100, 180, 255, 0.3)" />
            <stop offset="100%" stopColor="rgba(50, 120, 200, 0.2)" />
          </radialGradient>
          <radialGradient id="coalGlow">
            <stop offset="0%" stopColor="rgba(255, 100, 30, 0.9)" />
            <stop offset="50%" stopColor="rgba(227, 139, 41, 0.6)" />
            <stop offset="100%" stopColor="rgba(200, 80, 20, 0.3)" />
          </radialGradient>
        </defs>

        {/* Glass base */}
        <motion.path
          d="M 100 400 Q 80 420 80 440 Q 80 460 150 460 Q 220 460 220 440 Q 220 420 200 400 Z"
          fill="url(#glassGradient)"
          stroke="rgba(227, 139, 41, 0.6)"
          strokeWidth="2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        />

        {/* Water inside base */}
        <motion.ellipse
          cx="150"
          cy="430"
          rx="55"
          ry="15"
          fill="url(#waterGradient)"
          animate={{
            opacity: isHovered ? [0.4, 0.7, 0.4] : 0.5,
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Base reflection */}
        <motion.ellipse
          cx="140"
          cy="425"
          rx="30"
          ry="8"
          fill="rgba(255, 255, 255, 0.2)"
          filter="blur(3px)"
          animate={{
            opacity: isHovered ? [0.2, 0.4, 0.2] : 0.3,
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />

        {/* Base neck connector */}
        <rect
          x="145"
          y="390"
          width="10"
          height="15"
          fill="rgba(227, 139, 41, 0.4)"
          stroke="rgba(227, 139, 41, 0.7)"
          strokeWidth="1.5"
          rx="2"
        />

        {/* Downstem (tube going into water) */}
        <motion.line
          x1="150"
          y1="350"
          x2="150"
          y2="435"
          stroke="rgba(180, 180, 180, 0.6)"
          strokeWidth="3"
          strokeLinecap="round"
          animate={{
            opacity: isHovered ? 1 : 0.7,
          }}
        />

        {/* Main stem (body) */}
        <motion.rect
          x="140"
          y="180"
          width="20"
          height="210"
          fill="rgba(40, 40, 40, 0.8)"
          stroke="rgba(227, 139, 41, 0.8)"
          strokeWidth="2.5"
          rx="3"
          animate={{
            strokeWidth: isHovered ? 3 : 2.5,
          }}
        />

        {/* Decorative brass bands on stem */}
        {[220, 270, 320, 370].map((y, i) => (
          <motion.rect
            key={`band-${i}`}
            x="138"
            y={y}
            width="24"
            height="8"
            fill="rgba(227, 139, 41, 0.7)"
            stroke="rgba(180, 120, 30, 0.9)"
            strokeWidth="1"
            rx="1"
            animate={{
              fill: isHovered ? 'rgba(227, 139, 41, 0.9)' : 'rgba(227, 139, 41, 0.7)',
            }}
            transition={{ delay: i * 0.1 }}
          />
        ))}

        {/* Hose port connector */}
        <circle
          cx="140"
          cy="280"
          r="8"
          fill="rgba(227, 139, 41, 0.6)"
          stroke="rgba(180, 120, 30, 0.9)"
          strokeWidth="2"
        />

        {/* COILED HOSE - Multiple loops */}
        <motion.path
          d="M 140 280
             Q 100 285 80 295
             Q 60 305 65 325
             Q 70 340 85 345
             Q 100 350 110 340
             Q 115 330 105 320
             Q 95 312 85 315
             Q 75 320 78 330
             Q 82 340 90 342
             L 95 345"
          stroke="rgba(120, 120, 120, 0.8)"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{
            pathLength: 1,
            stroke: isHovered ? 'rgba(140, 140, 140, 0.9)' : 'rgba(120, 120, 120, 0.8)',
          }}
          transition={{ duration: 2, ease: 'easeInOut' }}
        />

        {/* Hose texture/ribbing */}
        {[0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9].map((offset, i) => (
          <motion.circle
            key={`hose-rib-${i}`}
            cx={140 - offset * 50}
            cy={280 + offset * 65}
            r="4"
            fill="rgba(100, 100, 100, 0.6)"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}

        {/* Mouthpiece */}
        <motion.g
          animate={{
            scale: isHovered ? [1, 1.1, 1] : 1,
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ellipse
            cx="95"
            cy="345"
            rx="12"
            ry="18"
            fill="rgba(80, 50, 30, 0.7)"
            stroke="rgba(227, 139, 41, 0.8)"
            strokeWidth="2"
          />
          <rect
            x="88"
            y="358"
            width="14"
            height="15"
            rx="3"
            fill="rgba(227, 139, 41, 0.6)"
            stroke="rgba(180, 120, 30, 0.9)"
            strokeWidth="1.5"
          />
        </motion.g>

        {/* Bowl connector */}
        <line
          x1="150"
          y1="180"
          x2="150"
          y2="155"
          stroke="rgba(227, 139, 41, 0.7)"
          strokeWidth="4"
        />

        {/* Clay bowl */}
        <motion.path
          d="M 115 145 L 120 165 Q 120 175 150 175 Q 180 175 180 165 L 185 145 Q 185 135 150 135 Q 115 135 115 145 Z"
          fill="rgba(139, 69, 19, 0.6)"
          stroke="rgba(227, 139, 41, 0.8)"
          strokeWidth="3"
          animate={{
            fill: isHovered ? 'rgba(139, 69, 19, 0.8)' : 'rgba(139, 69, 19, 0.6)',
          }}
        />

        {/* Bowl rim */}
        <ellipse
          cx="150"
          cy="135"
          rx="18"
          ry="5"
          fill="rgba(227, 139, 41, 0.3)"
          stroke="rgba(180, 120, 30, 0.9)"
          strokeWidth="2"
        />

        {/* Tobacco in bowl */}
        <ellipse
          cx="150"
          cy="158"
          rx="25"
          ry="8"
          fill="rgba(80, 40, 20, 0.7)"
          stroke="rgba(139, 69, 19, 0.8)"
          strokeWidth="1.5"
        />

        {/* Aluminum foil */}
        <ellipse
          cx="150"
          cy="145"
          rx="28"
          ry="6"
          fill="rgba(200, 200, 200, 0.4)"
          stroke="rgba(220, 220, 220, 0.7)"
          strokeWidth="2"
        />

        {/* Foil perforations */}
        {[-15, -7, 0, 7, 15].map((offset, i) => (
          <circle
            key={`hole-${i}`}
            cx={150 + offset}
            cy="145"
            r="1.5"
            fill="rgba(40, 40, 40, 0.8)"
          />
        ))}

        {/* Hot coals on top */}
        <motion.rect
          x="130"
          y="125"
          width="18"
          height="14"
          rx="3"
          fill="url(#coalGlow)"
          stroke="rgba(255, 120, 40, 0.8)"
          strokeWidth="1.5"
          animate={{
            fill: isHovered
              ? ['url(#coalGlow)', 'rgba(255, 100, 30, 0.95)', 'url(#coalGlow)']
              : 'url(#coalGlow)',
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />

        <motion.rect
          x="152"
          y="128"
          width="20"
          height="13"
          rx="3"
          fill="url(#coalGlow)"
          stroke="rgba(255, 120, 40, 0.8)"
          strokeWidth="1.5"
          animate={{
            fill: isHovered
              ? ['url(#coalGlow)', 'rgba(255, 100, 30, 0.95)', 'url(#coalGlow)']
              : 'url(#coalGlow)',
          }}
          transition={{ duration: 1.8, repeat: Infinity, delay: 0.3 }}
        />

        {/* Coal glow effect */}
        <motion.ellipse
          cx="150"
          cy="130"
          rx="30"
          ry="15"
          fill="rgba(255, 120, 40, 0.3)"
          filter="blur(8px)"
          animate={{
            opacity: isHovered ? [0.4, 0.8, 0.4] : [0.3, 0.5, 0.3],
            scale: isHovered ? [1, 1.2, 1] : [1, 1.1, 1],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* SMOKE PARTICLES rising from coals */}
        {[...Array(isHovered ? 12 : 6)].map((_, i) => (
          <motion.circle
            key={`smoke-${i}`}
            cx={145 + (i % 3) * 5 - 5}
            cy="120"
            r={3 + Math.random() * 2}
            fill={`rgba(220, 220, 220, ${0.3 + Math.random() * 0.2})`}
            filter="blur(3px)"
            initial={{ opacity: 0, y: 0 }}
            animate={{
              y: [-10, -80 - Math.random() * 40],
              x: [(i % 3 - 1) * 5, (i % 3 - 1) * 20],
              opacity: [0, 0.7, 0.4, 0],
              scale: [0.8, 1.5, 2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              delay: i * 0.3,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
        ))}

        {/* Wind cover (decorative top guard) */}
        <motion.circle
          cx="150"
          cy="135"
          r="35"
          stroke="rgba(227, 139, 41, 0.3)"
          strokeWidth="1.5"
          fill="none"
          strokeDasharray="6 4"
          animate={{
            rotate: 360,
            opacity: isHovered ? [0.3, 0.6, 0.3] : 0.4,
          }}
          transition={{
            rotate: { duration: 40, repeat: Infinity, ease: 'linear' },
            opacity: { duration: 3, repeat: Infinity },
          }}
        />
      </motion.svg>

      {/* Hover prompt */}
      {!isHovered && (
        <motion.div
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-amber text-sm font-light tracking-wide opacity-60"
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Flame className="w-4 h-4 inline mr-2" />
          Hover to ignite
        </motion.div>
      )}
    </div>
  );
};

export default InteractiveShishaPipe;
