import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  ACCESS_TOKEN_STORAGE_KEY,
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
  const [user, setUser] = useState<User | null>(() => readUserFromShellSession());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    isSessionStillValid()
      .then((valid) => {
        if (!valid) {
          clearPlatformSession();
          setUser(null);
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
    const refreshSession = () => setUser(readUserFromShellSession());
    window.addEventListener(SESSION_CHANGED_EVENT, refreshSession);
    return () => window.removeEventListener(SESSION_CHANGED_EVENT, refreshSession);
  }, []);

  const logout = () => {
    clearPlatformSession();
    setUser(null);
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
