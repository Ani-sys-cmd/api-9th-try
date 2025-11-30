import React, { useEffect, useState } from 'react';
import { History, Clock, CheckCircle, XCircle, AlertTriangle, FileText } from 'lucide-react';
import { api } from '../api';

const ResultsHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await api.getHistory();
                // Fix: Access res.data.history, default to empty array
                setHistory(res.data.history || []);
            } catch (err) {
                console.error("Failed to fetch history", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    if (loading) {
        return <div className="text-center text-gray-500 py-20">Loading history...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400">
                    <History className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white">Results History</h1>
                    <p className="text-gray-400">Track your testing progress over time.</p>
                </div>
            </div>

            {history.length === 0 ? (
                <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/5">
                    <Clock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-400">No History Found</h3>
                    <p className="text-gray-500">Run some tests to see them appear here.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {history.map((run, index) => (
                        // Fix: Use index as key since id might be missing
                        <div key={index} className="glass-panel p-6 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${run.summary?.failed === 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                        }`}>
                                        {run.summary?.failed === 0 ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                            Test Run #{history.length - index}
                                            {/* Fix: Check if execution_time exists */}
                                            {run.execution_time !== undefined && (
                                                <span className="text-xs font-mono bg-white/10 px-2 py-0.5 rounded text-gray-400">
                                                    {run.execution_time.toFixed(2)}s
                                                </span>
                                            )}
                                        </h3>
                                        <p className="text-sm text-gray-400 flex items-center gap-2">
                                            <Clock className="w-3 h-3" />
                                            {/* Fix: Handle ISO timestamp correctly */}
                                            {new Date(run.timestamp).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-white">{run.reward ? run.reward.toFixed(1) : '0.0'}</div>
                                        <div className="text-xs text-purple-400 uppercase tracking-wider font-bold">Reward</div>
                                    </div>

                                    <div className="h-8 w-px bg-white/10" />

                                    <div className="flex gap-4">
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-green-400">{run.summary?.passed || 0}</div>
                                            <div className="text-[10px] text-gray-500 uppercase">Pass</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-red-400">{run.summary?.failed || 0}</div>
                                            <div className="text-[10px] text-gray-500 uppercase">Fail</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-yellow-400">{run.summary?.error || 0}</div>
                                            <div className="text-[10px] text-gray-500 uppercase">Err</div>
                                        </div>
                                    </div>
                                </div>

                            </div>

                            <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-sm text-gray-500 font-mono">
                                <FileText className="w-4 h-4" />
                                {run.test_file}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ResultsHistory;
