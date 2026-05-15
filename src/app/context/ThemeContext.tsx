import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'dark' | 'light' | 'system';

// Available fonts for the application
export const AVAILABLE_FONTS = {
  'Inter': "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  'Roboto': "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  'Varela Round': "'Varela Round', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  'Arial': "Arial, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  'Georgia': "Georgia, -apple-system, BlinkMacSystemFont, 'Segoe UI', serif",
} as const;

export type FontName = keyof typeof AVAILABLE_FONTS;

interface ThemeContextType {
  theme: Theme;
  font: FontName;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  setFont: (font: FontName) => void;
  availableFonts: typeof AVAILABLE_FONTS;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [font, setFont] = useState<FontName>('Inter');

  useEffect(() => {
    // Load saved preferences from localStorage
    const savedTheme = localStorage.getItem('theme') as Theme;
    const savedFont = localStorage.getItem('font') as FontName;
    
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (savedTheme === 'system') {
      // Auto-detect system theme preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    } else {
      // Default to dark theme
      setTheme('dark');
    }
    
    if (savedFont && AVAILABLE_FONTS[savedFont]) {
      setFont(savedFont);
    }
  }, []);

  useEffect(() => {
    // Apply theme changes
    localStorage.setItem('theme', theme);
    document.documentElement.classList.remove('light', 'dark');
    
    if (theme === 'system') {
      // Apply system theme preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.add(prefersDark ? 'dark' : 'light');
    } else {
      document.documentElement.classList.add(theme);
    }
  }, [theme]);

  useEffect(() => {
    // Apply font changes
    localStorage.setItem('font', font);
    document.documentElement.style.setProperty('--main-font', AVAILABLE_FONTS[font]);
  }, [font]);

  const toggleTheme = () => {
    setTheme(prev => {
      if (prev === 'dark') return 'light';
      if (prev === 'light') return 'system';
      if (prev === 'system') return 'dark';
      return 'light';
    });
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      font, 
      toggleTheme, 
      setTheme, 
      setFont,
      availableFonts: AVAILABLE_FONTS 
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
