
export interface ExecutionPlan {
  project_type: string;
  language: string[];
  frameworks: string[];
  install_commands: string[];
  build_commands: string[];
  run_commands: string[];
  exposed_port: string;
  notes: string;
}

export interface AnalysisState {
  isAnalyzing: boolean;
  isExecuting: boolean;
  isExecuted: boolean;
  error: string | null;
  plan: ExecutionPlan | null;
  logs: string[];
  executionLogs: string[];
  currentStep: number;
}

export const ANALYSIS_STEPS = [
  "Connecting to GitHub API metadata...",
  "Analyzing repository structure...",
  "Detecting languages and frameworks...",
  "Inferring dependency management...",
  "Generating build and run strategies...",
  "Finalizing execution plan..."
];
