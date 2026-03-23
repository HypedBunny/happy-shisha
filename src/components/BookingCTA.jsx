import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const BookingCTA = ({ label = 'Book Your Experience' }) => {
    const navigate = useNavigate();
    return (
        <motion.div
            className="flex justify-center mt-16"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
        >
            <motion.button
                onClick={() => navigate('/book')}
                className="relative px-8 py-3 text-sm font-semibold text-charcoal bg-amber rounded-full overflow-hidden group shadow-lg tracking-widest uppercase"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.97 }}
            >
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%', transition: { duration: 0.5 } }}
                />
                <span className="relative z-10">{label}</span>
            </motion.button>
        </motion.div>
    );
};

export default BookingCTA;
