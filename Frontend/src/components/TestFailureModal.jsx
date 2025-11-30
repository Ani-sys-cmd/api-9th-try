import React from 'react';
import { X, AlertTriangle, FileCode, Bug } from 'lucide-react';

const TestFailureModal = ({ results, onClose }) => {
    // Helper to extract failures
    // If results.failures exists, use it. Otherwise try to parse logs or show a generic message.
    const failures = results?.failures || [];
    const logs = results?.logs || [];

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="glass-panel max-w-3xl w-full p-6 rounded-2xl shadow-2xl animate-slide-up flex flex-col max-h-[80vh]">
                <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4 shrink-0">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <AlertTriangle className="w-6 h-6 text-red-400" />
                        Test Failures
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="overflow-y-auto custom-scrollbar pr-2 space-y-4 flex-1">
                    {failures.length > 0 ? (
                        failures.map((fail, idx) => (
                            <div key={idx} className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                                <div className="flex items-start gap-3 mb-2">
                                    <FileCode className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                                    <div>
                                        <h3 className="font-bold text-red-200 text-sm">{fail.nodeid || fail.name || "Unknown Test"}</h3>
                                        <p className="text-xs text-red-300/70 font-mono mt-1">
                                            {fail.file || "Unknown File"}{fail.line ? `:${fail.line}` : ""}
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-black/40 rounded-lg p-3 border border-red-500/10 mt-3">
                                    <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-red-400 uppercase tracking-wider">
                                        <Bug className="w-3 h-3" /> Failure Reason
                                    </div>
                                    <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap break-all">
                                        {fail.message || fail.longrepr || "No detailed error message available."}
                                    </pre>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-yellow-200 text-sm">
                                <strong>Note:</strong> Structured failure data was not found. Showing raw logs below.
                            </div>
                            <div className="bg-black/50 p-4 rounded-xl border border-white/10 font-mono text-xs text-gray-300 whitespace-pre-wrap h-64 overflow-y-auto custom-scrollbar">
                                {logs.length > 0 ? logs.join('\n') : "No logs available."}
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex justify-end shrink-0">
                    <button
                        onClick={onClose}
                        className="glass-button bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg text-sm font-bold"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TestFailureModal;
