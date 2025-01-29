import axios from 'axios';

// Get the current domain and environment
const hostname = window.location.hostname;
const isProduction = hostname.includes('render.com') || hostname === 'menteementorsystemm.onrender.com';

// Set the base URL based on the environment
const baseURL = isProduction
  ? 'https://menteementorsystemm.onrender.com/api'  // Production URL
  : 'http://localhost:5000/api';  // Development

console.log('Environment:', isProduction ? 'production' : 'development');
console.log('Using API baseURL:', baseURL);

// Configure axios with base URL and default headers
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Origin': isProduction ? 'https://menteementorsystemm.onrender.com' : 'http://localhost:5173'
  },
  withCredentials: true,
  timeout: isProduction ? 30000 : 15000  // Longer timeout for production
});

// Add request interceptor to include auth token and handle CORS
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Add CORS headers for production
  if (isProduction) {
    config.headers['Access-Control-Allow-Origin'] = 'https://menteementorsystemm.onrender.com';
    config.headers['Access-Control-Allow-Credentials'] = 'true';
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
    // If the error is due to local server being down in production, retry with production URL
    if (isProduction && error.message?.includes('Network Error')) {
      console.log('Network error detected, ensuring production URL is used');
      const originalRequest = error.config;
      originalRequest.baseURL = 'https://menteementorsystemm.onrender.com/api';
      return axios(originalRequest);
    }

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
      const response = await api.put(`/sessions/requests/${requestId}`, { status });
      return response.data;
    } catch (error) {
      console.error('Error in handleSessionRequest:', error);
      throw error;
    }
  },

  getUpcomingSessions: async () => {
    try {
      console.log('Fetching upcoming sessions...');
      const response = await api.get('/sessionrequests/upcoming');
      console.log('Upcoming sessions response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in getUpcomingSessions:', error);
      if (isProduction) {
        // Retry with explicit production URL if first attempt fails
        try {
          const retryResponse = await axios.get('https://menteementorsystemm.onrender.com/api/sessionrequests/upcoming', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json',
              'Origin': 'https://menteementorsystemm.onrender.com'
            },
            withCredentials: true
          });
          return retryResponse.data;
        } catch (retryError) {
          console.error('Retry also failed:', retryError);
          throw retryError;
        }
      }
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