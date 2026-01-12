import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const ExperienceSection = () => {
  const phrases = [
    'Curated flavours',
    'Clean, premium setup',
    'Private events',
    'Lounges • Parties • Celebrations',
  ];

  return (
    <section className="relative min-h-screen w-full bg-gradient-to-b from-charcoal to-black py-32 px-6">
      {/* Background Smoke Effect */}
      <motion.div
        className="absolute inset-0 opacity-10"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.1 }}
        transition={{ duration: 2 }}
      >
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-smoke/30 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber/20 rounded-full blur-[150px]" />
      </motion.div>

      <div className="relative z-10 max-w-5xl mx-auto">
        <motion.h2
          className="text-4xl md:text-6xl font-light text-center mb-20 text-soft-white tracking-wide"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          The Experience
        </motion.h2>

        <div className="space-y-16">
          {phrases.map((phrase, index) => (
            <PhraseReveal key={index} phrase={phrase} delay={index * 0.3} />
          ))}
        </div>
      </div>
    </section>
  );
};

const PhraseReveal = ({ phrase, delay }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.5,
  });

  return (
    <motion.div
      ref={ref}
      className="text-center"
      initial={{ opacity: 0, y: 80 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1.2, delay, ease: 'easeOut' }}
    >
      <motion.p
        className="text-3xl md:text-5xl font-light text-soft-white tracking-wider"
        whileHover={{ scale: 1.05, color: '#E38B29' }}
        transition={{ duration: 0.3 }}
      >
        {phrase}
      </motion.p>
      <motion.div
        className="w-24 h-0.5 bg-amber mx-auto mt-8"
        initial={{ width: 0 }}
        animate={inView ? { width: 96 } : {}}
        transition={{ duration: 0.8, delay: delay + 0.4 }}
      />
    </motion.div>
  );
};

export default ExperienceSection;
