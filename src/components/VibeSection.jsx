import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Sparkles, Flame, Moon } from 'lucide-react';

const VibeSection = () => {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [-100, 100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 1, 0.3]);

  const vibeCards = [
    {
      icon: Flame,
      title: 'Set the mood',
      description: 'Premium hookah pipes with water filtration for a smooth, cool smoke',
    },
    {
      icon: Sparkles,
      title: '10+ Years Experience',
      description: 'Decade of expertise delivering exceptional shisha experiences',
    },
    {
      icon: Moon,
      title: 'Relax. We handle the rest',
      description: 'Professional setup with clean equipment and expert service',
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen w-full bg-black py-32 px-6 overflow-hidden"
    >
      {/* Parallax Background Elements */}
      <motion.div
        style={{ y: y1, opacity }}
        className="absolute top-20 right-10 w-72 h-72 bg-amber/10 rounded-full blur-[100px]"
      />
      <motion.div
        style={{ y: y2, opacity }}
        className="absolute bottom-20 left-10 w-96 h-96 bg-smoke/10 rounded-full blur-[120px]"
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.h2
          className="text-4xl md:text-6xl font-light text-center mb-20 text-soft-white tracking-wide"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          The Vibe
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {vibeCards.map((card, index) => (
            <VibeCard key={index} {...card} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

const VibeCard = ({ icon: Icon, title, description, index }) => {
  return (
    <motion.div
      className="group relative h-96 rounded-2xl overflow-hidden cursor-pointer"
      initial={{ opacity: 0, y: 100 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: index * 0.2 }}
      whileHover={{ scale: 1.05 }}
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-charcoal to-black border border-smoke/20" />

      {/* Hover Glow Effect */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'radial-gradient(circle at center, rgba(227, 139, 41, 0.1) 0%, transparent 70%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center p-8 text-center">
        <motion.div
          className="mb-6"
          whileHover={{ rotate: 360, scale: 1.2 }}
          transition={{ duration: 0.6 }}
        >
          <Icon className="w-16 h-16 text-amber" strokeWidth={1.5} />
        </motion.div>

        <h3 className="text-2xl md:text-3xl font-light text-soft-white mb-4 tracking-wide">
          {title}
        </h3>

        <p className="text-smoke text-sm md:text-base font-light leading-relaxed max-w-xs">
          {description}
        </p>

        {/* Bottom Accent Line */}
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-amber to-transparent"
          initial={{ width: 0 }}
          whileInView={{ width: '100%' }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: index * 0.2 + 0.5 }}
        />
      </div>

      {/* Corner Accent */}
      <div className="absolute top-4 right-4 w-12 h-12 border-t border-r border-amber/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </motion.div>
  );
};

export default VibeSection;
