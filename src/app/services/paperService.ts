import api from './api';
import { Article } from '../data/mockData';

export async function getPapers(): Promise<Article[]> {
  const response = await api.get('/papers');
  return response.data.map((paper: any) => ({
    id: paper._id,
    title: paper.title,
    authors: paper.authors || ['Unknown Author'],
    abstract: paper.abstract || '',
    uploadDate: paper.createdAt ? paper.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
    pdfUrl: paper.fileUrl || '#',
    topics: paper.topics || paper.tags || [],
    keywords: paper.keywords || [],
    methodology: paper.methodology || 'Unknown',
    keyFindings: paper.keyFindings || [],
    citations: paper.citations || 0,
    year: paper.year || new Date().getFullYear(),
  }));
}

export async function getPaperById(id: string): Promise<Article> {
  const response = await api.get(`/papers/${id}`);
  const paper = response.data;
  return {
    id: paper._id,
    title: paper.title,
    authors: paper.authors || ['Unknown Author'],
    abstract: paper.abstract || '',
    uploadDate: paper.createdAt ? paper.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
    pdfUrl: paper.fileUrl || '#',
    topics: paper.topics || paper.tags || [],
    keywords: paper.keywords || [],
    methodology: paper.methodology || 'Unknown',
    keyFindings: paper.keyFindings || [],
    citations: paper.citations || 0,
    year: paper.year || new Date().getFullYear(),
  };
}

export async function uploadPaper(file: File): Promise<Article> {
  const formData = new FormData();
  formData.append('pdfFile', file);

  const response = await api.post('/papers', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  const paper = response.data;
  return {
    id: paper._id,
    title: paper.title,
    authors: paper.authors || ['Unknown Author'],
    abstract: paper.abstract || '',
    uploadDate: paper.createdAt ? paper.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
    pdfUrl: paper.fileUrl || '#',
    topics: paper.topics || paper.tags || [],
    keywords: paper.keywords || [],
    methodology: paper.methodology || 'Unknown',
    keyFindings: paper.keyFindings || [],
    citations: paper.citations || 0,
    year: paper.year || new Date().getFullYear(),
  };
}

export async function deletePaper(id: string): Promise<void> {
  await api.delete(`/papers/${id}`);
}

export async function queryPaper(id: string, question: string, guide?: string): Promise<string> {
  const response = await api.post(`/papers/${id}/query`, { question, guide });
  return response.data.answer;
}

// A popular related paper suggested by the backend, ranked by real-world
// citation count and matched on the source paper's extracted keywords.
export interface PaperSuggestion {
  externalId: string;
  title: string;
  abstract: string;
  authors: string[];
  year: number | null;
  citations: number;
  url: string;
}

export async function getSuggestions(paperId: string, limit = 8): Promise<PaperSuggestion[]> {
  const response = await api.get(`/papers/${paperId}/suggestions`, { params: { limit } });
  return response.data;
}

// Suggestions based on a user-chosen set of papers (merged keywords).
export async function getSuggestionsForPapers(paperIds: string[], limit = 8): Promise<PaperSuggestion[]> {
  const response = await api.post('/papers/suggestions', { paperIds, limit });
  return response.data;
}

