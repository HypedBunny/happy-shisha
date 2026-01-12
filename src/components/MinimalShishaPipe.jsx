import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

const MinimalShishaPipe = ({ className = '' }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`${className} relative cursor-pointer`}
      style={{ overflow: 'visible' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.svg
        viewBox="-50 -80 400 600"
        className="w-full h-full drop-shadow-2xl"
        style={{ overflow: 'visible' }}
        animate={{ scale: isHovered ? 1.05 : 1 }}
        transition={{ duration: 0.3 }}
      >
        <defs>
          <linearGradient id="glassGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(100, 100, 100, 0.3)" />
            <stop offset="30%" stopColor="rgba(180, 180, 180, 0.5)" />
            <stop offset="70%" stopColor="rgba(150, 150, 150, 0.4)" />
            <stop offset="100%" stopColor="rgba(80, 80, 80, 0.3)" />
          </linearGradient>
          <linearGradient id="metalGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(180, 120, 30, 0.7)" />
            <stop offset="50%" stopColor="rgba(227, 139, 41, 0.9)" />
            <stop offset="100%" stopColor="rgba(180, 120, 30, 0.7)" />
          </linearGradient>
          <radialGradient id="waterGradient">
            <stop offset="0%" stopColor="rgba(100, 180, 255, 0.4)" />
            <stop offset="50%" stopColor="rgba(70, 150, 230, 0.5)" />
            <stop offset="100%" stopColor="rgba(50, 120, 200, 0.3)" />
          </radialGradient>
          <radialGradient id="coalGlow">
            <stop offset="0%" stopColor="rgba(255, 100, 30, 0.9)" />
            <stop offset="50%" stopColor="rgba(227, 139, 41, 0.7)" />
            <stop offset="100%" stopColor="rgba(200, 80, 20, 0.5)" />
          </radialGradient>
          <filter id="glassBlur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.5"/>
          </filter>
        </defs>

        {/* Round glass base - perfect circle with transparency */}
        <motion.circle
          cx="150"
          cy="400"
          r="80"
          fill="url(#glassGradient)"
          stroke="rgba(227, 139, 41, 0.6)"
          strokeWidth="2.5"
          filter="url(#glassBlur)"
          initial={{ opacity: 0.5 }}
          animate={{
            opacity: isHovered ? 0.95 : 0.6,
            strokeWidth: isHovered ? 3 : 2.5,
            stroke: isHovered ? 'rgba(227, 139, 41, 0.8)' : 'rgba(227, 139, 41, 0.6)',
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Glass shine/highlight on left side */}
        <motion.ellipse
          cx="110"
          cy="380"
          rx="25"
          ry="50"
          fill="rgba(255, 255, 255, 0.15)"
          filter="blur(8px)"
          animate={{
            opacity: isHovered ? 0.3 : 0.2,
          }}
        />

        {/* Water inside base - bottom half */}
        <motion.path
          d="M 85 400 Q 85 455 150 455 Q 215 455 215 400 Z"
          fill="url(#waterGradient)"
          opacity="0.7"
          animate={{
            opacity: isHovered ? [0.7, 0.9, 0.7] : [0.5, 0.7, 0.5],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Water surface shimmer */}
        <motion.ellipse
          cx="150"
          cy="400"
          rx="70"
          ry="8"
          fill="rgba(100, 180, 255, 0.3)"
          filter="blur(2px)"
          animate={{
            opacity: isHovered ? [0.3, 0.6, 0.3] : [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Base reflection highlight */}
        <motion.ellipse
          cx="140"
          cy="375"
          rx="45"
          ry="18"
          fill="rgba(255, 255, 255, 0.2)"
          filter="blur(6px)"
          animate={{
            opacity: isHovered ? [0.3, 0.5, 0.3] : [0.2, 0.3, 0.2],
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />

        {/* Base top neck - narrow opening */}
        <motion.path
          d="M 145 310 Q 145 305 150 305 Q 155 305 155 310 L 155 325 L 145 325 Z"
          fill="url(#metalGradient)"
          stroke="rgba(227, 139, 41, 0.6)"
          strokeWidth="1.5"
          animate={{
            opacity: isHovered ? 0.9 : 0.6,
            stroke: isHovered ? 'rgba(227, 139, 41, 0.8)' : 'rgba(227, 139, 41, 0.6)',
          }}
        />

        {/* Downstem going into water */}
        <motion.line
          x1="150"
          y1="280"
          x2="150"
          y2="430"
          stroke="rgba(180, 180, 180, 0.5)"
          strokeWidth="2.5"
          strokeLinecap="round"
          animate={{
            opacity: isHovered ? 0.9 : 0.5,
            stroke: isHovered ? 'rgba(200, 200, 200, 0.8)' : 'rgba(180, 180, 180, 0.5)',
          }}
        />

        {/* Thin main stem with metallic shine */}
        <motion.line
          x1="150"
          y1="100"
          x2="150"
          y2="310"
          stroke="url(#metalGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          animate={{
            strokeWidth: isHovered ? 4 : 3,
            opacity: isHovered ? 1 : 0.7,
          }}
        />

        {/* Stem highlight for realism */}
        <motion.line
          x1="148"
          y1="105"
          x2="148"
          y2="305"
          stroke="rgba(255, 220, 150, 0.3)"
          strokeWidth="1"
          strokeLinecap="round"
          animate={{
            opacity: isHovered ? 0.5 : 0.3,
          }}
        />

        {/* Decorative bands on stem */}
        {[140, 180, 220, 260].map((y, i) => (
          <motion.g key={`band-${i}`}>
            <motion.rect
              x="146"
              y={y}
              width="8"
              height="5"
              fill="url(#metalGradient)"
              stroke="rgba(180, 120, 30, 0.7)"
              strokeWidth="0.5"
              rx="1"
              animate={{
                opacity: isHovered ? 1 : 0.7,
                stroke: isHovered ? 'rgba(227, 139, 41, 1)' : 'rgba(180, 120, 30, 0.7)',
              }}
              transition={{ delay: i * 0.1 }}
            />
            {/* Band highlight */}
            <rect
              x="146.5"
              y={y + 1}
              width="3"
              height="1.5"
              fill="rgba(255, 200, 100, 0.3)"
              rx="0.5"
            />
          </motion.g>
        ))}

        {/* Hose port on base side */}
        <motion.circle
          cx="80"
          cy="400"
          r="5"
          fill="url(#metalGradient)"
          stroke="rgba(180, 120, 30, 0.7)"
          strokeWidth="1.5"
          animate={{
            opacity: isHovered ? 1 : 0.7,
          }}
        />

        {/* Curved hose with gradient */}
        <motion.path
          d="M 80 400 Q 35 395 20 375 Q 10 360 12 340 L 15 330"
          stroke="rgba(120, 120, 120, 0.6)"
          strokeWidth="7"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0.5 }}
          animate={{
            pathLength: 1,
            stroke: isHovered ? 'rgba(140, 140, 140, 0.9)' : 'rgba(120, 120, 120, 0.6)',
            strokeWidth: isHovered ? 8 : 7,
            opacity: isHovered ? 0.95 : 0.6,
          }}
          transition={{ duration: 2, ease: 'easeInOut' }}
        />

        {/* Hose highlight */}
        <motion.path
          d="M 80 398 Q 37 393 22 373 Q 12 358 14 338 L 16 330"
          stroke="rgba(180, 180, 180, 0.3)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0.3 }}
          animate={{
            pathLength: 1,
            opacity: isHovered ? 0.5 : 0.3,
          }}
          transition={{ duration: 2, ease: 'easeInOut' }}
        />

        {/* Hose texture lines */}
        {[0, 0.25, 0.5, 0.75].map((offset, i) => (
          <motion.line
            key={`hose-line-${i}`}
            x1={80 - offset * 68}
            y1={400 - offset * 70}
            x2={80 - offset * 68 + 2}
            y2={400 - offset * 70}
            stroke="rgba(80, 80, 80, 0.7)"
            strokeWidth="1"
            strokeLinecap="round"
            initial={{ opacity: 0.6 }}
            animate={{
              opacity: isHovered ? [0.7, 1, 0.7] : [0.6, 0.8, 0.6]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}

        {/* Mouthpiece tip */}
        <motion.g
          animate={{
            scale: isHovered ? [1, 1.15, 1] : 1,
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <rect
            x="8"
            y="323"
            width="14"
            height="16"
            rx="4"
            fill="url(#metalGradient)"
            stroke="rgba(180, 120, 30, 0.7)"
            strokeWidth="1.5"
            opacity={isHovered ? 1 : 0.7}
          />
          {/* Mouthpiece highlight */}
          <rect
            x="10"
            y="325"
            width="5"
            height="8"
            rx="2"
            fill="rgba(255, 220, 150, 0.3)"
          />
        </motion.g>

        {/* Wide bowl on top - like image with transparency */}
        <motion.path
          d="M 110 80 L 115 100 Q 120 110 150 110 Q 180 110 185 100 L 190 80 Q 190 65 150 65 Q 110 65 110 80 Z"
          fill="rgba(139, 69, 19, 0.6)"
          stroke="rgba(227, 139, 41, 0.7)"
          strokeWidth="3"
          animate={{
            fill: isHovered ? 'rgba(139, 69, 19, 0.9)' : 'rgba(139, 69, 19, 0.6)',
            strokeWidth: isHovered ? 3.5 : 3,
            stroke: isHovered ? 'rgba(227, 139, 41, 0.9)' : 'rgba(227, 139, 41, 0.7)',
            opacity: isHovered ? 1 : 0.8,
          }}
        />

        {/* Bowl exterior highlight */}
        <motion.path
          d="M 115 75 Q 120 70 150 70 Q 180 70 185 75"
          stroke="rgba(227, 139, 41, 0.4)"
          strokeWidth="2"
          fill="none"
          animate={{
            opacity: isHovered ? 0.6 : 0.3,
          }}
        />

        {/* Bowl top rim - wide opening */}
        <motion.ellipse
          cx="150"
          cy="65"
          rx="40"
          ry="8"
          fill="url(#metalGradient)"
          stroke="rgba(180, 120, 30, 0.7)"
          strokeWidth="2"
          animate={{
            opacity: isHovered ? 1 : 0.7,
          }}
        />

        {/* Tobacco in bowl */}
        <motion.ellipse
          cx="150"
          cy="90"
          rx="30"
          ry="10"
          fill="rgba(80, 40, 20, 0.7)"
          stroke="rgba(139, 69, 19, 0.8)"
          strokeWidth="1.5"
          animate={{
            opacity: isHovered ? 0.95 : 0.7,
          }}
        />

        {/* Foil on top with metallic look */}
        <motion.ellipse
          cx="150"
          cy="72"
          rx="38"
          ry="6"
          fill="rgba(200, 200, 200, 0.5)"
          stroke="rgba(220, 220, 220, 0.7)"
          strokeWidth="2"
          animate={{
            opacity: isHovered ? 0.9 : 0.6,
          }}
        />

        {/* Foil shine */}
        <motion.ellipse
          cx="140"
          cy="71"
          rx="15"
          ry="3"
          fill="rgba(255, 255, 255, 0.4)"
          filter="blur(2px)"
          animate={{
            opacity: isHovered ? 0.6 : 0.3,
          }}
        />

        {/* Foil holes */}
        {[-20, -10, 0, 10, 20].map((offset, i) => (
          <circle
            key={`hole-${i}`}
            cx={150 + offset}
            cy="72"
            r="2"
            fill="rgba(40, 40, 40, 0.9)"
          />
        ))}

        {/* Hot coals on foil */}
        <motion.circle
          cx="135"
          cy="60"
          r="9"
          fill="url(#coalGlow)"
          stroke="rgba(255, 120, 40, 0.9)"
          strokeWidth="2"
          animate={{
            fill: isHovered
              ? ['url(#coalGlow)', 'rgba(255, 100, 30, 0.95)', 'url(#coalGlow)']
              : 'url(#coalGlow)',
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />

        <motion.circle
          cx="165"
          cy="60"
          r="9"
          fill="url(#coalGlow)"
          stroke="rgba(255, 120, 40, 0.9)"
          strokeWidth="2"
          animate={{
            fill: isHovered
              ? ['url(#coalGlow)', 'rgba(255, 100, 30, 0.95)', 'url(#coalGlow)']
              : 'url(#coalGlow)',
          }}
          transition={{ duration: 1.8, repeat: Infinity, delay: 0.3 }}
        />

        <motion.circle
          cx="150"
          cy="68"
          r="7"
          fill="url(#coalGlow)"
          stroke="rgba(255, 120, 40, 0.9)"
          strokeWidth="2"
          animate={{
            fill: isHovered
              ? ['url(#coalGlow)', 'rgba(255, 100, 30, 0.95)', 'url(#coalGlow)']
              : 'url(#coalGlow)',
          }}
          transition={{ duration: 1.6, repeat: Infinity, delay: 0.6 }}
        />

        {/* Coal glow effect */}
        <motion.ellipse
          cx="150"
          cy="63"
          rx="45"
          ry="18"
          fill="rgba(255, 120, 40, 0.5)"
          filter="blur(10px)"
          animate={{
            opacity: isHovered ? [0.6, 1, 0.6] : [0.5, 0.7, 0.5],
            scale: isHovered ? [1, 1.3, 1] : [1, 1.15, 1],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* SMOKE PARTICLES rising from coals */}
        {[...Array(isHovered ? 15 : 8)].map((_, i) => (
          <motion.circle
            key={`smoke-${i}`}
            cx={145 + (i % 3) * 10 - 10}
            cy="55"
            r={5 + Math.random() * 3}
            fill={`rgba(220, 220, 220, ${0.7 + Math.random() * 0.2})`}
            filter="blur(5px)"
            initial={{ opacity: 0, y: 0 }}
            animate={{
              y: [-10, -100 - Math.random() * 60],
              x: [(i % 3 - 1) * 8, (i % 3 - 1) * 30],
              opacity: [0, 0.95, 0.7, 0],
              scale: [0.8, 2.2, 3.5],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              delay: i * 0.25,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
        ))}

        {/* BLOWN SMOKE from mouthpiece - only on hover */}
        {isHovered && (
          <>
            {[...Array(10)].map((_, i) => (
              <motion.circle
                key={`blown-smoke-${i}`}
                cx="15"
                cy="331"
                r={16 + i * 6}
                fill={`rgba(220, 220, 220, ${0.8 - i * 0.07})`}
                filter="blur(12px)"
                initial={{ x: 0, y: 0, scale: 0.3, opacity: 0 }}
                animate={{
                  x: [0, -100 - i * 20],
                  y: [0, -70 - i * 15],
                  scale: [0.3, 2.8 + i * 0.6],
                  opacity: [0, 0.95, 0.6, 0],
                }}
                transition={{
                  duration: 2.6 + i * 0.4,
                  delay: i * 0.16,
                  repeat: Infinity,
                  ease: 'easeOut',
                }}
              />
            ))}
          </>
        )}
      </motion.svg>

      {/* Hover prompt */}
      {!isHovered && (
        <motion.div
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-amber text-sm font-light tracking-wide opacity-70"
          animate={{ opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Flame className="w-4 h-4 inline mr-2" />
          Hover to ignite
        </motion.div>
      )}
    </div>
  );
};

export default MinimalShishaPipe;
