import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Search, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
    const location = useLocation();
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const getPageTitle = (path) => {
        switch (path) {
            case '/': return 'Dashboard';
            case '/upload': return 'Project Ingestion';
            case '/generate': return 'Test Generator';
            case '/run': return 'Test Execution';
            case '/results': return 'Results History';
            case '/settings': return 'System Settings';
            default: return 'Dashboard';
        }
    };

    return (
        <header className="h-20 fixed top-0 right-0 left-64 bg-black/40 backdrop-blur-xl border-b border-white/10 z-40 px-8 flex items-center justify-between">
            <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                    {getPageTitle(location.pathname)}
                </h2>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>Home</span>
                    <span>/</span>
                    <span className="text-blue-400">{getPageTitle(location.pathname)}</span>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="relative group">
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-blue-400 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:bg-blue-500/5 w-64 transition-all"
                    />
                </div>

                <button className="relative p-2 rounded-full hover:bg-white/5 transition-colors text-gray-400 hover:text-white">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border border-black" />
                </button>

                <div className="flex items-center gap-3 pl-6 border-l border-white/10">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-medium text-white">
                            {currentUser ? currentUser.email.split('@')[0] : 'Admin User'}
                        </p>
                        <p className="text-xs text-gray-500">
                            {currentUser ? currentUser.email : 'admin@example.com'}
                        </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 p-[2px]">
                        <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;

