export interface Article {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  uploadDate: string;
  pdfUrl: string;
  topics: string[];
  keywords?: string[];
  methodology: string;
  keyFindings: string[];
  citations: number;
  year: number;
}

export interface ChatMessage {
  id: string;
  articleId: string;
  question: string;
  answer: string;
  timestamp: string;
  sources?: string[];
}

export interface AnalysisSession {
  id: string;
  name: string;
  articleIds: string[];
  createdDate: string;
  type: 'summary' | 'comparison' | 'chat';
  duration?: number;
}

export interface SavedAnalysis {
  id: string;
  name: string;
  articleId: string;
  articleTitle: string;
  analysisType: 'analyze' | 'compare';
  prompt: string;
  result: string;
  comparison?: string;
  questionsFromPrompt?: string[];
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'lecturer' | 'student';
  researchedArticleIds?: string[];
}

export const mockUsers: User[] = [];
export const mockArticles: Article[] = [];
export const mockChatHistory: ChatMessage[] = [];
export const mockAnalysisSessions: AnalysisSession[] = [];
export const mockSavedAnalyses: SavedAnalysis[] = [];
