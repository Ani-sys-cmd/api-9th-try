import React, { useEffect, useRef } from 'react';
import { Terminal, Activity } from 'lucide-react';

const LogTerminal = ({ logs, status }) => {
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    return (
        <div className="glass-panel rounded-2xl overflow-hidden flex flex-col h-[500px] border-t-4 border-t-blue-500 shadow-2xl shadow-blue-900/20 bg-[#0c0c0c]">
            <div className="bg-white/5 p-3 flex items-center justify-between border-b border-white/10 backdrop-blur-md">
                <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-mono text-gray-300">System Terminal</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-mono ${status === 'error' ? 'bg-red-500/20 text-red-400' :
                            status === 'done' ? 'bg-green-500/20 text-green-400' :
                                'bg-blue-500/20 text-blue-400'
                        }`}>
                        {status.toUpperCase()}
                    </span>
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                        <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                    </div>
                </div>
            </div>

            <div className="flex-1 p-4 font-mono text-sm overflow-y-auto custom-scrollbar space-y-1">
                {logs.length === 0 && <div className="text-gray-600 italic">Waiting for input...</div>}
                {logs.map((log, i) => (
                    <div key={i} className="text-gray-300 border-l-2 border-transparent hover:border-blue-500/50 pl-2 transition-colors break-all">
                        <span className="text-blue-500 mr-2">$</span>
                        {log.replace('> ', '')}
                    </div>
                ))}
                {status === "running" && (
                    <div className="text-blue-400 animate-pulse flex items-center gap-2 mt-2">
                        <Activity className="w-4 h-4" />
                        Executing policies...
                    </div>
                )}
                <div ref={bottomRef} />
            </div>
        </div>
    );
};

export default LogTerminal;
