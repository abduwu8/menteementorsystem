import axios from 'axios';
import { sessionService } from '../api';

// Get the current domain and environment
const isProduction = window.location.hostname === 'menteementorsystemm.onrender.com';
const baseURL = isProduction 
  ? '/api'  // Use relative path in production
  : 'http://localhost:5000/api';  // Development URL

console.log('Environment:', isProduction ? 'production' : 'development');
console.log('Using API baseURL:', baseURL);

// Configure axios with base URL and default headers
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true,
  timeout: isProduction ? 30000 : 15000  // Longer timeout for production
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  console.log('API Request:', {
    url: config.url,
    method: config.method,
    baseURL: config.baseURL,
    headers: config.headers,
    environment: isProduction ? 'production' : 'development'
  });
  return config;
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

interface DashboardStats {
  totalSessions: number;
  hoursSpent: number;
  activeMentees: number;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
}

interface Session {
  _id: string;
  mentee: {
    _id: string;
    name: string;
    email: string;
    currentRole: string;
  };
  mentor: {
    _id: string;
    name: string;
    email: string;
  };
  date: string;
  timeSlot: TimeSlot;
  topic: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

const dashboardService = {
  // Get mentor's dashboard statistics
  getMentorStats: async (): Promise<DashboardStats> => {
    try {
      const response = await api.get('/mentors/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Error in getMentorStats:', error);
      throw error;
    }
  },

  // Get mentor's upcoming sessions
  getUpcomingSessions: async (): Promise<Session[]> => {
    try {
      console.log('Fetching upcoming sessions...');
      const response = await api.get('/sessions/upcoming');
      
      // Validate and filter out invalid session data
      const sessions = response.data.filter((session: Session) => 
        session && 
        session._id && 
        session.mentee && 
        session.mentee.name && 
        session.date && 
        session.timeSlot
      );

      console.log('Filtered sessions:', sessions);
      return sessions;
    } catch (error) {
      console.error('Error in getUpcomingSessions:', error);
      throw error;
    }
  },

  // Use sessionService for completing sessions
  completeSession: async (sessionId: string) => {
    try {
      console.log('Completing session:', sessionId);
      const response = await api.put(`/sessions/${sessionId}/complete`);
      console.log('Session completed successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error in completeSession:', error);
      if (error.response?.status === 403) {
        throw new Error('You do not have permission to complete this session.');
      } else if (error.response?.status === 404) {
        throw new Error('Session not found or already completed.');
      }
      throw new Error(error.response?.data?.message || 'Failed to complete session');
    }
  }
};

export type { DashboardStats, Session };
export default dashboardService; 