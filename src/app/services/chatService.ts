import api from './api';
import { ChatMessage } from '../data/mockData';

export interface ChatSession {
  _id: string;
  student: string;
  paper: string;
  messages: Array<{
    _id: string;
    sender: 'user' | 'bot';
    text: string;
    createdAt?: string;
  }>;
  status: 'active' | 'completed';
  // Present on sendChatMessage responses: the freshly computed comprehension.
  progress?: { score: number; understandingLevel: 'low' | 'medium' | 'high' | 'excellent' };
}

/**
 * Maps sequential backend messages (user, bot, user, bot...) into
 * question-answer pairs used by the frontend UI.
 */
export function mapMessagesToFrontend(messages: any[], articleId: string): ChatMessage[] {
  const result: ChatMessage[] = [];
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    if (msg.sender === 'user') {
      const nextMsg = messages[i + 1];
      if (nextMsg && nextMsg.sender === 'bot') {
        result.push({
          id: msg._id,
          articleId: articleId,
          question: msg.text,
          answer: nextMsg.text,
          timestamp: msg.createdAt || new Date().toISOString(),
          sources: ['Socratic Assistant'],
        });
        i++; // Skip the bot response as we paired it
      } else {
        result.push({
          id: msg._id,
          articleId: articleId,
          question: msg.text,
          answer: '',
          timestamp: msg.createdAt || new Date().toISOString(),
        });
      }
    } else {
      // Bot message without user message before it
      result.push({
        id: msg._id,
        articleId: articleId,
        question: '',
        answer: msg.text,
        timestamp: msg.createdAt || new Date().toISOString(),
        sources: ['Socratic Assistant'],
      });
    }
  }
  return result;
}

export async function startOrResumeChat(paperId: string): Promise<ChatSession> {
  const response = await api.post('/chats', { paperId });
  return response.data;
}

export async function sendChatMessage(chatId: string, text: string): Promise<ChatSession> {
  const response = await api.post(`/chats/${chatId}/messages`, { text });
  return response.data;
}

export interface DbChatSession {
  _id: string;
  student: string;
  paper: {
    _id: string;
    title: string;
    abstract?: string;
    authors?: string[];
    year?: number;
  };
  messages: Array<{
    _id: string;
    sender: 'user' | 'bot';
    text: string;
    createdAt?: string;
  }>;
  status: 'active' | 'completed';
  updatedAt: string;
  createdAt: string;
}

export async function getUserChats(): Promise<DbChatSession[]> {
  const response = await api.get('/chats');
  return response.data;
}

export async function deleteChat(chatId: string): Promise<void> {
  await api.delete(`/chats/${chatId}`);
}


