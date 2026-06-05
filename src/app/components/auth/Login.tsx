import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { FileText, Mail, Lock, ArrowRight, User as UserIcon, GraduationCap, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { loginAs } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  // Load theme from localStorage on mount, default to light
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme as 'light' | 'dark');
    } else {
      // Default to light mode if no saved theme
      setTheme('light');
      localStorage.setItem('theme', 'light');
    }
  }, [setTheme]);

  // Save theme to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Default to student if they type anything, since it's demo
    loginAs('student');
    navigate('/');
  };

  const handleDemoLogin = (role: 'lecturer' | 'student') => {
    loginAs(role);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-6 relative animate-in fade-in duration-300 overflow-y-auto">
      {/* Theme Toggle */}
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="absolute top-6 right-6 p-3 rounded-lg bg-card border border-border hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-md"
        title="Toggle theme"
      >
        {theme === 'dark' ? <Sun className="w-5 h-5 text-foreground" /> : <Moon className="w-5 h-5 text-foreground" />}
      </button>
      
      <div className="w-full max-w-md">
{/* Logo and Header Block */}
        <div className="bg-background rounded-t-2xl border-t border-x border-border p-8 pb-0 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-2xl mb-4 shadow-md shadow-red-900/20">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">ResearchAI</h1>
          <p className="text-muted-foreground pb-2">Your intelligent research assistant</p>
        </div>

        {/* Login Form */}
        <div className="bg-background rounded-b-2xl shadow-lg border-b border-x border-border p-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Sign In</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@university.edu"
                  className="w-full pl-11 pr-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-foreground placeholder:text-muted-foreground"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-11 pr-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-foreground placeholder:text-muted-foreground"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="rounded text-red-600 focus:ring-red-500" />
                <span className="ml-2 text-sm text-muted-foreground">Remember me</span>
              </label>
              <button type="button" className="text-sm text-red-600 hover:text-red-700 font-medium">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              Sign In
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-red-600 hover:text-red-700 font-medium"
              >
                Create Account
              </button>
            </p>
                      </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 bg-card rounded-lg p-4 border border-border">
          <p className="text-sm font-medium text-foreground text-center mb-3">
            Quick Demo Login
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
                onClick={() => handleDemoLogin('student')}
                className="flex items-center justify-center gap-2 py-2 px-3 bg-muted border border-border rounded-lg hover:bg-card hover:border-red-500 hover:shadow-md hover:scale-105 transition-all text-sm font-medium text-foreground"
              >
                <UserIcon className="w-4 h-4 text-foreground" />
                Student
              </button>
            <button 
              onClick={() => handleDemoLogin('lecturer')}
              className="flex items-center justify-center gap-2 py-2 px-3 bg-muted border border-border rounded-lg hover:bg-card hover:border-red-500 hover:shadow-md hover:scale-105 transition-all text-sm font-medium text-foreground"
            >
              <GraduationCap className="w-4 h-4 text-slate-500" />
              Lecturer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
