import React from 'react';
import { motion } from 'framer-motion';

const SEOContent = () => {
  return (
    <section className="relative w-full bg-charcoal py-24 px-6">
      {/* Subtle Background Elements for depth */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber/10 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          className="space-y-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h2 className="text-4xl md:text-5xl font-light text-transparent bg-clip-text bg-gradient-to-r from-soft-white to-smoke mb-6 tracking-wide">
              Premium Mobile Hookah & Shisha Services
            </h2>
            <p className="text-smoke/90 text-lg md:text-xl font-light leading-relaxed max-w-2xl mx-auto">
              Experience the finest <strong className="text-amber font-medium">mobile shisha</strong> and <strong className="text-amber font-medium">hookah rental</strong> service,
              delivering premium waterpipe experiences directly to your event.
            </p>
          </motion.div>

          {/* Grid Content Layout */}
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 pt-8 border-t border-smoke/10">
            {/* Left Column */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h3 className="text-2xl font-light text-amber mb-6 flex items-center gap-3">
                <span className="w-8 h-[1px] bg-amber/50"></span>
                The Experience
              </h3>
              <p className="text-smoke text-base font-light leading-relaxed mb-6">
                A shisha pipe, also known as a hookah or narghile, is a water-cooled smoking instrument that delivers smooth,
                flavorful smoke. Our premium hookahs feature:
              </p>
              <ul className="space-y-3 text-smoke/90 font-light">
                <li className="flex items-start gap-2">
                  <span className="text-amber mt-1">✦</span>
                  Water-filled glass base for cooling
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber mt-1">✦</span>
                  Premium chamber & downstem
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber mt-1">✦</span>
                  Food-grade silicone hoses
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber mt-1">✦</span>
                  Curated exotic flavored tobacco
                </li>
              </ul>
            </motion.div>

            {/* Right Column */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <h3 className="text-2xl font-light text-amber mb-6 flex items-center gap-3">
                <span className="w-8 h-[1px] bg-amber/50"></span>
                Perfect For
              </h3>
              <p className="text-smoke text-base font-light leading-relaxed mb-6">
                Our <strong className="text-soft-white font-normal">mobile shisha lounge</strong> service is ideal for transforming any gathering into a memorable celebration.
              </p>
              <ul className="space-y-3 text-smoke/90 font-light">
                <li className="flex items-center gap-3 border-b border-smoke/10 pb-2">
                  <strong className="text-soft-white w-24">Weddings</strong>
                  <span className="text-sm">Luxury reception stations</span>
                </li>
                <li className="flex items-center gap-3 border-b border-smoke/10 pb-2">
                  <strong className="text-soft-white w-24">Corporate</strong>
                  <span className="text-sm">Professional networking</span>
                </li>
                <li className="flex items-center gap-3 border-b border-smoke/10 pb-2">
                  <strong className="text-soft-white w-24">Parties</strong>
                  <span className="text-sm">Intimate celebrations</span>
                </li>
                <li className="flex items-center gap-3 border-b border-smoke/10 pb-2">
                  <strong className="text-soft-white w-24">Lounges</strong>
                  <span className="text-sm">Premium venue setups</span>
                </li>
              </ul>
            </motion.div>
          </div>

          {/* Footer Note */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center pt-12"
          >
            <p className="text-sm text-smoke/50 italic tracking-wide max-w-xl mx-auto">
              We maintain hospital-grade hygiene standards. Our service is intended for adult entertainment at private events.
            </p>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
};

export default SEOContent;
