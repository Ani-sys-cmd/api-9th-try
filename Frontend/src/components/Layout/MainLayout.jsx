import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import ScrollToTop from '../ScrollToTop';

const MainLayout = () => {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-blue-500/30 overflow-hidden">
            {/* Background Gradients */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full" />
            </div>

            <Sidebar />
            <Header />

            <main className="ml-64 pt-20 h-screen overflow-y-auto custom-scrollbar relative z-10 p-8">
                <Outlet />
            </main>

            <ScrollToTop />
        </div>
    );
};

export default MainLayout;
