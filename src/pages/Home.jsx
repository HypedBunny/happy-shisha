import React from 'react';
import HeroSection from '../components/HeroSection';
import SEOContent from '../components/SEOContent';

const Home = () => {
    return (
        <>
            <HeroSection />
            {/* We add margin bottom here so it doesn't overlap the whatsapp button too much or look cut off */}
            <div className="mb-24">
                <SEOContent />
            </div>
        </>
    );
};

export default Home;
