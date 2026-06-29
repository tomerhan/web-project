import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Settings, User, Bell, Palette, Shield, BookOpen,
  ChevronRight, Check, Sun, Moon, Type, Home
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import FontSelector from './FontSelector';
import { toast } from 'sonner';
import { saveSettingsToStorage, loadSettingsFromStorage, UserSettings } from '../../../utils/settingsStorage';
import api from '../../services/api';

type Section = 'profile' | 'preferences' | 'notifications' | 'privacy';

const sections: { id: Section; icon: typeof Settings; label: string; desc: string }[] = [
  { id: 'profile',       icon: User,    label: 'Profile',        desc: 'Name, institution' },
  { id: 'preferences',   icon: Palette, label: 'Preferences',    desc: 'Analysis defaults, citation format' },
  { id: 'notifications', icon: Bell,    label: 'Notifications',  desc: 'Alerts, digests, reminders' },
  { id: 'privacy',       icon: Shield,  label: 'Privacy',        desc: 'Data sharing, export, deletion' },
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeSection, setActiveSection] = useState<Section>('profile');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [institution, setInstitution] = useState('');
  const [researchField, setResearchField] = useState('');
  const [citationFormat, setCitationFormat] = useState<'APA' | 'MLA' | 'Chicago'>('APA');
  const [defaultDepth, setDefaultDepth] = useState<1 | 2 | 3>(2);
  const [emailDigest, setEmailDigest] = useState(true);
  const [analysisAlerts, setAnalysisAlerts] = useState(true);

  // Load settings from local storage and DB user profile
  useEffect(() => {
    const settings = loadSettingsFromStorage();
    setName(user?.name || settings.name || '');
    setEmail(user?.email || settings.email || '');
    setInstitution(user?.institution || settings.institution || '');
    setResearchField(settings.researchField);
    setCitationFormat(settings.citationFormat);
    setDefaultDepth(settings.defaultDepth);
    setEmailDigest(settings.emailDigest);
    setAnalysisAlerts(settings.analysisAlerts);
  }, [user]);

  const handleSave = async () => {
    const settings: Partial<UserSettings> = {
      name,
      email,
      institution,
      researchField,
      citationFormat,
      defaultDepth,
      emailDigest,
      analysisAlerts,
    };
    
    saveSettingsToStorage(settings);

    if (activeSection === 'profile') {
      try {
        const response = await api.put('/users/profile', { name, institution });
        if (setUser) {
          setUser(response.data.user);
        }
        toast.success('Profile saved to database successfully!');
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to update profile in database');
      }
    } else {
      toast.success('Settings saved successfully!');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-muted">
      {/* Page Header */}
      <div className="bg-card border-b border-border px-6 py-5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center text-red-600">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-foreground text-xl">Settings</h1>
              <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-slate-200 dark:hover:bg-slate-700 text-foreground text-sm font-medium rounded-lg transition-colors border border-border"
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Home</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 bg-background">
        <div className="flex gap-6">

          {/* Sidebar Nav */}
          <div className="w-56 flex-shrink-0 hidden md:block">
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              {sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all active:scale-98 border-b border-border last:border-b-0 ${
                    activeSection === s.id
                      ? 'bg-slate-100 dark:bg-slate-800 text-foreground border-l-2 border-l-slate-400 dark:border-l-slate-500'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-foreground'
                  }`}
                >
                  <s.icon className="w-4 h-4 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold truncate">{s.label}</div>
                    <div className="text-[11px] text-muted-foreground truncate">{s.desc}</div>
                  </div>
                  {activeSection === s.id && <ChevronRight className="w-3.5 h-3.5 text-red-600 dark:text-red-600 flex-shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile section picker */}
          <div className="md:hidden w-full mb-2">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all active:scale-95 ${
                    activeSection === s.id
                      ? 'bg-red-600 text-white'
                      : 'bg-card border border-border text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <s.icon className="w-3.5 h-3.5" /> {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">

            {/* Profile */}
            {activeSection === 'profile' && (
              <div className="p-4 space-y-6">
                <h2 className="font-bold text-foreground flex items-center gap-2">
                  <User className="w-5 h-5 text-red-600" /> Profile
                </h2>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                    {user?.name?.substring(0, 2).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <div className="font-bold text-foreground text-lg">{user?.name}</div>
                    <div className="text-sm text-muted-foreground">{user?.email}</div>
                    {user?.institution && (
                      <div className="text-xs text-muted-foreground mb-1">
                        Institution: {user.institution}
                      </div>
                    )}
                    <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-foreground border border-slate-300 dark:border-slate-600 rounded-md">
                      {user?.role === 'lecturer' ? 'Lecturer' : 'Student'}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-foreground mb-1">Full Name</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 border border-border rounded-lg text-sm bg-background text-foreground focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-foreground mb-1">Institution</label>
                    <input
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      placeholder="Enter your institution"
                      className="w-full px-4 py-3 border border-border rounded-lg text-sm bg-background text-foreground focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-foreground mb-1">Research Field</label>
                    <input
                      value={researchField}
                      onChange={(e) => setResearchField(e.target.value)}
                      className="w-full px-4 py-3 border border-border rounded-lg text-sm bg-background text-foreground focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>
                <button
                  onClick={handleSave}
                  className="px-5 py-2.5 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-all active:scale-95"
                >
                  Save Changes
                </button>
              </div>
            )}

            {/* Preferences */}
            {activeSection === 'preferences' && (
              <div className="p-4 space-y-6">
                <h2 className="font-bold text-foreground flex items-center gap-2">
                  <Palette className="w-5 h-5 text-red-600" /> Preferences
                </h2>

                {/* Font Selection */}
                <div>
                  <label className="block text-sm font-bold text-foreground mb-3">
                    Font Family
                  </label>
                  <FontSelector />
                </div>

                {/* Citation Format */}
                <div>
                  <label className="block text-sm font-bold text-foreground mb-3">
                    Default Citation Format
                  </label>
                  <div className="flex gap-3">
                    {(['APA', 'MLA', 'Chicago'] as const).map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => setCitationFormat(fmt)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 text-sm font-bold transition-all active:scale-95 ${
                          citationFormat === fmt
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-2'
                            : 'border-border bg-card text-muted-foreground hover:border-muted hover:bg-muted'
                        }`}
                      >
                        {citationFormat === fmt && <Check className="w-4 h-4" />}
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Default Analysis Depth */}
                <div>
                  <label className="block text-sm font-bold text-foreground mb-3">
                    Default Analysis Depth
                  </label>
                  <div className="bg-muted border border-border rounded-xl p-4">
                    <div className="relative pt-6 pb-2">
                      <input
                        type="range" min="1" max="3" step="1"
                        value={defaultDepth}
                        onChange={(e) => setDefaultDepth(parseInt(e.target.value) as 1 | 2 | 3)}
                        className="w-full h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-red-600"
                      />
                      <div className="absolute top-0 left-0 w-full flex justify-between text-[11px] font-bold text-muted-foreground px-1 uppercase tracking-wider">
                        <span className={defaultDepth === 1 ? 'text-red-600' : ''}>Fast</span>
                        <span className={defaultDepth === 2 ? 'text-red-600' : ''}>Regular</span>
                        <span className={defaultDepth === 3 ? 'text-red-600' : ''}>Deep</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Theme */}
                <div>
                  <label className="block text-sm font-bold text-foreground mb-3">Appearance</label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setTheme('dark')}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 text-sm font-bold transition-all active:scale-95 ${
                        theme === 'dark' ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-2' : 'border-border bg-card text-muted-foreground hover:border-muted hover:bg-muted'
                      }`}
                    >
                      <Moon className="w-4 h-4" /> Dark
                    </button>
                    <button
                      onClick={() => setTheme('light')}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 text-sm font-bold transition-all active:scale-95 ${
                        theme === 'light' ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-2' : 'border-border bg-card text-muted-foreground hover:border-muted hover:bg-muted'
                      }`}
                    >
                      <Sun className="w-4 h-4" /> Light
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleSave}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-foreground rounded-lg text-sm font-bold transition-all active:scale-95"
                >
                  Save Preferences
                </button>
              </div>
            )}

            {/* Notifications */}
            {activeSection === 'notifications' && (
              <div className="p-4 space-y-5">
                <h2 className="font-bold text-foreground flex items-center gap-2">
                  <Bell className="w-5 h-5 text-red-600" /> Notifications
                </h2>
                {[
                  { label: 'Weekly research digest', desc: 'Summary of your library activity', state: emailDigest, setter: setEmailDigest },
                  { label: 'Analysis complete alerts', desc: 'Notify when AI finishes processing', state: analysisAlerts, setter: setAnalysisAlerts },
                ].map(({ label, desc, state, setter }) => (
                  <div key={label} className="flex items-center justify-between p-4 border border-border rounded-xl">
                    <div>
                      <div className="font-bold text-foreground text-sm">{label}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
                    </div>
                    <button
                      onClick={() => setter(!state)}
                      className={`relative w-11 h-6 rounded-full transition-all active:scale-95 ${state ? 'bg-slate-500' : 'bg-muted'}`}
                    >
                      <span className={`absolute top-1 left-1 w-4 h-4 bg-card rounded-full shadow transition-transform ${state ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Privacy */}
            {activeSection === 'privacy' && (
              <div className="p-4 space-y-5">
                <h2 className="font-bold text-foreground flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-600" /> Privacy & Data
                </h2>
                <div className="bg-card border border-border rounded-xl p-4">
                  <p className="text-sm text-muted-foreground font-medium">
                    Your research data is stored locally and is never shared with third parties without your explicit consent.
                  </p>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={() => toast.success('Your data export has been queued. You\'ll receive a download link shortly.')}
                    className="w-full flex items-center gap-3 px-4 py-3.5 border border-border rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-98 text-left"
                  >
                    <BookOpen className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="font-bold text-red-400 text-sm">Export all data</div>
                      <div className="text-xs text-red-300">Download your library and chat history</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
                  </button>
                  <button
                    onClick={() => toast.error('Account deletion requires email confirmation. A link has been sent.')}
                    className="w-full flex items-center gap-3 px-4 py-3.5 border border-border rounded-xl hover:bg-red-50 transition-all active:scale-98 text-left"
                  >
                    <Shield className="w-5 h-5 text-red-600" />
                    <div>
                      <div className="font-bold text-red-400 text-sm">Delete account</div>
                      <div className="text-xs text-red-300">Permanently remove all your data</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
