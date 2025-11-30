import React, { useState } from 'react';
import { Settings as SettingsIcon, User, Lock, Shield, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('profile');

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
                    <SettingsIcon className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">Settings</h1>
                    <p className="text-gray-400">Manage your preferences</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Sidebar Navigation */}
                <div className="space-y-2">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'profile'
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <User className="w-5 h-5" />
                        <span className="font-medium">Profile</span>
                    </button>
                </div>

                {/* Content Area */}
                <div className="md:col-span-3">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                        className="glass-panel border border-white/5 bg-white/5 rounded-2xl p-6"
                    >
                        {activeTab === 'profile' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <User className="w-5 h-5 text-blue-400" />
                                    Application Information
                                </h2>
                                <div className="grid grid-cols-1 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400">Application Name</label>
                                        <div className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white">
                                            Agentic AI Tester
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400">Version</label>
                                        <div className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white">
                                            1.1.0
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400">Status</label>
                                        <div className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-green-400">
                                            ✓ System Operational
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
