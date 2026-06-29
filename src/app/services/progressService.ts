import api from './api';

export interface ProgressItem {
  paper: string;
  score: number;
  understandingLevel: 'low' | 'medium' | 'high' | 'excellent';
}

/** The logged-in student's progress across all papers. */
export async function getMyProgress(): Promise<ProgressItem[]> {
  const response = await api.get('/progress/me');
  return response.data as ProgressItem[];
}

/** A specific student's progress (lecturer only). */
export async function getStudentProgress(studentId: string): Promise<ProgressItem[]> {
  const response = await api.get(`/progress/student/${studentId}`);
  return response.data as ProgressItem[];
}

/** Build a paperId -> score map from a list of progress items. */
export function toScoreMap(items: ProgressItem[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const it of items) map[it.paper] = it.score;
  return map;
}
