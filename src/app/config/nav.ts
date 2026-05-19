import { MessageSquare, Activity, BookOpen, BarChart, History, Settings } from 'lucide-react';

export const CHAT_LABEL = 'Research Chat';

export const NAV_ITEMS = [
  { icon: MessageSquare, label: CHAT_LABEL, path: '/' },
  { icon: Activity,       label: 'Chat Analyzer',  path: '/chat-analyzer' },
  { icon: BookOpen,       label: 'All Articles',    path: '/library' },
  { icon: BarChart,       label: 'Analyzed Reports', path: '/reports' },
  { icon: History,        label: 'Chat History',    path: '/history' },
  { icon: Settings,       label: 'Settings',        path: '/settings' },
];
