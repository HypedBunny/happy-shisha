import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

const Footer = () => {
    const navigate = useNavigate();
    const whatsappNumber = '27810466658';
    const whatsappMessage = encodeURIComponent(
        "Hi! I'm interested in booking your premium mobile shisha service."
    );

    return (
        <footer className="relative w-full bg-charcoal/50 border-t border-amber/20 backdrop-blur-sm">
            {/* Ambient top glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-amber/40 to-transparent" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">

                    {/* Brand */}
                    <div className="flex flex-col items-center md:items-start gap-4">
                        <Link to="/">
                            <img
                                src="/logo.png"
                                alt="Happy Shisha Logo"
                                loading="lazy"
                                className="h-16 w-auto object-contain filter drop-shadow-lg"
                            />
                        </Link>
                        <p className="text-smoke/70 text-sm font-light leading-relaxed text-center md:text-left max-w-xs">
                            Premium mobile shisha &amp; hookah catering — delivered to your event, wherever the night takes you.
                        </p>
                    </div>

                    {/* Navigation */}
                    <div className="flex flex-col items-center gap-4">
                        <h3 className="text-amber/80 text-xs uppercase tracking-[0.3em] font-medium mb-2">
                            Navigate
                        </h3>
                        <Link
                            to="/"
                            className="text-smoke hover:text-soft-white transition-colors duration-200 text-sm font-light tracking-wide"
                        >
                            Home
                        </Link>
                        <Link
                            to="/#flavors"
                            className="text-smoke hover:text-soft-white transition-colors duration-200 text-sm font-light tracking-wide"
                        >
                            Flavors
                        </Link>
                        <Link
                            to="/book"
                            className="text-smoke hover:text-soft-white transition-colors duration-200 text-sm font-light tracking-wide"
                        >
                            Book Now
                        </Link>
                    </div>

                    {/* CTA */}
                    <div className="flex flex-col items-center md:items-end gap-5">
                        <h3 className="text-amber/80 text-xs uppercase tracking-[0.3em] font-medium">
                            Ready to book?
                        </h3>

                        <motion.button
                            onClick={() => navigate('/book')}
                            className="relative px-10 py-3.5 text-sm font-semibold text-charcoal bg-amber rounded-full overflow-hidden group shadow-lg"
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.97 }}
                        >
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100"
                                initial={{ x: '-100%' }}
                                whileHover={{ x: '100%', transition: { duration: 0.5 } }}
                            />
                            <span className="relative z-10 tracking-wide">BOOK NOW</span>
                        </motion.button>

                        <a
                            href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-smoke/70 hover:text-[#25D366] transition-colors duration-200 text-sm font-light"
                        >
                            <MessageCircle className="w-4 h-4" />
                            Chat on WhatsApp
                        </a>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-12 pt-6 border-t border-smoke/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-smoke/40 text-xs font-light tracking-wide">
                        © {new Date().getFullYear()} Happy Events. All rights reserved.
                    </p>
                    <p className="text-smoke/30 text-xs font-light italic">
                        For adults only · Private events · 18+
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
