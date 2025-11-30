import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, TrendingUp, CheckCircle, AlertCircle, Zap, Target, BarChart3, Clock } from 'lucide-react';
import { api } from '../api';

const Dashboard = () => {
    const [stats, setStats] = useState({
        total_runs: 0,
        passed_runs: 0,
        avg_reward: 0,
        active_projects: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.getDashboardStats();
                setStats(response.data);
            } catch (error) {
                console.error('Failed to fetch dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const statCards = [
        {
            title: 'Total Test Runs',
            value: stats.total_runs,
            icon: Activity,
            gradient: 'from-blue-500 to-cyan-500',
            bgGradient: 'from-blue-500/10 to-cyan-500/10',
            change: '+12%',
            changeType: 'positive'
        },
        {
            title: 'Passed Tests',
            value: stats.passed_runs,
            icon: CheckCircle,
            gradient: 'from-green-500 to-emerald-500',
            bgGradient: 'from-green-500/10 to-emerald-500/10',
            change: '+8%',
            changeType: 'positive'
        },
        {
            title: 'Average Reward',
            value: stats.avg_reward.toFixed(2),
            icon: Target,
            gradient: 'from-purple-500 to-pink-500',
            bgGradient: 'from-purple-500/10 to-pink-500/10',
            change: '+15%',
            changeType: 'positive'
        },
        {
            title: 'Active Projects',
            value: stats.active_projects,
            icon: Zap,
            gradient: 'from-orange-500 to-red-500',
            bgGradient: 'from-orange-500/10 to-red-500/10',
            change: '2 new',
            changeType: 'neutral'
        }
    ];

    const recentActivity = [
        { id: 1, type: 'success', message: 'Test suite generated successfully', time: '2 minutes ago' },
        { id: 2, type: 'info', message: 'Project uploaded and scanned', time: '15 minutes ago' },
        { id: 3, type: 'warning', message: '3 tests failed - healing in progress', time: '1 hour ago' },
        { id: 4, type: 'success', message: 'All tests passed', time: '2 hours ago' }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Company Dashboard</h1>
                    <p className="text-gray-400">Monitor your testing infrastructure at a glance</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-green-400 font-medium">All Systems Operational</span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative group"
                    >
                        <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity`}></div>

                        <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all">
                            <div className="flex items-start justify-between mb-4">
                                <div className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center`}>
                                    <stat.icon className="w-6 h-6 text-white" />
                                </div>
                                <div className={`px-2 py-1 rounded-lg text-xs font-medium ${stat.changeType === 'positive' ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-gray-400'
                                    }`}>
                                    {stat.change}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <p className="text-gray-400 text-sm">{stat.title}</p>
                                <p className="text-3xl font-bold text-white">{stat.value}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity */}
                <div className="lg:col-span-2">
                    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Clock className="w-5 h-5 text-purple-400" />
                                Recent Activity
                            </h2>
                            <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                                View All
                            </button>
                        </div>

                        <div className="space-y-4">
                            {recentActivity.map((activity, index) => (
                                <motion.div
                                    key={activity.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-start gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                                >
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${activity.type === 'success' ? 'bg-green-500/10' :
                                            activity.type === 'warning' ? 'bg-yellow-500/10' :
                                                'bg-blue-500/10'
                                        }`}>
                                        {activity.type === 'success' ? (
                                            <CheckCircle className="w-5 h-5 text-green-400" />
                                        ) : activity.type === 'warning' ? (
                                            <AlertCircle className="w-5 h-5 text-yellow-400" />
                                        ) : (
                                            <Activity className="w-5 h-5 text-blue-400" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-white text-sm">{activity.message}</p>
                                        <p className="text-gray-500 text-xs mt-1">{activity.time}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-6">
                    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-purple-400" />
                            Quick Actions
                        </h2>

                        <div className="space-y-3">
                            <button className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 flex items-center justify-center gap-2">
                                <Zap className="w-4 h-4" />
                                Generate Tests
                            </button>
                            <button className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-all border border-white/10 flex items-center justify-center gap-2">
                                <Activity className="w-4 h-4" />
                                Run Tests
                            </button>
                            <button className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-all border border-white/10 flex items-center justify-center gap-2">
                                <BarChart3 className="w-4 h-4" />
                                View Reports
                            </button>
                        </div>
                    </div>

                    {/* System Health */}
                    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-green-400" />
                            System Health
                        </h2>

                        <div className="space-y-4">
                            {[
                                { label: 'API Response', value: 98, color: 'green' },
                                { label: 'Test Coverage', value: 85, color: 'blue' },
                                { label: 'Success Rate', value: 92, color: 'purple' }
                            ].map((metric, index) => (
                                <div key={index} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-400">{metric.label}</span>
                                        <span className="text-white font-medium">{metric.value}%</span>
                                    </div>
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${metric.value}%` }}
                                            transition={{ delay: 0.5 + index * 0.1, duration: 1 }}
                                            className={`h-full bg-gradient-to-r ${metric.color === 'green' ? 'from-green-500 to-emerald-500' :
                                                    metric.color === 'blue' ? 'from-blue-500 to-cyan-500' :
                                                        'from-purple-500 to-pink-500'
                                                }`}
                                        ></motion.div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
