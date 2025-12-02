import React from 'react';
import { motion } from 'framer-motion';
import { Play, Clock, FileCode, XCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

const ResultsHistory = () => {
    // Mock data
    const history = [
        { id: 4, status: 'failed', timestamp: '12/1/2025, 12:28:55 PM', file: 'tests/generated/test_mern-todo-app.py', reward: -40.0, pass: 0, fail: 8, error: 0 },
        { id: 3, status: 'failed', timestamp: '12/1/2025, 12:26:12 PM', file: 'tests/generated/test_mern-todo-app.py', reward: -40.0, pass: 0, fail: 8, error: 0 },
        { id: 2, status: 'failed', timestamp: '12/1/2025, 12:25:25 PM', file: 'tests/generated/test_mern-todo-app.py', reward: -40.0, pass: 0, fail: 8, error: 0 },
        { id: 1, status: 'failed', timestamp: '12/1/2025, 12:21:51 PM', file: 'tests/generated/test_mern-todo-app.py', reward: -40.0, pass: 0, fail: 8, error: 0 },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Results History</h1>
                <p className="text-muted-foreground mt-1">Track your testing progress over time.</p>
            </div>

            <div className="space-y-4">
                {history.map((run, index) => (
                    <motion.div
                        key={run.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className="flex flex-col md:flex-row items-center justify-between gap-6 hover:border-white/10 transition-colors">
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className={`p-3 rounded-full ${run.status === 'passed' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                                    }`}>
                                    {run.status === 'passed' ? <CheckCircle className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold flex items-center gap-2">
                                        Test Run #{run.id}
                                    </h3>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {run.timestamp}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2 font-mono bg-white/5 px-2 py-1 rounded">
                                        <FileCode className="h-3 w-3" />
                                        {run.file}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                                <div className="text-center">
                                    <p className={`text-2xl font-bold ${run.reward >= 0 ? 'text-green-500' : 'text-purple-400'}`}>
                                        {run.reward.toFixed(1)}
                                    </p>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Reward</p>
                                </div>

                                <div className="flex gap-4 text-center">
                                    <div>
                                        <p className="text-xl font-bold text-green-500">{run.pass}</p>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Pass</p>
                                    </div>
                                    <div>
                                        <p className="text-xl font-bold text-red-500">{run.fail}</p>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Fail</p>
                                    </div>
                                    <div>
                                        <p className="text-xl font-bold text-yellow-500">{run.error}</p>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Err</p>
                                    </div>
                                </div>

                                <Button variant="primary" size="sm" className="bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-600/20">
                                    <Play className="mr-2 h-4 w-4" />
                                    Re-run
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default ResultsHistory;
