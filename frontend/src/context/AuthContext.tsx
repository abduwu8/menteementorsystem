import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'mentor' | 'mentee';
  expertise?: string[];
  bio?: string;
  yearsOfExperience?: number;
  currentRole?: string;
  company?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string, role: 'mentor' | 'mentee') => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    role: 'mentor' | 'mentee';
    expertise?: string[];
    bio?: string;
    yearsOfExperience?: number;
    currentRole?: string;
    company?: string;
  }) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for stored user data on mount
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const login = async (email: string, password: string, role: 'mentor' | 'mentee') => {
    try {
      setError(null);
      setIsLoading(true);
      const { token, user } = await authService.login({ email, password, role });
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to login');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    role: 'mentor' | 'mentee';
    expertise?: string[];
    bio?: string;
    yearsOfExperience?: number;
    currentRole?: string;
    company?: string;
  }) => {
    try {
      setError(null);
      setIsLoading(true);
      const { token, user } = await authService.register(data);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, error, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 