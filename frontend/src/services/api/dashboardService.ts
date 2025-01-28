import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface DashboardStats {
  totalSessions: number;
  hoursSpent: number;
  activeMentees: number;
}

const dashboardService = {
  // Get mentor's dashboard statistics
  getMentorStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/mentors/dashboard/stats');
    return response.data;
  },

  // Get mentor's upcoming sessions
  getUpcomingSessions: async () => {
    const response = await api.get('/sessionrequests/upcoming');
    return response.data;
  },

  // Mark session as completed
  completeSession: async (sessionId: string) => {
    const response = await api.post(`/sessionrequests/${sessionId}/complete`);
    return response.data;
  }
};

export type { DashboardStats };
export default dashboardService; 