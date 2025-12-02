import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ children, className = '', hover = false, ...props }) => {
    return (
        <motion.div
            whileHover={hover ? { y: -5, transition: { duration: 0.2 } } : {}}
            className={`glass-card rounded-xl p-6 ${className}`}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export default Card;
