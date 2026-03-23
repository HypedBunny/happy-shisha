import React from 'react';
import { motion } from 'framer-motion';
import HeroSection from '../components/HeroSection';
import SEOContent from '../components/SEOContent';
import ExperienceSection from '../components/ExperienceSection';
import VibeSection from '../components/VibeSection';
import TrustSection from '../components/TrustSection';
import FlavorsMenu from '../components/FlavorsMenu';
import FAQSection from '../components/FAQSection';

// Reusable image panel used between sections.
// No opacity animation — images are preloaded and must never flash in from invisible.
// Only translate so the panel slides up while staying fully visible.
const ImagePanel = ({ src, alt, objectPosition = 'center', fetchPriority = 'auto' }) => (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.div
            className="w-full h-64 md:h-96 rounded-2xl border border-amber/30 hover:border-amber hover:shadow-[0_0_20px_rgba(227,139,41,0.4)] overflow-hidden relative group shadow-2xl transition-all duration-500 ease-in-out"
            initial={{ y: 30 }}
            whileInView={{ y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-transparent to-black/60 z-10 pointer-events-none" />
            <img
                src={src}
                alt={alt}
                loading="eager"
                fetchPriority={fetchPriority}
                style={{ objectPosition }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
            />
        </motion.div>
    </div>
);

const Home = () => {
    return (
        <div>
            {/* ── Hero ── */}
            <HeroSection />

            {/* ── Intro copy ── */}
            <SEOContent />

            {/* ── Image 1 ── */}
            <ImagePanel
                src="/sexy-brunette-girl-seductive-black-clothes-smokes-hookah-while-sitting-counter-nightclub.jpg"
                alt="Brunette girl smoking shisha in nightclub"
                objectPosition="center 20%"
                fetchPriority="high"
            />

            {/* ── What we do ── */}
            <ExperienceSection />

            {/* ── Image 2 ── */}
            <ImagePanel
                src="/young-people-vaping-from-hookah-bar.jpg"
                alt="Young people enjoying shisha bar atmosphere"
            />

            {/* ── The Vibe ── */}
            <VibeSection />

            {/* ── Image 3 ── */}
            <ImagePanel
                src="/man-smoking-classic-shisha.jpg"
                alt="Man smoking classic shisha at our mobile shisha event"
            />

            {/* ── Trust / social proof ── */}
            <TrustSection />

            {/* ── Flavors ── */}
            <FlavorsMenu />

            {/* ── FAQ ── */}
            <FAQSection />
        </div>
    );
};

export default Home;
