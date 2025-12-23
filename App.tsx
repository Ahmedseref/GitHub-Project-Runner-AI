
import React, { useState, useEffect } from 'react';
import { GeminiService } from './services/geminiService';
import { AnalysisState, ANALYSIS_STEPS, ExecutionPlan } from './types';
import Terminal from './components/Terminal';
import PlanDisplay from './components/PlanDisplay';
import ExecutionView from './components/ExecutionView';

const App: React.FC = () => {
  const [repoUrl, setRepoUrl] = useState('');
  const [state, setState] = useState<AnalysisState>({
    isAnalyzing: false,
    isExecuting: false,
    isExecuted: false,
    error: null,
    plan: null,
    logs: ["Ready to analyze repository. Paste a GitHub URL to begin."],
    executionLogs: [],
    currentStep: -1,
  });

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.includes('github.com')) {
      setState(prev => ({ ...prev, error: "Please enter a valid GitHub repository URL." }));
      return;
    }

    setState({
      ...state,
      isAnalyzing: true,
      isExecuted: false,
      error: null,
      plan: null,
      logs: [`Initiating analysis for ${repoUrl}...`],
      currentStep: 0,
    });

    const gemini = new GeminiService();

    try {
      // Simulate steps for UI feel
      for (let i = 0; i < ANALYSIS_STEPS.length; i++) {
        setState(prev => ({
          ...prev,
          currentStep: i,
          logs: [...prev.logs, ANALYSIS_STEPS[i]]
        }));
        await new Promise(r => setTimeout(r, 600));
      }

      const plan = await gemini.analyzeRepository(repoUrl);
      
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        plan,
        logs: [...prev.logs, "✅ Analysis complete! Execution plan generated."],
        currentStep: ANALYSIS_STEPS.length,
      }));
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        error: err.message,
        logs: [...prev.logs, `Error: ${err.message}`],
        currentStep: -1,
      }));
    }
  };

  const executePlan = async () => {
    if (!state.plan) return;

    setState(prev => ({
      ...prev,
      isExecuting: true,
      executionLogs: ["Initializing runner environment...", "Provisioning cloud-vm-0x7F..."],
    }));

    const addLog = (log: string) => {
      setState(prev => ({
        ...prev,
        executionLogs: [...prev.executionLogs, log]
      }));
    };

    try {
      await new Promise(r => setTimeout(r, 1000));
      addLog("Successfully connected to ephemeral host.");
      addLog(`Cloning repository: ${repoUrl}...`);
      await new Promise(r => setTimeout(r, 1500));
      addLog("Repo cloned to /tmp/workspace.");

      // Run Install Commands
      for (const cmd of state.plan.install_commands) {
        addLog(`> ${cmd}`);
        await new Promise(r => setTimeout(r, 1000));
        addLog(`Progress: ${cmd.split(' ')[0]} packages resolved and cached.`);
      }
      addLog("Installation finished.");

      // Run Build Commands
      for (const cmd of state.plan.build_commands) {
        addLog(`> ${cmd}`);
        await new Promise(r => setTimeout(r, 1200));
        addLog("Optimizing assets for production...");
        addLog(`Build artifact generated in /dist.`);
      }

      // Run Command
      const runCmd = state.plan.run_commands[0] || 'npm start';
      addLog(`> ${runCmd}`);
      await new Promise(r => setTimeout(r, 800));
      addLog(`Service started. Listening on port ${state.plan.exposed_port || '3000'}`);
      addLog("Health check: OK (200)");

      setState(prev => ({
        ...prev,
        isExecuting: false,
        isExecuted: true,
      }));
    } catch (err) {
      addLog("Critical error during execution simulation.");
    }
  };

  const reset = () => {
    setRepoUrl('');
    setState({
      isAnalyzing: false,
      isExecuting: false,
      isExecuted: false,
      error: null,
      plan: null,
      logs: ["Ready to analyze repository. Paste a GitHub URL to begin."],
      executionLogs: [],
      currentStep: -1,
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8">
      {/* Background decoration */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600 rounded-full blur-[120px]"></div>
      </div>

      <header className="w-full max-w-4xl text-center mb-10 mt-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-4">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          DevOps Cloud Runner
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
          GitHub Cloud Runner
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          One-click analysis and execution simulation. Paste a URL to analyze, build, and simulate a running environment.
        </p>
      </header>

      <main className="w-full max-w-5xl space-y-8">
        {/* Input Section */}
        {!state.plan && !state.isExecuting && !state.isExecuted && (
          <div className="glass p-8 rounded-2xl shadow-2xl glow-indigo">
            <form onSubmit={handleAnalyze} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300 ml-1">Repository URL</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/username/project"
                    disabled={state.isAnalyzing}
                    className="block w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-white transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={state.isAnalyzing || !repoUrl}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all ${
                  state.isAnalyzing 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 active:scale-95'
                }`}
              >
                {state.isAnalyzing ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    Start Analysis
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Progress Section */}
        {state.isAnalyzing && (
          <div className="space-y-4 max-w-4xl mx-auto">
            <Terminal logs={state.logs} />
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 transition-all duration-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                style={{ width: `${((state.currentStep + 1) / ANALYSIS_STEPS.length) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Results Section */}
        {state.plan && !state.isExecuting && !state.isExecuted && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/></svg>
                Inferred Strategy
              </h2>
              <button 
                onClick={reset}
                className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
              >
                Start Over
              </button>
            </div>
            <PlanDisplay plan={state.plan} onExecute={executePlan} isExecuting={state.isExecuting} />
          </div>
        )}

        {/* Execution Simulation Section */}
        {(state.isExecuting || state.isExecuted) && state.plan && (
          <div className="space-y-6">
             <div className="flex justify-between items-center px-2">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="m17 17-5 5-5-5"/><path d="m17 7-5-5-5 5"/></svg>
                Runner Instance
              </h2>
              <button 
                onClick={reset}
                disabled={state.isExecuting}
                className="text-sm font-medium text-slate-400 hover:text-white transition-colors disabled:opacity-30"
              >
                Terminate Runner
              </button>
            </div>
            <ExecutionView plan={state.plan} logs={state.executionLogs} isFinished={state.isExecuted} />
          </div>
        )}

        {/* Error State */}
        {state.error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 max-w-4xl mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <p className="text-sm font-medium">{state.error}</p>
          </div>
        )}
      </main>

      <footer className="w-full max-w-5xl py-12 mt-auto text-center border-t border-slate-800/50">
        <p className="text-slate-500 text-xs tracking-widest uppercase mb-2">
          Powered by Gemini 3 Flash & Google Search Grounding
        </p>
        <p className="text-slate-600 text-[10px] italic">
          Disclaimer: Execution is simulated for demonstration purposes. ephemeral containers are mock environments.
        </p>
      </footer>
    </div>
  );
};

export default App;
