
import { GoogleGenAI, Type } from "@google/genai";
import { ExecutionPlan } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async analyzeRepository(repoUrl: string): Promise<ExecutionPlan> {
    const prompt = `
      You are an expert DevOps engineer and full-stack developer.
      Analyze this GitHub repository URL: ${repoUrl}
      
      Objective:
      Determine how to build, run, and expose the project (app, backend, frontend, or website) with zero user configuration.
      
      Tasks:
      1. Detect project type (Frontend, Backend, Full-stack, CLI, Dockerized).
      2. Identify languages and frameworks.
      3. Infer install steps (npm, pip, pnpm, yarn, mvn, etc.).
      4. Infer build steps (npm build, next build, etc.).
      5. Decide the correct run commands and exposed port. 
         IMPORTANT: For Node.js/JavaScript/TypeScript based projects, ALWAYS include 'npm start' in the run_commands if it is likely to be valid for the project structure.
      6. Detect required environment variables and use safe defaults if possible.
      
      Output ONLY a valid JSON object following this schema:
      {
        "project_type": string,
        "language": string[],
        "frameworks": string[],
        "install_commands": string[],
        "build_commands": string[],
        "run_commands": string[],
        "exposed_port": string,
        "notes": string
      }
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          tools: [{ googleSearch: {} }], // Use search to gather real repo info
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              project_type: { type: Type.STRING },
              language: { type: Type.ARRAY, items: { type: Type.STRING } },
              frameworks: { type: Type.ARRAY, items: { type: Type.STRING } },
              install_commands: { type: Type.ARRAY, items: { type: Type.STRING } },
              build_commands: { type: Type.ARRAY, items: { type: Type.STRING } },
              run_commands: { type: Type.ARRAY, items: { type: Type.STRING } },
              exposed_port: { type: Type.STRING },
              notes: { type: Type.STRING },
            },
            required: ["project_type", "language", "frameworks", "install_commands", "build_commands", "run_commands", "exposed_port", "notes"],
          },
        },
      });

      const plan: ExecutionPlan = JSON.parse(response.text || "{}");
      
      // Fallback check: If it's clearly a Node project and 'npm start' was somehow missed by the model, add it.
      const isNodeLike = plan.language.some(l => 
        ['javascript', 'typescript', 'node', 'nodejs'].includes(l.toLowerCase())
      ) || plan.install_commands.some(c => c.includes('npm') || c.includes('yarn') || c.includes('pnpm'));

      if (isNodeLike && !plan.run_commands.some(c => c.includes('npm start'))) {
        // Add npm start as a high-probability run command if not already present for Node projects
        if (plan.run_commands.length > 0) {
            // Check if standard dev commands are there but start is missing
            const hasDev = plan.run_commands.some(c => c.includes('dev'));
            if (hasDev) {
              plan.run_commands.push('npm start');
            }
        }
      }

      return plan;
    } catch (error) {
      console.error("Gemini Analysis Error:", error);
      throw new Error("Failed to analyze repository. Please check the URL and try again.");
    }
  }
}
