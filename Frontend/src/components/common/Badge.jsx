import React from 'react';

const Badge = ({ variant = 'default', children, className = '' }) => {
    const variants = {
        default: "bg-primary/10 text-primary border-primary/20",
        success: "bg-green-500/10 text-green-500 border-green-500/20",
        warning: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
        error: "bg-red-500/10 text-red-500 border-red-500/20",
        secondary: "bg-secondary text-secondary-foreground",
    };

    return (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};

export default Badge;
