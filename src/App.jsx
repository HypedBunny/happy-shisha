import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Loader from './components/Loader';
import HeroSection from './components/HeroSection';
import ExperienceSection from './components/ExperienceSection';
import VibeSection from './components/VibeSection';
import TrustSection from './components/TrustSection';
import BookingFlowSection from './components/BookingFlowSection';
import ContactSection from './components/ContactSection';
import SEOContent from './components/SEOContent';
import WhatsAppButton from './components/WhatsAppButton';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time (adjust as needed)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500); // 2.5 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {loading && <Loader key="loader" />}
      </AnimatePresence>

      {!loading && (
        <div className="relative w-full overflow-x-hidden bg-charcoal">
          <HeroSection />
          <ExperienceSection />
          <VibeSection />
          <TrustSection />
          <BookingFlowSection />
          <SEOContent />
          <ContactSection />
          <WhatsAppButton />
        </div>
      )}
    </>
  );
}

export default App;
