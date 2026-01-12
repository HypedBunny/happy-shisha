import React from 'react';
import { motion } from 'framer-motion';

const SEOContent = () => {
  return (
    <section className="relative w-full bg-charcoal py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="glass-effect rounded-2xl p-8 md:p-12"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <h2 className="text-3xl md:text-4xl font-light text-soft-white mb-6 tracking-wide">
            Premium Mobile Hookah & Shisha Services
          </h2>

          <div className="space-y-4 text-smoke text-sm md:text-base font-light leading-relaxed">
            <p>
              Experience the finest <strong className="text-amber">mobile shisha</strong> and <strong className="text-amber">hookah rental</strong> service,
              delivering premium waterpipe experiences directly to your event. Our professional <strong className="text-amber">shisha catering</strong> service
              transforms any gathering into an unforgettable celebration.
            </p>

            <h3 className="text-xl font-medium text-soft-white mt-8 mb-4">
              Understanding the Hookah Experience
            </h3>

            <p>
              A shisha pipe, also known as a <strong className="text-amber">hookah</strong>, <strong className="text-amber">waterpipe</strong>,
              or <strong className="text-amber">narghile</strong>, is a water-cooled smoking instrument that delivers smooth,
              flavorful tobacco smoke. Our premium hookahs feature:
            </p>

            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Water-filled glass base for cooling and filtration</li>
              <li>Premium smoke chamber and downstem construction</li>
              <li>Food-grade silicone hoses with comfortable mouthpieces</li>
              <li>High-quality charcoal for optimal heat distribution</li>
              <li>Curated selection of exotic flavored tobacco (mu'assel)</li>
            </ul>

            <h3 className="text-xl font-medium text-soft-white mt-8 mb-4">
              Perfect for Every Occasion
            </h3>

            <p>
              Our <strong className="text-amber">mobile shisha lounge</strong> service is ideal for:
            </p>

            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong className="text-soft-white">Weddings:</strong> Luxury hookah stations for reception entertainment</li>
              <li><strong className="text-soft-white">Corporate Events:</strong> Professional shisha service for networking functions</li>
              <li><strong className="text-soft-white">Private Parties:</strong> Intimate hookah experiences for celebrations</li>
              <li><strong className="text-soft-white">Birthday Celebrations:</strong> Memorable shisha party rental</li>
              <li><strong className="text-soft-white">Lounge Nights:</strong> Transform any venue into a premium hookah lounge</li>
            </ul>

            <h3 className="text-xl font-medium text-soft-white mt-8 mb-4">
              Why Choose Our Mobile Hookah Service
            </h3>

            <p>
              Unlike traditional hookah bars, our <strong className="text-amber">mobile shisha delivery</strong> brings the lounge experience
              to you. We maintain hospital-grade hygiene standards, use only premium equipment, and offer an extensive flavor menu.
              Our <strong className="text-amber">hookah catering</strong> team handles complete setup, maintenance throughout your event,
              and professional cleanup—allowing you to focus on enjoying your celebration.
            </p>

            <p className="text-xs text-smoke/70 mt-8 italic">
              Note: Our service is intended for adult entertainment at private events. We prioritize cleanliness,
              quality, and responsible service for the ultimate shisha experience.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SEOContent;
