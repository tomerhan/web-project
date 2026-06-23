// Role-aware analysis service. Calls the real backend, which inspects the
// authenticated user's role and returns either a lightweight receipt (student)
// or the full server-computed dashboard payload (lecturer).
import api from './api';
import { Article } from '../data/mockData';

export interface StudentAnalysisReceipt {
  id: string;
  role: 'student';
  status: 'ready' | 'pending' | 'failed';
  createdAt: string;
  depth: 'Fast' | 'Regular' | 'Deep';
}

export interface AnalysisStats {
  totalArticles: number;
  avgCitations: number;
  totalCitations: number;
  uniqueTopics: number;
}

export interface LecturerAnalysisPayload {
  id: string;
  role: 'lecturer';
  status: 'ready' | 'pending' | 'failed';
  createdAt: string;
  depth: 'Fast' | 'Regular' | 'Deep';
  stats: AnalysisStats;
  citationData: { name: string; citations: number; title: string }[];
  qualityMetrics: { metric: string; score: number }[];
  yearData: { year: number; count: number }[];
  methodData: { name: string; value: number }[];
  topicData: { topic: string; count: number }[];
  insights: { title: string; description: string }[];
}

export type Role = 'student' | 'lecturer';

// Server inspects the auth token's role claim and returns the correct DTO.
// `role` is kept for the caller's convenience but the server is authoritative.
export async function getAnalysis(
  _id: string,
  _role: Role,
  articles: Article[],
  depth: 'Fast' | 'Regular' | 'Deep'
): Promise<StudentAnalysisReceipt | LecturerAnalysisPayload> {
  const paperIds = articles.map((a) => a.id);
  const response = await api.post('/papers/analysis', { paperIds, depth });
  return response.data as StudentAnalysisReceipt | LecturerAnalysisPayload;
}

export function isLecturerPayload(
  p: StudentAnalysisReceipt | LecturerAnalysisPayload
): p is LecturerAnalysisPayload {
  return p.role === 'lecturer';
}
