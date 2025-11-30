import React, { useState, useEffect } from 'react';
import { api } from '../api';

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
                    // Diagnose the backend code (Simulated source file for MVP)
                    // In a real app, you'd map the failing endpoint to the exact file path
                    // Here we assume a main server file for demonstration
                    res = await api.diagnoseCode("storage/extracted/mern-project/server.js", failure.logs);
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
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg max-w-2xl w-full p-6 border border-gray-600 shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">
                        {failure.type === 'test' ? '🤖 Test Healer Agent' : '🩺 Code Diagnosis Agent'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
                </div>

                {loading ? (
                    <div className="text-center py-10">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-blue-300 animate-pulse">
                            {failure.type === 'test'
                                ? "Analyzing logs and rewriting Pytest code..."
                                : "Tracing stack trace and checking RAG documentation..."}
                        </p>
                    </div>
                ) : result?.error ? (
                    <div className="text-red-400 p-4 bg-red-900/20 rounded">Error: {result.error}</div>
                ) : (
                    <div className="space-y-4">
                        {failure.type === 'test' ? (
                            <>
                                <div className="bg-green-900/30 p-3 rounded border border-green-600 text-green-300">
                                    ✅ <strong>Success:</strong> {result.message}
                                </div>
                                <div className="bg-black p-4 rounded overflow-x-auto">
                                    <pre className="text-xs text-gray-300">
                                        {result.fixed_code}
                                    </pre>
                                </div>
                                <p className="text-sm text-gray-400 mt-2">
                                    The test file has been automatically updated. You can now run the tests again.
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="bg-orange-900/30 p-3 rounded border border-orange-600 text-orange-300">
                                    🔍 <strong>Diagnosis:</strong>
                                </div>
                                <div className="prose prose-invert max-w-none">
                                    <p className="text-gray-300 whitespace-pre-wrap">{result.analysis}</p>
                                </div>
                                <p className="text-sm text-gray-400 mt-2">
                                    Apply the suggested fix to your source code and re-upload.
                                </p>
                            </>
                        )}
                    </div>
                )}

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded flex items-center"
                    >
                        <span className="mr-2">←</span> Back
                    </button>
                    {failure.type === 'test' && !result?.error && (
                        <button
                            onClick={onRetest}
                            className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded flex items-center"
                        >
                            <span className="mr-2">🔄</span> Retest
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HealingModal;