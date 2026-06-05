import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { FileText, Mail, Lock, User, Building, ArrowRight, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    institution: '',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const ok = await register({
        name: formData.name,
        email: formData.email,
        institution: formData.institution,
        password: formData.password,
      });
      if (ok) {
        navigate('/');
      } else {
        setError('Registration failed');
      }
    } catch (err) {
      setError('Registration error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-2xl mb-4">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <div className="bg-card rounded-2xl shadow-lg border border-border p-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">ResearchAI</h1>
            <p className="text-muted-foreground">Create your research account</p>
          </div>
        </div>

        {/* Registration Form */}
        <div className="bg-card rounded-2xl shadow-lg border border-border p-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Create Account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Dr. Jane Smith"
                  className="w-full pl-11 pr-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-foreground placeholder:text-muted-foreground"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="you@university.edu"
                  className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Institution
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={formData.institution}
                  onChange={(e) => handleChange('institution', e.target.value)}
                  placeholder="University Name"
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
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                  className="w-full pl-11 pr-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-foreground placeholder:text-muted-foreground"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                  className="w-full pl-11 pr-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-foreground placeholder:text-muted-foreground"
                  required
                />
              </div>
            </div>

            <div className="flex items-start">
              <input type="checkbox" className="mt-1 rounded text-red-600 focus:ring-red-500" required />
              <span className="ml-2 text-sm text-muted-foreground">
                I agree to the{' '}
                <button type="button" className="text-red-600 hover:text-red-700 font-medium">
                  Terms of Service
                </button>{' '}
                and{' '}
                <button type="button" className="text-red-600 hover:text-red-700 font-medium">
                  Privacy Policy
                </button>
              </span>
            </div>

            <div>
              {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2 ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Creating account...' : 'Create Account'}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-red-600 hover:text-red-700 font-medium"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
