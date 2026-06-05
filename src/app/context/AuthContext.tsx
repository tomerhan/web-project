import { createContext, useContext, useState, ReactNode } from 'react';
import { User, mockUsers } from '../data/mockData';

interface AuthContextType {
  user: User | null;
  loginAs: (role: 'lecturer' | 'student') => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (payload: { name: string; email: string; institution: string; password: string; }) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const loginAs = (role: 'lecturer' | 'student') => {
    const found = mockUsers.find(u => u.role === role);
    if (found) setUser(found);
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      // Expecting { user: User, token?: string }
      if (data?.user) {
        setUser(data.user as User);
        if (data.token) localStorage.setItem('authToken', data.token);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const register = async (payload: { name: string; email: string; institution: string; password: string; }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) return false;
      const data = await res.json();
      // Expecting { user: User, token?: string }
      if (data?.user) {
        setUser(data.user as User);
        if (data.token) localStorage.setItem('authToken', data.token);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginAs, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
