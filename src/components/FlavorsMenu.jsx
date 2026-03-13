import React from 'react';
import { motion } from 'framer-motion';

const flavorCategories = [
    {
        title: "The Classics",
        description: "Traditional Middle Eastern favorites, robust and timeless.",
        flavors: ["Double Apple", "Mint", "Grape & Mint", "Lemon Mint"]
    },
    {
        title: "Tropical Expressions",
        description: "Sweet, fruity, and vibrant blends that evoke an island paradise.",
        flavors: ["Mango Tango", "Watermelon Chill", "Pineapple Coconut", "Peach Passion"]
    },
    {
        title: "Dessert & Smooth",
        description: "Rich, creamy, and indulgent profiles for a smooth pull.",
        flavors: ["Vanilla Vanilla", "Blueberry Muffin", "Spiced Chai", "White Gummy Bear"]
    },
    {
        title: "Premium Ice Mixes",
        description: "Our signature blends with a refreshing frosty undertone.",
        flavors: ["Blue Mist", "Love 66", "Lady Killer", "Ice Citrus"]
    }
];

const FlavorsMenu = () => {
    return (
        <section className="relative w-full bg-charcoal py-24 px-6 overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl opacity-10 pointer-events-none">
                <div className="absolute bg-amber border rounded-full w-[800px] h-[800px] blur-[150px] mix-blend-screen" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <span className="text-amber uppercase tracking-[0.3em] text-sm font-medium mb-4 block">Curated Selection</span>
                    <h2 className="text-4xl md:text-6xl font-light text-soft-white mb-6">
                        Our Premium Flavors
                    </h2>
                    <p className="text-smoke text-lg max-w-2xl mx-auto font-light">
                        We use only the highest tier molasses. From timeless traditionals to modern icy blends,
                        our shisha menu is designed to cater to every palate.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {flavorCategories.map((cat, index) => (
                        <motion.div
                            key={cat.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="bg-charcoal-light/30 backdrop-blur-sm border border-smoke/10 rounded-2xl p-8 hover:border-amber/40 transition-colors duration-500 group"
                        >
                            <div className="w-12 h-12 rounded-full bg-amber/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                                <span className="text-2xl text-amber">✦</span>
                            </div>
                            <h3 className="text-2xl font-medium text-soft-white mb-3">
                                {cat.title}
                            </h3>
                            <p className="text-smoke text-sm mb-6 min-h-[40px]">
                                {cat.description}
                            </p>
                            <ul className="space-y-3">
                                {cat.flavors.map((flavor) => (
                                    <li key={flavor} className="flex items-center gap-3 text-soft-white/80 font-light">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber/50"></span>
                                        {flavor}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FlavorsMenu;
