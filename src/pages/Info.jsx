import React from 'react';
import { motion } from 'framer-motion';
import ExperienceSection from '../components/ExperienceSection';
import VibeSection from '../components/VibeSection';
import TrustSection from '../components/TrustSection';

const Info = () => {
    return (
        <div className="pb-24">
            {/* Image space added above Experience section */}
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <motion.div
                    className="w-full h-64 md:h-96 rounded-2xl bg-charcoal-light border border-amber/30 hover:border-amber hover:shadow-[0_0_20px_rgba(227,139,41,0.4)] flex flex-col items-center justify-center overflow-hidden relative group shadow-2xl transition-all duration-500 ease-in-out"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-transparent to-black/60 z-10 pointer-events-none"></div>
                    <img
                        src="/sexy-brunette-girl-seductive-black-clothes-smokes-hookah-while-sitting-counter-nightclub.jpg"
                        alt="Brunette girl smoking hookah in nightclub"
                        className="w-full h-full object-cover object-[center_20%] group-hover:scale-105 transition-transform duration-700 ease-in-out"
                    />
                </motion.div>
            </div>

            <ExperienceSection />

            {/* Image space added between Experience and Vibe */}
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <motion.div
                    className="w-full h-64 md:h-96 rounded-2xl bg-charcoal-light border border-amber/30 hover:border-amber hover:shadow-[0_0_20px_rgba(227,139,41,0.4)] flex flex-col items-center justify-center overflow-hidden relative group shadow-2xl transition-all duration-500 ease-in-out"
                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <div className="absolute inset-0 bg-gradient-to-tl from-black/60 via-transparent to-black/60 z-10 pointer-events-none"></div>
                    <img
                        src="/young-people-vaping-from-hookah-bar.jpg"
                        alt="Young people enjoying hookah bar atmosphere"
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-in-out"
                    />
                </motion.div>
            </div>

            <VibeSection />

            {/* Image space added between Vibe and Trust */}
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <motion.div
                    className="w-full h-64 md:h-96 rounded-2xl bg-charcoal-light border border-amber/30 hover:border-amber hover:shadow-[0_0_20px_rgba(227,139,41,0.4)] flex flex-col items-center justify-center overflow-hidden relative group shadow-2xl transition-all duration-500 ease-in-out"
                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <div className="absolute inset-0 bg-gradient-to-tl from-black/60 via-transparent to-black/60 z-10 pointer-events-none"></div>
                    <img
                        src="/man-smoking-classic-shisha.jpg"
                        alt="Man smoking classic shisha"
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-in-out"
                    />
                </motion.div>
            </div>

            <TrustSection />
        </div>
    );
};

export default Info;
