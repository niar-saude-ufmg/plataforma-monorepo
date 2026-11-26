import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import {
  ACCESS_TOKEN_STORAGE_KEY,
  clearPlatformSession,
  readPlatformSession,
  SESSION_CHANGED_EVENT,
} from '@niar/auth';
import { resetAssistantStore } from '../store/session/session.actions';
import { store } from '../store';

export type User = {
  id: number;
  email: string;
  full_name: string;
  role: string;
  account_status: 'pending' | 'active' | 'rejected' | 'disabled';
};

const readUserFromShellSession = (): User | null => {
  const session = readPlatformSession();
  if (!session) return null;

  const accountStatus = session.accountStatus ?? 'active';

  return {
    id: session.id,
    email: session.email,
    full_name: session.name,
    role: session.role,
    account_status: accountStatus,
  };
};

const getAdminApiBaseUrl = () => import.meta.env.VITE_ADMIN_API_URL || '/api/admin';

// Confirma junto ao admin-api que o token salvo pela shell ainda é válido.
// Sem isso, um token expirado ou um usuário desativado continuariam
// "logados" aqui, porque readUserFromShellSession só lê o que já está
// salvo no localStorage, sem checar nada com o servidor.
const isSessionStillValid = async (): Promise<boolean> => {
  const token = window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
  if (!token) {
    return false;
  }

  const response = await fetch(`${getAdminApiBaseUrl()}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  return response.ok;
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const initialUser = readUserFromShellSession();
  const [user, setUser] = useState<User | null>(initialUser);
  const userKeyRef = useRef(initialUser ? `${initialUser.id}:${initialUser.role}` : null);
  const [loading, setLoading] = useState(true);

  const syncUser = (nextUser: User | null) => {
    const nextKey = nextUser ? `${nextUser.id}:${nextUser.role}` : null;
    if (userKeyRef.current !== nextKey) store.dispatch(resetAssistantStore());
    userKeyRef.current = nextKey;
    setUser(nextUser);
  };

  useEffect(() => {
    isSessionStillValid()
      .then((valid) => {
        if (!valid) {
          clearPlatformSession();
          syncUser(null);
        }
      })
      .catch(() => {
        // Falha de rede/servidor não deve deslogar ninguém — só significa
        // que não deu pra confirmar a validade agora. Mantém a sessão que
        // já estava salva.
        console.warn("Não foi possível confirmar a validade da sessão.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const refreshSession = () => syncUser(readUserFromShellSession());
    window.addEventListener(SESSION_CHANGED_EVENT, refreshSession);
    return () => window.removeEventListener(SESSION_CHANGED_EVENT, refreshSession);
  }, []);

  const logout = () => {
    clearPlatformSession();
    syncUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
