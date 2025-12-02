import React, { useState } from 'react';
import { Play, Activity, CheckCircle, XCircle, AlertTriangle, Code } from 'lucide-react';
import { api } from '../api';
import LogTerminal from '../components/Features/LogTerminal';
import HealingModal from '../components/HealingModal';
import TestFailureModal from '../components/TestFailureModal';

const TestRunner = () => {
    const [status, setStatus] = useState('idle'); // idle, running, done, error
    const [logs, setLogs] = useState([]);
    const [testResults, setTestResults] = useState(null);
    const [showHealingModal, setShowHealingModal] = useState(false);
    const [showFailureModal, setShowFailureModal] = useState(false);
    const [selectedFailure, setSelectedFailure] = useState(null);

    const addLog = (msg) => setLogs(prev => [...prev, `> ${msg}`]);

    const handleRun = async () => {
        setStatus('running');
        setLogs([]);
        addLog("Initializing Test Executor...");
        addLog("Loading test suite...");

        try {
            const res = await api.runTests();
            setTestResults(res.data.results);
            addLog(`Execution finished. Reward: ${res.data.results.reward}`);
            setStatus('done');
        } catch (err) {
            addLog(`Execution Error: ${err.message}`);
            setStatus('error');
        }
    };

    const openHealing = (type) => {
        const logsToPass = type === 'test'
            ? JSON.stringify(testResults?.failures || [], null, 2)
            : testResults?.logs;

        setSelectedFailure({ type, logs: logsToPass, testFile: testResults?.test_file });
        setShowHealingModal(true);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Test Runner</h1>
                    <p className="text-gray-400">Execute generated tests with the RL-driven engine.</p>
                </div>

                <button
                    onClick={handleRun}
                    disabled={status === 'running'}
                    className={`px-8 py-3 rounded-xl font-bold flex items-center gap-3 transition-all ${status === 'running'
                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:shadow-lg hover:shadow-emerald-500/25 hover:-translate-y-0.5 text-white'
                        }`}
                >
                    <Play className={`w-5 h-5 ${status === 'running' ? 'animate-pulse' : ''}`} />
                    {status === 'running' ? 'Running Tests...' : 'Execute Test Suite'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Terminal Section */}
                <div className="lg:col-span-2">
                    <LogTerminal logs={logs} status={status} />
                </div>

                {/* Results Section */}
                <div className="lg:col-span-1 space-y-6">
                    {testResults ? (
                        <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-white/5 animate-fade-in">
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center justify-between">
                                Results Summary
                                <span className="text-xs font-mono bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                                    Reward: {testResults.reward}
                                </span>
                            </h3>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-400" />
                                        <span className="text-gray-300">Passed</span>
                                    </div>
                                    <span className="text-xl font-bold text-white">{testResults.summary.passed}</span>
                                </div>

                                <div
                                    onClick={() => testResults.summary.failed > 0 && setShowFailureModal(true)}
                                    className={`flex items-center justify-between p-4 rounded-xl bg-red-500/10 border border-red-500/20 ${testResults.summary.failed > 0 ? 'cursor-pointer hover:bg-red-500/20 transition-colors' : ''}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <XCircle className="w-5 h-5 text-red-400" />
                                        <span className="text-gray-300">Failed</span>
                                    </div>
                                    <span className="text-xl font-bold text-white">{testResults.summary.failed}</span>
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                                    <div className="flex items-center gap-3">
                                        <AlertTriangle className="w-5 h-5 text-yellow-400" />
                                        <span className="text-gray-300">Errors</span>
                                    </div>
                                    <span className="text-xl font-bold text-white">{testResults.summary.error}</span>
                                </div>
                            </div>

                            {testResults.summary.failed > 0 && (
                                <div className="mt-6 space-y-3">
                                    <button
                                        onClick={() => openHealing('test')}
                                        className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
                                    >
                                        <span>🤖</span> Heal Test Case
                                    </button>
                                    <button
                                        onClick={() => openHealing('code')}
                                        className="w-full py-3 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
                                    >
                                        <Code className="w-4 h-4" /> Diagnose Code
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-white/5 h-full flex flex-col items-center justify-center text-center opacity-50">
                            <Activity className="w-12 h-12 text-gray-600 mb-4" />
                            <p className="text-gray-400">Run tests to see results here</p>
                        </div>
                    )}
                </div>
            </div>

            {showHealingModal && (
                <HealingModal
                    failure={selectedFailure}
                    onClose={() => setShowHealingModal(false)}
                    onRetest={() => {
                        setShowHealingModal(false);
                        handleRun();
                    }}
                />
            )}

            {showFailureModal && (
                <TestFailureModal
                    results={testResults}
                    onClose={() => setShowFailureModal(false)}
                />
            )}
        </div>
    );
};

export default TestRunner;
