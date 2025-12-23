
import React, { useEffect, useRef } from 'react';
import { ExecutionPlan } from '../types';

interface ExecutionViewProps {
  plan: ExecutionPlan;
  logs: string[];
  isFinished: boolean;
}

const ExecutionView: React.FC<ExecutionViewProps> = ({ plan, logs, isFinished }) => {
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="w-full space-y-6 animate-in zoom-in-95 duration-500">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-xs font-bold uppercase tracking-widest">
            <span className={`w-2 h-2 rounded-full bg-green-500 ${!isFinished ? 'animate-pulse' : ''}`}></span>
            {isFinished ? 'System Online' : 'Provisioning...'}
          </div>
          <span className="text-slate-500 text-sm">Cluster: ephemeral-runner-01</span>
        </div>
        <div className="text-xs text-slate-400 font-mono">
          Port: <span className="text-indigo-400">{plan.exposed_port || 'DYNAMIC'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Terminal Section */}
        <div className={`lg:col-span-7 transition-all duration-700 ${isFinished ? 'lg:col-span-6' : 'lg:col-span-12'}`}>
          <div className="glass rounded-xl overflow-hidden border border-slate-700 h-[500px] flex flex-col shadow-2xl">
            <div className="bg-slate-800 px-4 py-3 flex items-center justify-between border-b border-slate-700">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              </div>
              <span className="text-slate-400 text-xs font-mono">deployment-logs.txt</span>
            </div>
            <div 
              ref={terminalRef}
              className="flex-1 p-6 font-mono text-sm overflow-y-auto bg-slate-900/80 scroll-smooth"
            >
              {logs.map((log, i) => (
                <div key={i} className="mb-1 leading-relaxed">
                  <span className="text-slate-600 mr-2">[{new Date().toLocaleTimeString()}]</span>
                  <span className={
                    log.includes('Successfully') || log.includes('Done') ? 'text-green-400' :
                    log.includes('Error') || log.includes('Failed') ? 'text-red-400' :
                    log.startsWith('>') ? 'text-indigo-400 font-bold' :
                    'text-slate-300'
                  }>
                    {log}
                  </span>
                </div>
              ))}
              {!isFinished && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="w-2 h-4 bg-indigo-500 animate-pulse"></span>
                  <span className="text-slate-500 italic">Processing commands...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Preview Section */}
        {isFinished && (
          <div className="lg:col-span-6 animate-in slide-in-from-right-8 duration-700">
            <div className="glass rounded-xl overflow-hidden border border-slate-700 h-[500px] flex flex-col shadow-2xl bg-white/5">
              <div className="bg-slate-800 px-4 py-2 flex items-center gap-2 border-b border-slate-700">
                <div className="flex-1 bg-slate-900 rounded px-3 py-1 flex items-center gap-2 text-slate-500 text-xs">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  https://runner-preview.internal:{plan.exposed_port || '3000'}/
                </div>
                <button className="p-1 hover:bg-slate-700 rounded transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>
                </button>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-900/40 relative">
                {/* Simulated App Content */}
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                  <div className="grid grid-cols-4 gap-4 p-4">
                    {[...Array(12)].map((_, i) => (
                      <div key={i} className="h-20 bg-indigo-500/20 rounded-lg"></div>
                    ))}
                  </div>
                </div>

                <div className="z-10 space-y-4">
                  <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <h4 className="text-xl font-bold text-white uppercase tracking-tight">App Live in Preview</h4>
                  <p className="text-slate-400 text-sm max-w-xs mx-auto leading-relaxed">
                    The {plan.project_type.toLowerCase()} service is now responding on internal port {plan.exposed_port}.
                  </p>
                  <div className="pt-4 flex gap-3 justify-center">
                    <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold text-sm transition-all">
                      Open in New Tab
                    </button>
                    <button className="px-4 py-2 border border-slate-700 hover:bg-slate-800 text-slate-300 rounded font-bold text-sm transition-all">
                      View Metrics
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExecutionView;
