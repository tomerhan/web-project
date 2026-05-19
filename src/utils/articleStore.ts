import { Article } from '../app/data/mockData';

const STORAGE_KEY = 'uploaded_articles_v1';

export const loadUploadedArticles = (): Article[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Article[];
  } catch (e) {
    console.error('loadUploadedArticles error', e);
    return [];
  }
};

export const saveUploadedArticle = (article: Article) => {
  try {
    const existing = loadUploadedArticles();
    // avoid duplicates by id
    const merged = [article, ...existing.filter((a) => a.id !== article.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch (e) {
    console.error('saveUploadedArticle error', e);
  }
};

export const clearUploadedArticles = () => {
  try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }
};

export const deleteUploadedArticle = (id: string) => {
  try {
    const existing = loadUploadedArticles();
    const filtered = existing.filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('deleteUploadedArticle error', e);
  }
};
