import axios from 'axios';

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

    // If we get a 404 for dashboard endpoints, it might mean the user's session is invalid
    if (error.response?.status === 404 && 
        (error.config.url?.includes('/dashboard') || 
         error.config.url?.includes('/sessions'))) {
      console.error('Dashboard resource not found or user unauthorized');
      // Check if user data exists
      const user = localStorage.getItem('user');
      if (!user) {
        localStorage.clear();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

interface DashboardStats {
  totalSessions: number;
  hoursSpent: number;
  activeMentees: number;
}

const dashboardService = {
  // Get mentor's dashboard statistics
  getMentorStats: async (): Promise<DashboardStats> => {
    try {
      // Verify user is logged in before making request
      const user = localStorage.getItem('user');
      if (!user) {
        throw new Error('User not authenticated');
      }

      const response = await api.get('/mentors/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Error in getMentorStats:', error);
      throw error;
    }
  },

  // Get mentor's upcoming sessions
  getUpcomingSessions: async () => {
    try {
      // Verify user is logged in before making request
      const user = localStorage.getItem('user');
      if (!user) {
        throw new Error('User not authenticated');
      }

      const response = await api.get('/sessionrequests/upcoming');
      return response.data;
    } catch (error) {
      console.error('Error in getUpcomingSessions:', error);
      // If we get a 404, it might mean the user's session is invalid
      if ((error as any).response?.status === 404) {
        const user = localStorage.getItem('user');
        if (!user) {
          localStorage.clear();
          window.location.href = '/login';
        }
      }
      throw error;
    }
  },

  // Mark session as completed
  completeSession: async (sessionId: string) => {
    try {
      // Verify user is logged in before making request
      const user = localStorage.getItem('user');
      if (!user) {
        throw new Error('User not authenticated');
      }

      const response = await api.post(`/sessions/${sessionId}/complete`);
      return response.data;
    } catch (error) {
      console.error('Error in completeSession:', error);
      throw error;
    }
  }
};

export type { DashboardStats };
export default dashboardService; 