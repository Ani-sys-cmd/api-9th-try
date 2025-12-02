
import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { X, RefreshCw, ArrowLeft, Check, AlertTriangle, Search } from 'lucide-react';

const HealingModal = ({ failure, onClose, onRetest }) => {
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState(null);

    useEffect(() => {
        const performHealing = async () => {
            try {
                let res;
                if (failure.type === 'test') {
                    // Heal the test file itself
                    res = await api.healTest(failure.testFile, failure.logs);
                } else {
                    // Diagnose the backend code
                    // Pass null to let the backend auto-discover the file
                    res = await api.diagnoseCode(null, failure.logs);
                }
                setResult(res.data);
            } catch (error) {
                setResult({ error: error.message });
            } finally {
                setLoading(false);
            }
        };

        performHealing();
    }, [failure]);

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="glass-panel max-w-2xl w-full p-6 rounded-2xl shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        {failure.type === 'test' ? '🤖 Test Healer Agent' : '🩺 Code Diagnosis Agent'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="relative mx-auto mb-4 w-12 h-12">
                            <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <p className="text-blue-300 animate-pulse font-medium">
                            {failure.type === 'test'
                                ? "Analyzing logs and rewriting Pytest code..."
                                : "Tracing stack trace and checking RAG documentation..."}
                        </p>
                    </div>
                ) : result?.error ? (
                    <div className="text-red-300 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                        <div>
                            <span className="font-bold block mb-1">Error Occurred</span>
                            {result.error}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {failure.type === 'test' ? (
                            <>
                                <div className="bg-green-500/10 p-4 rounded-xl border border-green-500/20 text-green-300 flex items-start gap-3">
                                    <Check className="w-5 h-5 shrink-0 mt-0.5" />
                                    <div>
                                        <strong className="block mb-1 text-green-200">Success</strong>
                                        {result.message}
                                    </div>
                                </div>
                                <div className="bg-black/50 p-4 rounded-xl overflow-y-auto max-h-96 border border-white/10 custom-scrollbar">
                                    <pre className="text-xs text-blue-200 font-mono">
                                        {result.fixed_code}
                                    </pre>
                                </div>
                                <p className="text-sm text-gray-400 mt-2 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                                    The test file has been automatically updated. You can now run the tests again.
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="bg-orange-500/10 p-4 rounded-xl border border-orange-500/20 text-orange-300 flex items-center gap-3">
                                    <Search className="w-5 h-5" />
                                    <strong>Diagnosis Complete</strong>
                                </div>
                                <div className="prose prose-invert max-w-none bg-white/5 p-4 rounded-xl border border-white/10 overflow-y-auto max-h-96 custom-scrollbar">
                                    {typeof result.analysis === 'object' && result.analysis !== null ? (
                                        <div className="space-y-6">
                                            <div>
                                                <h3 className="text-blue-400 font-bold text-base mb-2 flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                                                    Explanation
                                                </h3>
                                                <p className="text-gray-300 text-sm leading-relaxed pl-3.5 border-l border-blue-500/30">
                                                    {result.analysis.explanation}
                                                </p>
                                            </div>

                                            <div>
                                                <h3 className="text-purple-400 font-bold text-base mb-2 flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                                                    Recommendation
                                                </h3>
                                                <p className="text-gray-300 text-sm leading-relaxed pl-3.5 border-l border-purple-500/30">
                                                    {result.analysis.recommendation}
                                                </p>
                                            </div>

                                            <div>
                                                <h3 className="text-green-400 font-bold text-base mb-2 flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                                                    Solution Code
                                                </h3>
                                                <div className="bg-black/30 rounded-lg border border-white/10 overflow-hidden">
                                                    <pre className="p-3 text-xs text-blue-200 font-mono overflow-x-auto">
                                                        {result.analysis.solution}
                                                    </pre>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">{result.analysis}</p>
                                    )}
                                </div>
                                <p className="text-sm text-gray-400 mt-2 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                                    Apply the suggested fix to your source code and re-upload.
                                </p>
                            </>
                        )}
                    </div>
                )}

                <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-white/10">
                    <button
                        onClick={onClose}
                        className="glass-button px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/10 flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    {failure.type === 'test' && !result?.error && (
                        <button
                            onClick={onRetest}
                            className="glass-button bg-purple-600/80 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-purple-900/20"
                        >
                            <RefreshCw className="w-4 h-4" /> Retest
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="glass-button bg-blue-600/80 hover:bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg shadow-blue-900/20"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HealingModal;
