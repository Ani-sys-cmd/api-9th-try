import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Upload, Zap, Play, History, Settings, Terminal, LogOut, BarChart2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { auth } from '../../config/firebase';

const Sidebar = () => {
    const navItems = [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/upload', label: 'Upload Project', icon: Upload },
        { path: '/generate', label: 'Test Generator', icon: Zap },
        { path: '/run', label: 'Test Runner', icon: Play },
        { path: '/results', label: 'Results History', icon: History },
        { path: '/analytics', label: 'Analytics', icon: BarChart2 },
        { path: '/settings', label: 'Settings', icon: Settings },
    ];

    return (
        <aside className="w-64 bg-black/40 backdrop-blur-xl border-r border-white/10 h-screen fixed left-0 top-0 z-50 flex flex-col">
            <div className="p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Terminal className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            Agentic AI
                        </h1>
                        <p className="text-xs text-gray-500 font-mono">v1.1.0</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive
                                ? 'bg-blue-600/10 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.15)]'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                {isActive && (
                                    <motion.div
                                        layoutId="activeNav"
                                        className="absolute inset-0 bg-blue-600/10 rounded-xl"
                                        initial={false}
                                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <item.icon className={`w-5 h-5 relative z-10 ${isActive ? 'text-blue-400' : 'text-gray-500 group-hover:text-white'}`} />
                                <span className="font-medium relative z-10">{item.label}</span>
                                {isActive && (
                                    <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-white/10 space-y-4">
                <button
                    onClick={() => auth.signOut()}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 group"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                </button>

                <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl p-4 border border-white/5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs font-mono text-green-400">System Online</span>
                    </div>
                    <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-2/3 rounded-full" />
                    </div>
                    <div className="flex justify-between mt-1">
                        <span className="text-[10px] text-gray-500">CPU</span>
                        <span className="text-[10px] text-gray-500">34%</span>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
