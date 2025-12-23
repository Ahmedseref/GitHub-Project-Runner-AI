
import React from 'react';
import { ExecutionPlan } from '../types';

interface PlanDisplayProps {
  plan: ExecutionPlan;
  onExecute: () => void;
  isExecuting: boolean;
}

const PlanDisplay: React.FC<PlanDisplayProps> = ({ plan, onExecute, isExecuting }) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Project Info */}
        <div className="glass p-5 rounded-xl space-y-4">
          <h3 className="text-indigo-400 font-bold flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            General Specs
          </h3>
          <div className="space-y-3">
            <div>
              <span className="text-slate-500 text-xs uppercase tracking-wider font-bold">Project Type</span>
              <p className="text-lg font-semibold">{plan.project_type}</p>
            </div>
            <div>
              <span className="text-slate-500 text-xs uppercase tracking-wider font-bold">Stack</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {[...plan.language, ...plan.frameworks].map((tech, i) => (
                  <span key={i} className="px-2 py-1 bg-indigo-500/20 text-indigo-300 text-xs rounded border border-indigo-500/30">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="text-slate-500 text-xs uppercase tracking-wider font-bold">Target Port</span>
              <p className="text-lg font-mono text-green-400">{plan.exposed_port || "N/A"}</p>
            </div>
          </div>
        </div>

        {/* Execution Trigger */}
        <div className="glass p-5 rounded-xl border-l-4 border-l-indigo-500 flex flex-col justify-between">
          <div>
            <h3 className="text-white font-bold flex items-center gap-2 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
              Cloud Runner
            </h3>
            <p className="text-slate-400 text-sm mb-4">
              Instantiate an ephemeral environment and execute the generated plan commands.
            </p>
          </div>
          <button 
            onClick={onExecute}
            disabled={isExecuting}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold transition-all active:scale-[0.98] shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
          >
            {isExecuting ? (
              <span className="animate-pulse">Spinning up environment...</span>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                Execute Project
              </>
            )}
          </button>
        </div>
      </div>

      {/* Commands */}
      <div className="space-y-4">
        <CommandBlock title="1. Installation" commands={plan.install_commands} onCopy={copyToClipboard} />
        <CommandBlock title="2. Build Process" commands={plan.build_commands} onCopy={copyToClipboard} />
        <CommandBlock title="3. Execution" commands={plan.run_commands} onCopy={copyToClipboard} color="text-green-400" />
      </div>

      <div className="glass p-5 rounded-xl border-l-4 border-l-yellow-500/50">
          <h3 className="text-yellow-400 font-bold flex items-center gap-2 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4"/><path d="M12 16h.01"/><circle cx="12" cy="12" r="10"/></svg>
            DevOps Notes
          </h3>
          <p className="text-slate-300 text-sm leading-relaxed">
            {plan.notes}
          </p>
      </div>
    </div>
  );
};

interface CommandBlockProps {
  title: string;
  commands: string[];
  onCopy: (text: string) => void;
  color?: string;
}

const CommandBlock: React.FC<CommandBlockProps> = ({ title, commands, onCopy, color = "text-slate-200" }) => {
  if (!commands || commands.length === 0) return null;

  return (
    <div className="glass rounded-xl overflow-hidden border border-slate-700/50">
      <div className="bg-slate-800/50 px-4 py-2 flex justify-between items-center border-b border-slate-700/50">
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{title}</span>
        <button 
          onClick={() => onCopy(commands.join('\n'))}
          className="text-[10px] bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded transition-colors text-slate-300 uppercase tracking-tighter"
        >
          Copy All
        </button>
      </div>
      <div className="p-4 bg-slate-900/30 font-mono text-sm space-y-2">
        {commands.map((cmd, i) => (
          <div key={i} className={`flex items-start gap-3 group`}>
            <span className="text-slate-600 select-none">#</span>
            <code className={`flex-1 break-all ${color}`}>{cmd}</code>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlanDisplay;
