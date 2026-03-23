import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import WhatsAppButton from './WhatsAppButton';
import Footer from './Footer';
import { SmokeBackground } from './ui/spooky-smoke-animation';

const Layout = () => {
    return (
        <div className="relative w-full overflow-x-hidden min-h-screen">
            {/* Global WebGL smoke — fixed so it persists across all pages */}
            <div className="fixed inset-0 z-0">
                <SmokeBackground smokeColor="#E38B29" />
            </div>

            <Navbar />
            <div className="pt-20 relative z-[2]">
                <Outlet />
                <Footer />
            </div>
            <WhatsAppButton />
        </div>
    );
};

export default Layout;
