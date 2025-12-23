
import React, { useEffect, useRef } from 'react';

interface TerminalProps {
  logs: string[];
}

const Terminal: React.FC<TerminalProps> = ({ logs }) => {
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="w-full h-48 glass rounded-lg overflow-hidden flex flex-col font-mono text-sm border border-slate-700">
      <div className="bg-slate-800 px-4 py-2 flex items-center gap-2 border-b border-slate-700">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
        </div>
        <span className="text-slate-400 text-xs ml-2">devops_analysis.sh</span>
      </div>
      <div 
        ref={terminalRef}
        className="flex-1 p-4 overflow-y-auto space-y-1 scrollbar-hide bg-slate-900/50"
      >
        {logs.map((log, i) => (
          <div key={i} className="flex gap-2">
            <span className="text-indigo-400">$</span>
            <span className={log.startsWith('Error') ? 'text-red-400' : 'text-slate-300'}>
              {log}
            </span>
          </div>
        ))}
        <div className="animate-pulse inline-block w-2 h-4 bg-indigo-500 ml-1"></div>
      </div>
    </div>
  );
};

export default Terminal;
