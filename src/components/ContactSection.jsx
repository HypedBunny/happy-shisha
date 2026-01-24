import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Check } from 'lucide-react';
import MinimalShishaPipe from './MinimalShishaPipe';

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    eventType: '',
    date: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const eventTypes = [
    'Private Party',
    'Corporate Event',
    'Wedding',
    'Lounge Night',
    'Birthday Celebration',
    'Other',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.eventType) newErrors.eventType = 'Event type is required';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();

    if (Object.keys(newErrors).length === 0) {
      // Here you would typically send the data to your backend
      console.log('Form submitted:', formData);
      setSubmitted(true);

      // Reset form after 3 seconds
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          name: '',
          phone: '',
          eventType: '',
          date: '',
          message: '',
        });
      }, 3000);
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <section id="contact" className="relative min-h-screen w-full bg-gradient-to-b from-charcoal to-black py-32 px-6">
      {/* Glow Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber/30 rounded-full blur-[200px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto">
        <motion.h2
          className="text-4xl md:text-6xl font-light text-center mb-8 text-soft-white tracking-wide"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          Book Now!
        </motion.h2>

        <motion.p
          className="text-center text-smoke text-lg mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          Tell us about your event and we'll craft the perfect experience
        </motion.p>

        <motion.form
          onSubmit={handleSubmit}
          className="relative glass-effect rounded-2xl p-8 md:p-12"
          initial={{ opacity: 0, y: 80 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {!submitted ? (
            <>
              <div className="space-y-6">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-soft-white text-sm font-light mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-charcoal/50 border ${
                      errors.name ? 'border-red-500' : 'border-smoke/30'
                    } rounded-lg text-soft-white focus:border-amber focus:outline-none transition-colors`}
                    placeholder="Your name"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-soft-white text-sm font-light mb-2">
                    Phone (WhatsApp preferred)
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-charcoal/50 border ${
                      errors.phone ? 'border-red-500' : 'border-smoke/30'
                    } rounded-lg text-soft-white focus:border-amber focus:outline-none transition-colors`}
                    placeholder="+27 XX XXX XXXX"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>

                {/* Event Type */}
                <div>
                  <label htmlFor="eventType" className="block text-soft-white text-sm font-light mb-2">
                    Event type
                  </label>
                  <select
                    id="eventType"
                    name="eventType"
                    value={formData.eventType}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-charcoal/50 border ${
                      errors.eventType ? 'border-red-500' : 'border-smoke/30'
                    } rounded-lg text-soft-white focus:border-amber focus:outline-none transition-colors`}
                  >
                    <option value="">Select event type</option>
                    {eventTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {errors.eventType && (
                    <p className="text-red-500 text-xs mt-1">{errors.eventType}</p>
                  )}
                </div>

                {/* Date */}
                <div>
                  <label htmlFor="date" className="block text-soft-white text-sm font-light mb-2">
                    Event date (optional)
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-charcoal/50 border border-smoke/30 rounded-lg text-soft-white focus:border-amber focus:outline-none transition-colors"
                  />
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-soft-white text-sm font-light mb-2">
                    Message (optional)
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-charcoal/50 border border-smoke/30 rounded-lg text-soft-white focus:border-amber focus:outline-none transition-colors resize-none"
                    placeholder="Tell us more about your event..."
                  />
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                className="w-full mt-8 px-8 py-4 bg-gradient-to-r from-amber to-amber/80 text-charcoal font-semibold rounded-lg flex items-center justify-center gap-2 group overflow-hidden relative shadow-xl"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100"
                  initial={{ x: '-100%' }}
                  whileHover={{
                    x: '100%',
                    transition: { duration: 0.6, ease: 'easeInOut' },
                  }}
                />
                <span className="relative z-10">BOOK NOW!</span>
                <Send className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <p className="text-smoke text-xs text-center mt-6">
                We'll reply within 24 hours
              </p>
            </>
          ) : (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="w-20 h-20 bg-amber rounded-full flex items-center justify-center mx-auto mb-6"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Check className="w-10 h-10 text-charcoal" strokeWidth={3} />
              </motion.div>
              <h3 className="text-3xl font-light text-soft-white mb-4">
                Thank you!
              </h3>
              <p className="text-smoke text-lg">
                We'll be in touch within 24 hours
              </p>
            </motion.div>
          )}
        </motion.form>
      </div>
    </section>
  );
};

export default ContactSection;
