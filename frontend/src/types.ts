export interface AnalysisResult {
  summary: string;
  sentiment: {
    sentiment: string;
    confidence: number;
  };
  qa: Array<{
    question: string;
    answer: string;
  }>;
  metadata: {
    word_count: number;
    summary_length: number;
    questions_answered: number;
    error?: string;
  };
}

export interface AnalyzeRequest {
  text: string;
  questions: string[];
}
