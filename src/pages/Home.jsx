import React from 'react';
import HeroSection from '../components/HeroSection';
import SEOContent from '../components/SEOContent';
import ExperienceSection from '../components/ExperienceSection';
import VibeSection from '../components/VibeSection';
import TrustSection from '../components/TrustSection';
import FlavorsMenu from '../components/FlavorsMenu';
import FAQSection from '../components/FAQSection';

// Full-bleed image with gradient dissolves top and bottom.
// No animation, no container box — dissolves seamlessly into surrounding sections.
const ImagePanel = ({ src, alt, objectPosition = 'center', fetchPriority = 'auto' }) => (
    <div className="relative w-full h-72 md:h-[30rem] overflow-hidden">
        {/* Dissolve into section above */}
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#0E0E0E] to-transparent z-10 pointer-events-none" />
        {/* Dissolve into section below */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0E0E0E] to-transparent z-10 pointer-events-none" />
        <img
            src={src}
            alt={alt}
            loading="eager"
            fetchPriority={fetchPriority}
            style={{ objectPosition }}
            className="w-full h-full object-cover"
        />
    </div>
);

const Home = () => {
    return (
        <div>
            <HeroSection />
            <SEOContent />

            <ImagePanel
                src="/sexy-brunette-girl-seductive-black-clothes-smokes-hookah-while-sitting-counter-nightclub.jpg"
                alt="Brunette girl smoking shisha in nightclub"
                objectPosition="center 20%"
                fetchPriority="high"
            />

            <ExperienceSection />

            <ImagePanel
                src="/young-people-vaping-from-hookah-bar.jpg"
                alt="Young people enjoying shisha bar atmosphere"
            />

            <VibeSection />

            <ImagePanel
                src="/man-smoking-classic-shisha.jpg"
                alt="Man smoking classic shisha at our mobile shisha event"
            />

            <TrustSection />
            <FlavorsMenu />
            <FAQSection />
        </div>
    );
};

export default Home;
