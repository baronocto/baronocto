
export interface SavedVideo {
  id: string;
  originalUrl: string;
  downloadUrl: string;
  timestamp: number;
  label?: string;
  analysis?: string;
}

export interface AnalysisResponse {
  description: string;
  predictedPrompt: string;
  style: string;
}
