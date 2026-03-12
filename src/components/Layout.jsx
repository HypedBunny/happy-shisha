import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import WhatsAppButton from './WhatsAppButton';

const Layout = () => {
    return (
        <div className="relative w-full overflow-x-hidden bg-charcoal min-h-screen">
            <Navbar />
            {/* Add padding top to account for fixed navbar */}
            <div className="pt-20">
                <Outlet />
            </div>
            <WhatsAppButton />
        </div>
    );
};

export default Layout;
