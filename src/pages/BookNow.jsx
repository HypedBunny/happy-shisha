import React from 'react';
import BookingFlowSection from '../components/BookingFlowSection';
import ContactSection from '../components/ContactSection';

const BookNow = () => {
    return (
        <div className="flex flex-col min-h-screen bg-transparent">
            <ContactSection />
            <BookingFlowSection />
        </div>
    );
};

export default BookNow;
