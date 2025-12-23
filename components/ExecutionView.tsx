
import React, { useEffect, useRef, useState } from 'react';
import { ExecutionPlan, InteractionMessage } from '../types';

interface ExecutionViewProps {
  plan: ExecutionPlan;
  logs: string[];
  isFinished: boolean;
  repoUrl: string;
  interactions: InteractionMessage[];
  onSendMessage: (msg: string) => void;
  isInteracting: boolean;
}

const ExecutionView: React.FC<ExecutionViewProps> = ({ 
  plan, 
  logs, 
  isFinished, 
  repoUrl, 
  interactions, 
  onSendMessage,
  isInteracting
}) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const interactionEndRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    interactionEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [interactions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isInteracting) return;
    onSendMessage(inputValue);
    setInputValue('');
  };

  const handleOpenRepo = () => {
    window.open(repoUrl, '_blank');
  };

  return (
    <div className="w-full space-y-6 animate-in zoom-in-95 duration-500">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-xs font-bold uppercase tracking-widest">
            <span className={`w-2 h-2 rounded-full bg-green-500 ${!isFinished ? 'animate-pulse' : ''}`}></span>
            {isFinished ? 'Simulation Online' : 'Provisioning...'}
          </div>
          <span className="text-slate-500 text-sm">Cluster: ai-sandbox-01</span>
        </div>
        <div className="text-xs text-slate-400 font-mono">
          Mock Port: <span className="text-indigo-400">{plan.exposed_port || '3000'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Terminal Section */}
        <div className={`lg:col-span-12 xl:col-span-5 transition-all duration-700`}>
          <div className="glass rounded-xl overflow-hidden border border-slate-700 h-[500px] flex flex-col shadow-2xl bg-slate-900/40">
            <div className="bg-slate-800 px-4 py-3 flex items-center justify-between border-b border-slate-700">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              </div>
              <span className="text-slate-400 text-[10px] font-mono uppercase tracking-widest">DevOps Logs</span>
            </div>
            <div 
              ref={terminalRef}
              className="flex-1 p-5 font-mono text-[13px] overflow-y-auto bg-slate-950/50 scroll-smooth"
            >
              {logs.map((log, i) => (
                <div key={i} className="mb-1 leading-relaxed border-l border-slate-800 pl-3">
                  <span className={
                    log.includes('Successfully') || log.includes('OK') ? 'text-green-400' :
                    log.includes('Error') || log.includes('Failed') ? 'text-red-400' :
                    log.startsWith('>') ? 'text-indigo-400 font-bold' :
                    'text-slate-400'
                  }>
                    {log}
                  </span>
                </div>
              ))}
              {!isFinished && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="w-2 h-4 bg-indigo-500 animate-pulse"></span>
                  <span className="text-slate-500 italic text-xs">Simulating host commands...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Interactive Feature Playground */}
        <div className={`lg:col-span-12 xl:col-span-7 animate-in slide-in-from-right-8 duration-700 ${!isFinished ? 'opacity-20 grayscale pointer-events-none' : ''}`}>
          <div className="glass rounded-xl overflow-hidden border border-slate-700 h-[500px] flex flex-col shadow-2xl bg-slate-900/60 relative">
            {!isFinished && (
              <div className="absolute inset-0 flex items-center justify-center z-20 bg-slate-900/40 backdrop-blur-[2px]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                  <p className="text-slate-400 text-sm font-medium">Waiting for system boot...</p>
                </div>
              </div>
            )}
            
            {/* Header / Address Bar */}
            <div className="bg-slate-800/80 px-4 py-3 flex items-center gap-3 border-b border-slate-700">
              <div className="flex gap-2">
                <button className="w-3 h-3 rounded-full bg-slate-700"></button>
                <button className="w-3 h-3 rounded-full bg-slate-700"></button>
              </div>
              <div className="flex-1 bg-slate-950 rounded-lg px-3 py-1.5 flex items-center gap-2 text-slate-500 text-xs font-mono">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                {repoUrl.replace('https://github.com/', 'app://local-preview/')}:{plan.exposed_port || '3000'}
              </div>
              <button onClick={handleOpenRepo} className="text-slate-400 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </button>
            </div>

            {/* Interaction Feed */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar">
              {interactions.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg mb-1">Simulated Project UI</h4>
                    <p className="text-slate-400 text-sm max-w-xs mx-auto">
                      This project is now "running" via AI simulation. Ask the app to do something!
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <button onClick={() => setInputValue("Show me your main features")} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-full border border-slate-700 transition-colors">"Features?"</button>
                    <button onClick={() => setInputValue("Simulate a user interaction")} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-full border border-slate-700 transition-colors">"Interact"</button>
                  </div>
                </div>
              ) : (
                interactions.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                    <div className={`max-w-[85%] p-3 rounded-xl text-sm leading-relaxed ${
                      msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
              {isInteracting && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 p-3 rounded-xl rounded-tl-none border border-slate-700 flex gap-1">
                    <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-100"></div>
                    <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              )}
              <div ref={interactionEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-4 bg-slate-800/40 border-t border-slate-700">
              <div className="relative">
                <input 
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={isFinished ? "Tell the app what to do..." : "System starting..."}
                  disabled={!isFinished || isInteracting}
                  className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600 pr-12"
                />
                <button 
                  type="submit"
                  disabled={!isFinished || isInteracting || !inputValue.trim()}
                  className="absolute right-2 top-1.5 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg disabled:opacity-30 disabled:hover:bg-indigo-600 transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutionView;
