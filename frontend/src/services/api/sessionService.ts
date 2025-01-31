import axios, { 
  AxiosResponse, 
  AxiosError, 
  InternalAxiosRequestConfig,
} from 'axios';

// Get the current domain and environment
const isProduction = window.location.hostname === 'menteementorsystemm.onrender.com';
const baseURL = isProduction 
  ? '/api'  // Use relative path in production
  : 'http://localhost:5000/api';  // Development URL

console.log('Environment:', isProduction ? 'production' : 'development');
console.log('Using API baseURL:', baseURL);

// Add custom property to AxiosRequestConfig
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Configure axios with base URL and default headers
const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true,
  timeout: isProduction ? 30000 : 15000  // Longer timeout for production
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add user role to headers if available
    if (user && user.role && config.headers) {
      config.headers['X-User-Role'] = user.role;
    }

    console.log('API Request:', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      headers: config.headers,
      environment: isProduction ? 'production' : 'development'
    });
    return config;
  },
  (error: AxiosError) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Update user role from response headers if available
    const userRole = response.headers['x-user-role'];
    if (userRole) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user && user.role !== userRole) {
        user.role = userRole;
        localStorage.setItem('user', JSON.stringify(user));
      }
    }

    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  async (error: AxiosError) => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });

    const originalRequest = error.config as CustomAxiosRequestConfig;

    // Handle token refresh for 401 errors
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const response = await apiClient.post('/auth/refresh-token');
        const { token, user } = response.data;
        
        if (token) {
          localStorage.setItem('token', token);
          if (user) {
            localStorage.setItem('user', JSON.stringify(user));
          }
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          if (originalRequest.headers) {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
          }
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
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
      const response = await apiClient.get('/sessionrequests/available');
      return response.data;
    } catch (error) {
      console.error('Error in getAvailableSessions:', error);
      throw error;
    }
  },

  getMySessions: async () => {
    try {
      const response = await apiClient.get('/sessionrequests');
      return response.data;
    } catch (error) {
      console.error('Error in getMySessions:', error);
      throw error;
    }
  },

  handleSessionRequest: async (requestId: string, status: 'approved' | 'rejected' | 'cancelled') => {
    try {
      console.log('Handling session request:', { requestId, status });
      const response = await apiClient.put(`/sessionrequests/${requestId}`, { status });
      console.log('Session request handled successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in handleSessionRequest:', error);
      throw error;
    }
  },

  requestSession: async (data: SessionRequest) => {
    try {
      const response = await apiClient.post('/sessionrequests', data);
      return response.data;
    } catch (error) {
      console.error('Error in requestSession:', error);
      throw error;
    }
  },

  getUpcomingSessions: async () => {
    try {
      console.log('Fetching upcoming sessions...');
      const response = await apiClient.get('/sessionrequests/upcoming');
      console.log('Upcoming sessions response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in getUpcomingSessions:', error);
      throw error;
    }
  },

  getBookedSlots: async (mentorId: string, date: string): Promise<TimeSlot[]> => {
    try {
      const response = await apiClient.get('/sessionrequests/available', {
        params: { mentorId, date }
      });
      return response.data;
    } catch (error) {
      console.error('Error in getBookedSlots:', error);
      throw error;
    }
  },

  completeSession: async (sessionId: string) => {
    try {
      const response = await apiClient.post(`/sessionrequests/${sessionId}/complete`);
      return response.data;
    } catch (error) {
      console.error('Error in completeSession:', error);
      throw error;
    }
  }
};

export default sessionService; 