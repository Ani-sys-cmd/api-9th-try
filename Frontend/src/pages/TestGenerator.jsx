import React, { useEffect } from 'react';
import { Zap, Settings, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../api';
import { useProject } from '../context/ProjectContext';

const TestGenerator = () => {
    const { projectState, setProjectState } = useProject();
    const status = projectState.generatorStatus;
    const baseUrl = projectState.generatorBaseUrl;
    const logs = projectState.generatorLogs;

    const handleGenerate = async () => {
        setProjectState(prev => ({
            ...prev,
            generatorStatus: 'generating',
            generatorLogs: [...prev.generatorLogs, 'Initializing LLM agent...', 'Analyzing API endpoints...']
        }));

        try {
            await api.generateTests({ base_url: baseUrl });
            setProjectState(prev => ({
                ...prev,
                generatorLogs: [...prev.generatorLogs, 'Test suite generated successfully.', 'File saved to: tests/generated/test_suite.py'],
                generatorStatus: 'success'
            }));
        } catch (err) {
            const statusCode = err.response?.status;
            const detail = err.response?.data?.detail || err.message || "Unknown error generating tests.";
            
            let newStatus = 'error';
            if (statusCode === 429) {
                newStatus = 'quota';
            }

            setProjectState(prev => ({
                ...prev,
                generatorLogs: [...prev.generatorLogs, `Error: ${detail}`],
                generatorStatus: newStatus
            }));
        }
    };

    // Auto-trigger generation if coming from Upload Project page
    useEffect(() => {
        if (projectState.autoGenerateTests && status === 'idle') {
            // Clear the flag
            setProjectState(prev => ({ ...prev, autoGenerateTests: false }));
            // Trigger generation
            handleGenerate();
        }
    }, [projectState.autoGenerateTests]);

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Test Generator</h1>
                    <p className="text-gray-400">Configure the LLM agent to generate comprehensive test suites.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-white/5">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Settings className="w-5 h-5 text-gray-400" />
                            Configuration
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Target Base URL</label>
                                <input
                                    type="text"
                                    value={baseUrl}
                                    onChange={(e) => setProjectState(prev => ({ ...prev, generatorBaseUrl: e.target.value }))}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Model</label>
                                <select className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none transition-colors">
                                    <option>Gemini 1.5 Pro</option>
                                    <option>GPT-4o</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={status === 'generating' || status === 'quota'}
                        className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all ${status === 'generating' || status === 'quota'
                            ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg hover:shadow-purple-500/25 hover:-translate-y-0.5 text-white'
                            }`}
                    >
                        <Zap className={`w-5 h-5 ${status === 'generating' ? 'animate-pulse' : ''}`} />
                        {status === 'generating' ? 'Generating...' : 'Start Generation'}
                    </button>
                    
                    {status === 'quota' && (
                        <div className="mt-3 text-sm text-red-500 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                            LLM daily quota exceeded. Use a different API key, switch model, or try again tomorrow.
                        </div>
                    )}
                </div>

                <div className="lg:col-span-2">
                    <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-white/5 h-full min-h-[400px] flex flex-col">
                        <h3 className="text-lg font-bold text-white mb-4">Generation Log</h3>
                        <div className="flex-1 bg-black/40 rounded-xl p-4 font-mono text-sm space-y-2 overflow-y-auto custom-scrollbar border border-white/5">
                            {logs.length === 0 && <div className="text-gray-600 italic">Ready to generate...</div>}
                            {logs.map((log, i) => (
                                <div key={i} className="text-gray-300">
                                    <span className="text-purple-500 mr-2">➜</span>
                                    {log}
                                </div>
                            ))}
                            {status === 'success' && (
                                <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3 text-green-400">
                                    <CheckCircle className="w-5 h-5" />
                                    Generation Complete
                                </div>
                            )}
                            {status === 'error' && (
                                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-400">
                                    <AlertTriangle className="w-5 h-5" />
                                    Generation Failed
                                </div>
                            )}
                            {status === 'quota' && (
                                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-400">
                                    <AlertTriangle className="w-5 h-5" />
                                    Quota Exceeded
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestGenerator;
