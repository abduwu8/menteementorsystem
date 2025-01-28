import { useState, useEffect } from 'react';
import axios from 'axios';
import { User } from '../types/mentorship';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setState({ user: null, loading: false, error: null });
          return;
        }

        const response = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setState({
          user: response.data,
          loading: false,
          error: null
        });
      } catch (err) {
        setState({
          user: null,
          loading: false,
          error: 'Authentication failed'
        });
        localStorage.removeItem('token');
      }
    };

    checkAuth();
  }, []);

  return state;
} 