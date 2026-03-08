import React from 'react';
import { motion } from 'framer-motion';

interface NewsItem {
    text: string;
    link?: string;
}

interface NewsTickerProps {
    items: NewsItem[];
    speed?: number; // pixels per second
}

const NewsTicker: React.FC<NewsTickerProps> = ({ items, speed = 100 }) => {
    // Duplicate items to create seamless loop
    const duplicated = [...items, ...items];
    const totalWidth = duplicated.length * 200; // approximate width per item, adjust as needed
    const duration = totalWidth / speed;

    return (
        <div className="relative overflow-hidden whitespace-nowrap bg-slate-900/80 border-b border-slate-800 py-2">
            <motion.div
                className="flex"
                animate={{ x: [-totalWidth / 2, 0] }}
                transition={{ repeat: Infinity, duration, ease: 'linear' }}
            >
                {duplicated.map((item, idx) => (
                    <a
                        key={idx}
                        href={item.link ?? '#'}
                        className="mx-4 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                        {item.text}
                    </a>
                ))}
            </motion.div>
        </div>
    );
};

export default NewsTicker;
