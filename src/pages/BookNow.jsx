import React from 'react';
import BookingFlowSection from '../components/BookingFlowSection';
import ContactSection from '../components/ContactSection';

const BookNow = () => {
    return (
        <div className="pb-24 flex flex-col min-h-screen">
            <ContactSection />
            <BookingFlowSection />
        </div>
    );
};

export default BookNow;
