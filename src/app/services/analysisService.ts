// Role-aware analysis service. Frontend mock today; swap body to Firebase/HTTP later.
// Contract preserved: callers get role-shaped DTOs, never the raw record.
import { Article } from '../data/mockData';

export interface StudentAnalysisReceipt {
  id: string;
  status: 'ready' | 'pending' | 'failed';
  createdAt: string;
  serverLink: string;
}

export interface LecturerAnalysisPayload {
  id: string;
  status: 'ready' | 'pending' | 'failed';
  createdAt: string;
  articles: Article[];
  depth: 'Fast' | 'Regular' | 'Deep';
  chartsSignedUrl: string;
}

export type Role = 'student' | 'lecturer';

// Real backend: replace with `await fetch('/api/analyses/' + id, { headers: authHeader })`.
// Server inspects auth token's role claim and returns the correct DTO.
export async function getAnalysis(
  id: string,
  role: Role,
  articles: Article[],
  depth: 'Fast' | 'Regular' | 'Deep'
): Promise<StudentAnalysisReceipt | LecturerAnalysisPayload> {
  const createdAt = new Date().toISOString();
  if (role === 'student') {
    return {
      id,
      status: 'ready',
      createdAt,
      serverLink: `/api/analyses/${id}/receipt`,
    };
  }
  return {
    id,
    status: 'ready',
    createdAt,
    articles,
    depth,
    chartsSignedUrl: `/api/analyses/${id}/charts?token=mock-signed-${Date.now()}`,
  };
}

export function isLecturerPayload(
  p: StudentAnalysisReceipt | LecturerAnalysisPayload
): p is LecturerAnalysisPayload {
  return 'chartsSignedUrl' in p;
}
