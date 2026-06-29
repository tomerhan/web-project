import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { FileText, User, ArrowRight, Sun, Moon, Loader2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { toast } from 'sonner';
import api from '../../services/api';

export default function ForgotPassword() {
  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  // Load theme from localStorage on mount, default to light
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme as 'light' | 'dark');
    } else {
      setTheme('light');
      localStorage.setItem('theme', 'light');
    }
  }, [setTheme]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) {
      toast.error('Please enter your email or username');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/users/forgot-password', { identifier });
      setIsSuccess(true);
      toast.success('Password reset email sent successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send password reset email');
    } finally {
      setIsLoading(false);
    }
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
          <p className="text-muted-foreground pb-2">Password Reset</p>
        </div>

        {/* Form Block */}
        <div className="bg-background rounded-b-2xl shadow-lg border-b border-x border-border p-8">
          {isSuccess ? (
            <div className="text-center space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg">
                <p>If an account exists for that email or username, we have sent password reset instructions.</p>
              </div>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Return to Login
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-foreground mb-6">Forgot Password</h2>
              <p className="text-muted-foreground mb-6 text-sm">
                Enter your email address or username and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email or Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="you@university.edu or username"
                      className="w-full pl-11 pr-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-foreground placeholder:text-muted-foreground"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Reset Link'}
                  {!isLoading && <ArrowRight className="w-5 h-5" />}
                </button>
              </form>
            </>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-red-600 hover:text-red-700 font-medium text-sm"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
