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
}, (error) => {
  console.error('Request interceptor error:', error);
  return Promise.reject(error);
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
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

interface TimeSlot {
  startTime: string;
  endTime: string;
}

interface SessionRequest {
  mentorId: string;
  date: string;
  timeSlot: TimeSlot;
  topic: string;
  description: string;
}

export const sessionService = {
  getAvailableSessions: async () => {
    try {
      const response = await api.get('/sessions/available');
      return response.data;
    } catch (error) {
      console.error('Error in getAvailableSessions:', error);
      throw error;
    }
  },

  getMySessions: async () => {
    try {
      const response = await api.get('/sessions');
      return response.data;
    } catch (error) {
      console.error('Error in getMySessions:', error);
      throw error;
    }
  },

  scheduleSession: async (sessionId: string, data: { mentorId: string; slotId: string }) => {
    try {
      const response = await api.post(`/sessions/${sessionId}/schedule`, data);
      return response.data;
    } catch (error) {
      console.error('Error in scheduleSession:', error);
      throw error;
    }
  },

  requestSession: async (data: SessionRequest) => {
    try {
      const response = await api.post('/sessions/request', data);
      return response.data;
    } catch (error) {
      console.error('Error in requestSession:', error);
      throw error;
    }
  },

  getSessionRequests: async () => {
    try {
      console.log('Calling getSessionRequests endpoint...');
      const response = await api.get('/sessions/requests');
      console.log('Session requests response:', response);
      return response.data;
    } catch (error) {
      console.error('Error in getSessionRequests:', error);
      throw error;
    }
  },

  handleSessionRequest: async (requestId: string, status: 'approved' | 'rejected' | 'cancelled') => {
    try {
      console.log('Sending session request update:', { requestId, status });
      const response = await api.put(`/sessions/requests/${requestId}`, { status });
      console.log('Session request update response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error in handleSessionRequest:', {
        error,
        requestId,
        status,
        response: error.response?.data
      });
      
      // Throw a more user-friendly error message
      if (error.response?.status === 404) {
        throw new Error('Session request not found or already handled');
      } else if (error.response?.status === 403) {
        throw new Error('You do not have permission to modify this request');
      } else if (error.response?.status === 400) {
        throw new Error(error.response.data.message || 'Invalid request');
      } else {
        throw new Error('Failed to update session request');
      }
    }
  },

  getUpcomingSessions: async () => {
    try {
      console.log('Fetching upcoming sessions...');
      const response = await api.get('/sessions/upcoming');
      console.log('Upcoming sessions response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in getUpcomingSessions:', error);
      throw error;
    }
  },

  getBookedSlots: async (mentorId: string, date: string): Promise<TimeSlot[]> => {
    try {
      const response = await api.get('/sessions/booked-slots', {
        params: { mentorId, date }
      });
      return response.data;
    } catch (error) {
      console.error('Error in getBookedSlots:', error);
      throw error;
    }
  }
};

export default sessionService; 