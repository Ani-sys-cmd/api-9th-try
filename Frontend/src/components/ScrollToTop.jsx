import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

const ScrollToTop = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const mainContent = document.querySelector('main');

        const toggleVisibility = () => {
            if (mainContent && mainContent.scrollTop > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        if (mainContent) {
            mainContent.addEventListener('scroll', toggleVisibility);
        }

        return () => {
            if (mainContent) {
                mainContent.removeEventListener('scroll', toggleVisibility);
            }
        };
    }, []);

    const scrollToTop = () => {
        const mainContent = document.querySelector('main');
        if (mainContent) {
            mainContent.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    };

    return (
        <>
            {isVisible && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8 z-50 p-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-900/50 hover:shadow-xl hover:shadow-blue-900/70 hover:scale-110 transition-all duration-300 animate-fade-in"
                    aria-label="Scroll to top"
                >
                    <ArrowUp className="w-6 h-6" />
                </button>
            )}
        </>
    );
};

export default ScrollToTop;
