import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
    {
        question: "How does the mobile shisha service work?",
        answer: "We bring the complete premium hookah lounge experience to your doorstep. Our team arrives, sets up the waterpipes, prepares the bowls with your chosen flavors, and manages the coals throughout your event to ensure a perfect smoke."
    },
    {
        question: "What types of shisha flavors do you offer?",
        answer: "We offer a curated selection of premium tobacco varieties, including classic single notes like Double Apple and Mint, as well as exotic blends and ice-infused flavors. We use top-tier brands to ensure thick, flavorful smoke."
    },
    {
        question: "Do you maintain hygiene and cleanliness?",
        answer: "Absolutely. We pride ourselves on hospital-grade hygiene. Every hookah is meticulously cleaned and sanitized after each use. We provide brand new, individually wrapped disposable mouthpieces for every guest."
    },
    {
        question: "How long does a typical hookah catering session last?",
        answer: "A standard session usually lasts between 2 to 4 hours depending on your booking package. Our shisha masters will continuously rotate fresh coconut coals to keep the session smooth and enjoyable."
    },
    {
        question: "Can you set up indoors as well as outdoors?",
        answer: "Yes, we can accommodate both indoor and outdoor events. For indoor setups, we ensure proper ventilation and use high-quality coconut coals that produce minimal ash and no chemical smells."
    }
];

const FAQSection = () => {
    const [openIndex, setOpenIndex] = useState(null);

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="w-full bg-charcoal-light py-20 px-4 sm:px-6 lg:px-8 border-y border-smoke/10">
            <div className="max-w-3xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl md:text-5xl font-light text-soft-white mb-4">
                        Frequently Asked <span className="text-amber font-medium">Questions</span>
                    </h2>
                    <p className="text-smoke text-lg font-light">
                        Everything you need to know about our premium hookah catering.
                    </p>
                </motion.div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={faq.question}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            className="border border-smoke/20 rounded-xl overflow-hidden bg-charcoal/50 hover:border-amber/50 transition-colors"
                        >
                            <button
                                onClick={() => toggleFAQ(index)}
                                className="w-full flex justify-between items-center p-6 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-amber"
                            >
                                <span className="text-soft-white font-medium text-lg">{faq.question}</span>
                                <ChevronDown
                                    className={`w-6 h-6 text-amber transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''
                                        }`}
                                />
                            </button>

                            <AnimatePresence>
                                {openIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                    >
                                        <div className="px-6 pb-6 text-smoke/90 leading-relaxed font-light">
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FAQSection;
