import React from 'react';
import { motion } from 'framer-motion';
import { Activity, CheckCircle, Play, Upload, Zap, BarChart2, FileText } from 'lucide-react';
import StatCard from '../components/common/StatCard';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();

    // Mock data - replace with real data from context/API later
    const stats = [
        { title: 'Total Test Runs', value: '4', icon: Activity, trend: 'up', trendValue: '12%', color: 'blue' },
        { title: 'Passed Tests', value: '0', icon: CheckCircle, trend: 'up', trendValue: '8%', color: 'green' },
        { title: 'Average Reward', value: '-40.00', icon: Zap, trend: 'up', trendValue: '15%', color: 'purple' },
        { title: 'Active Projects', value: '1', icon: FileText, trend: null, trendValue: null, color: 'orange' },
    ];

    const recentActivity = [
        { id: 1, type: 'success', message: 'Test suite generated successfully', time: '2 minutes ago' },
        { id: 2, type: 'info', message: 'Project uploaded and scanned', time: '15 minutes ago' },
        { id: 3, type: 'warning', message: '3 tests failed - healing in progress', time: '1 hour ago' },
        { id: 4, type: 'success', message: 'All tests passed', time: '2 hours ago' },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Monitor your testing infrastructure at a glance</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" size="sm" onClick={() => navigate('/settings')}>
                        Settings
                    </Button>
                    <Button size="sm" onClick={() => navigate('/generate')}>
                        <Zap className="mr-2 h-4 w-4" />
                        New Test Run
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <StatCard {...stat} />
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity */}
                <div className="lg:col-span-2">
                    <Card className="h-full">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Activity className="h-5 w-5 text-blue-500" />
                                Recent Activity
                            </h3>
                            <Button variant="ghost" size="sm" className="text-xs">View All</Button>
                        </div>
                        <div className="space-y-4">
                            {recentActivity.map((activity, index) => (
                                <div key={activity.id} className="flex items-start gap-4 p-4 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                    <div className={`mt-1 p-2 rounded-full ${activity.type === 'success' ? 'bg-green-500/20 text-green-500' :
                                            activity.type === 'warning' ? 'bg-yellow-500/20 text-yellow-500' :
                                                'bg-blue-500/20 text-blue-500'
                                        }`}>
                                        {activity.type === 'success' ? <CheckCircle className="h-4 w-4" /> :
                                            activity.type === 'warning' ? <Activity className="h-4 w-4" /> :
                                                <Activity className="h-4 w-4" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">{activity.message}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div>
                    <Card className="h-full">
                        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                            <Zap className="h-5 w-5 text-yellow-500" />
                            Quick Actions
                        </h3>
                        <div className="space-y-3">
                            <Button variant="secondary" className="w-full justify-start bg-green-600 hover:bg-green-700 text-white" onClick={() => navigate('/upload')}>
                                <Upload className="mr-2 h-4 w-4" />
                                Upload Project
                            </Button>
                            <Button variant="secondary" className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white" onClick={() => navigate('/generate')}>
                                <Zap className="mr-2 h-4 w-4" />
                                Generate Tests
                            </Button>
                            <Button variant="secondary" className="w-full justify-start" onClick={() => navigate('/run')}>
                                <Play className="mr-2 h-4 w-4" />
                                Run Tests
                            </Button>
                            <Button variant="secondary" className="w-full justify-start" onClick={() => navigate('/analytics')}>
                                <BarChart2 className="mr-2 h-4 w-4" />
                                Analytics
                            </Button>
                            <Button variant="secondary" className="w-full justify-start" onClick={() => navigate('/results')}>
                                <FileText className="mr-2 h-4 w-4" />
                                View Reports
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
