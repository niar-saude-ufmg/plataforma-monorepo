import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  clearPlatformSession,
  readPlatformSession,
  SESSION_CHANGED_EVENT,
} from '@niar/auth';

type User = {
  id: number;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
};

const readUserFromShellSession = (): User | null => {
  const session = readPlatformSession();
  if (!session) return null;

  return {
    id: session.id,
    email: session.email,
    full_name: session.name,
    role: session.role,
    is_active: true,
  };
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => readUserFromShellSession());

  useEffect(() => {
    const refreshSession = () => setUser(readUserFromShellSession());
    window.addEventListener(SESSION_CHANGED_EVENT, refreshSession);
    return () => window.removeEventListener(SESSION_CHANGED_EVENT, refreshSession);
  }, []);

  const logout = () => {
    clearPlatformSession();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading: false, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
