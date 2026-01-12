import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Award, Sparkles, Clock, MessageCircle } from 'lucide-react';

const TrustSection = () => {
  const features = [
    {
      icon: Award,
      title: 'Consistent quality',
      description: 'Premium tobacco and pristine equipment every time',
    },
    {
      icon: Sparkles,
      title: 'Clean & professional',
      description: 'Hospital-grade hygiene standards for your peace of mind',
    },
    {
      icon: Clock,
      title: 'Always on time',
      description: 'Punctual setup so your event flows seamlessly',
    },
    {
      icon: MessageCircle,
      title: 'Easy WhatsApp booking',
      description: 'Quick responses and effortless communication',
    },
  ];

  return (
    <section className="relative min-h-screen w-full bg-gradient-to-b from-black to-charcoal py-32 px-6">
      {/* Ambient Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-amber/20 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-smoke/20 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.h2
          className="text-4xl md:text-6xl font-light text-center mb-8 text-soft-white tracking-wide"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          Why People Book Again
        </motion.h2>

        <motion.p
          className="text-center text-smoke text-lg md:text-xl mb-20 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          Experience the difference of true shisha craftsmanship
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} index={index} />
          ))}
        </div>

        {/* Stats Counter */}
        <div className="mt-32 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          <StatCounter end={500} label="Events Served" suffix="+" />
          <StatCounter end={98} label="Satisfaction Rate" suffix="%" />
          <StatCounter end={10} label="Years Experience" suffix="+" />
          <StatCounter end={24} label="Hour Support" suffix="/7" />
        </div>
      </div>
    </section>
  );
};

const FeatureCard = ({ icon: Icon, title, description, index }) => {
  return (
    <motion.div
      className="relative group"
      initial={{ opacity: 0, y: 80 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: index * 0.15 }}
    >
      <div className="relative p-8 h-full rounded-xl glass-effect group-hover:border-amber/30 transition-all duration-300">
        <motion.div
          className="mb-6"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ duration: 0.3 }}
        >
          <Icon className="w-12 h-12 text-amber" strokeWidth={1.5} />
        </motion.div>

        <h3 className="text-xl font-medium text-soft-white mb-3 tracking-wide">
          {title}
        </h3>

        <p className="text-smoke text-sm font-light leading-relaxed">
          {description}
        </p>

        {/* Hover Effect */}
        <motion.div
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at center, rgba(227, 139, 41, 0.05) 0%, transparent 70%)',
          }}
        />
      </div>
    </motion.div>
  );
};

const StatCounter = ({ end, label, suffix = '' }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.5,
  });

  const [count, setCount] = useState(0);

  useEffect(() => {
    if (inView) {
      let start = 0;
      const duration = 2000;
      const increment = end / (duration / 16);

      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(timer);
    }
  }, [inView, end]);

  return (
    <motion.div
      ref={ref}
      className="text-center"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.6 }}
    >
      <div className="text-4xl md:text-5xl font-light text-amber mb-2">
        {count}
        {suffix}
      </div>
      <div className="text-smoke text-sm font-light tracking-wider uppercase">
        {label}
      </div>
    </motion.div>
  );
};

export default TrustSection;
