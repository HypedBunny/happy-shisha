import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Palette, Truck, Wine } from 'lucide-react';

const BookingFlowSection = () => {
  const steps = [
    {
      icon: MessageSquare,
      title: 'Enquire',
      description: 'Reach out via WhatsApp or our contact form',
    },
    {
      icon: Palette,
      title: 'Choose vibe',
      description: 'Select your flavors and setup preferences',
    },
    {
      icon: Truck,
      title: 'We arrive',
      description: 'Professional setup at your location, on time',
    },
    {
      icon: Wine,
      title: 'You enjoy',
      description: 'Relax and savor the premium experience',
    },
  ];

  return (
    <section className="relative w-full bg-charcoal py-16 px-6">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber/20 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.h2
          className="text-4xl md:text-6xl font-light text-center mb-8 text-soft-white tracking-wide"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          Simple. Visual. No friction.
        </motion.h2>

        <motion.p
          className="text-center text-smoke text-lg md:text-xl mb-12 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          Four steps to an unforgettable experience
        </motion.p>

        {/* Desktop: Horizontal Flow */}
        <div className="hidden md:block">
          <div className="relative">
            {/* Connection Line */}
            <motion.div
              className="absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber to-transparent"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: 0.5 }}
            />

            <div className="grid grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <StepCard key={index} {...step} index={index} />
              ))}
            </div>
          </div>
        </div>

        {/* Mobile: Vertical Flow */}
        <div className="md:hidden space-y-12">
          {steps.map((step, index) => (
            <div key={index}>
              <StepCard {...step} index={index} />
              {index < steps.length - 1 && (
                <motion.div
                  className="w-0.5 h-16 bg-gradient-to-b from-amber to-transparent mx-auto my-4"
                  initial={{ scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 + 0.5 }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const StepCard = ({ icon: Icon, title, description, index }) => {
  return (
    <motion.div
      className="relative flex flex-col items-center text-center"
      initial={{ opacity: 0, y: 80 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: index * 0.2 }}
    >
      {/* Icon Circle */}
      <motion.div
        className="relative w-48 h-48 mb-6 rounded-full bg-gradient-to-br from-charcoal to-black border border-amber/30 flex items-center justify-center group cursor-pointer"
        whileHover={{ scale: 1.1, borderColor: 'rgba(227, 139, 41, 0.6)' }}
        transition={{ duration: 0.3 }}
      >
        {/* Glow Effect */}
        <motion.div
          className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: 'radial-gradient(circle at center, rgba(227, 139, 41, 0.2) 0%, transparent 70%)',
          }}
        />

        {/* Number Badge */}
        <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-amber flex items-center justify-center">
          <span className="text-charcoal font-medium text-lg">{index + 1}</span>
        </div>

        <motion.div
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.6 }}
        >
          <Icon className="w-16 h-16 text-amber" strokeWidth={1.5} />
        </motion.div>
      </motion.div>

      {/* Text Content */}
      <h3 className="text-2xl md:text-3xl font-light text-soft-white mb-3 tracking-wide">
        {title}
      </h3>

      <p className="text-smoke text-sm md:text-base font-light leading-relaxed max-w-xs">
        {description}
      </p>
    </motion.div>
  );
};

export default BookingFlowSection;
