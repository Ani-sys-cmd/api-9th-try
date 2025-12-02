import React from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';
import { Activity, CheckCircle, Target, BarChart2 } from 'lucide-react';
import StatCard from '../components/common/StatCard';
import Card from '../components/common/Card';

const Analytics = () => {
    // Mock Data
    const trendData = [
        { date: 'Nov 25', failed: 0, passed: 0 },
        { date: 'Nov 26', failed: 0, passed: 0 },
        { date: 'Nov 27', failed: 0, passed: 0 },
        { date: 'Nov 28', failed: 0, passed: 0 },
        { date: 'Nov 29', failed: 0, passed: 0 },
        { date: 'Nov 30', failed: 1, passed: 0 },
        { date: 'Dec 1', failed: 4, passed: 0 },
    ];

    const distributionData = [
        { name: 'Passed', value: 0, color: '#22c55e' },
        { name: 'Failed', value: 100, color: '#ef4444' },
    ];

    const coverageData = [
        { name: 'API Endpoints', value: 92, color: '#3b82f6' },
        { name: 'Authentication', value: 88, color: '#8b5cf6' },
        { name: 'Database', value: 95, color: '#10b981' },
        { name: 'Business Logic', value: 78, color: '#f59e0b' },
        { name: 'Error Handling', value: 85, color: '#ef4444' },
    ];

    const endpointPerformanceData = [
        { name: '/api/users', time: 45 },
        { name: '/api/auth', time: 30 },
        { name: '/api/products', time: 75 },
        { name: '/api/orders', time: 55 },
        { name: '/api/analytics', time: 120 },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Analytics & Reports</h1>
                <p className="text-muted-foreground mt-1">Deep dive into your testing metrics.</p>
            </div>

            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Tests" value="4" icon={Activity} trend="up" trendValue="12%" color="blue" />
                <StatCard title="Pass Rate" value="0%" icon={CheckCircle} trend="up" trendValue="8%" color="green" />
                <StatCard title="Avg Reward" value="-40.0" icon={Target} trend="up" trendValue="15%" color="purple" />
                <StatCard title="Coverage" value="87.6%" icon={BarChart2} trend="up" trendValue="5%" color="orange" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Test Execution Trends */}
                <Card>
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <Activity className="h-5 w-5 text-blue-500" />
                        Test Execution Trends
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorPassed" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="date" stroke="#666" tick={{ fill: '#666' }} axisLine={false} tickLine={false} />
                                <YAxis stroke="#666" tick={{ fill: '#666' }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#13131f', borderColor: '#333', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="failed" stroke="#ef4444" fillOpacity={1} fill="url(#colorFailed)" />
                                <Area type="monotone" dataKey="passed" stroke="#22c55e" fillOpacity={1} fill="url(#colorPassed)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Test Distribution */}
                <Card>
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <PieChart className="h-5 w-5 text-purple-500" />
                        Test Distribution
                    </h3>
                    <div className="h-[300px] w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={distributionData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {distributionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#13131f', borderColor: '#333', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* Coverage by Module */}
            <Card>
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-500" />
                    Test Coverage by Module
                </h3>
                <div className="space-y-6">
                    {coverageData.map((item, index) => (
                        <div key={index} className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium">{item.name}</span>
                                <span className="font-bold">{item.value}%</span>
                            </div>
                            <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${item.value}%` }}
                                    transition={{ duration: 1, delay: index * 0.1 }}
                                    className="h-full rounded-full"
                                    style={{ backgroundColor: item.color }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Endpoint Performance */}
            <Card>
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <BarChart2 className="h-5 w-5 text-blue-500" />
                    Endpoint Performance (Avg Time ms)
                </h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={endpointPerformanceData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                            <XAxis dataKey="name" stroke="#666" tick={{ fill: '#666' }} axisLine={false} tickLine={false} />
                            <YAxis stroke="#666" tick={{ fill: '#666' }} axisLine={false} tickLine={false} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#13131f', borderColor: '#333', borderRadius: '8px' }}
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            />
                            <Bar dataKey="time" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>
    );
};

export default Analytics;
