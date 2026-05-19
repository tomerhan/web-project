import React from 'react';
import { FileText } from 'lucide-react';

interface Props {
  size?: 'sm' | 'md';
  bgClass?: string; // tailwind bg class
  children?: React.ReactNode; // override icon
  className?: string;
  title?: string;
}

export default function ArticleIcon({ size = 'md', bgClass, children, className = '', title }: Props) {
  const sizeClass = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
  // Match the Analyzed Reports header icon style exactly
  const defaultBg = 'bg-slate-800 border border-slate-700';
  // Use white icon color to match header appearance
  const colorClass = 'text-white';
  return (
    <div className={`${sizeClass} ${bgClass ?? defaultBg} ${colorClass} rounded-xl flex items-center justify-center flex-shrink-0 ${className}`} title={title}>
      {children ?? <FileText className="w-5 h-5 text-current" />}
    </div>
  );

}
