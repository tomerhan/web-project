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
    methodology: paper.methodology || 'Unknown',
    keyFindings: paper.keyFindings || [],
    citations: paper.citations || 0,
    year: paper.year || new Date().getFullYear(),
  };
}

export async function uploadPaper(paperData: {
  title: string;
  abstract?: string;
  content: string;
  authors?: string[];
  year?: number;
  topics?: string[];
  methodology?: string;
  keyFindings?: string[];
}): Promise<Article> {
  const response = await api.post('/papers', paperData);
  const paper = response.data;
  return {
    id: paper._id,
    title: paper.title,
    authors: paper.authors || ['Unknown Author'],
    abstract: paper.abstract || '',
    uploadDate: paper.createdAt ? paper.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
    pdfUrl: paper.fileUrl || '#',
    topics: paper.topics || paper.tags || [],
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

