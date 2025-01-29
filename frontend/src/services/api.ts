import axios from 'axios';
import { Session } from './api/dashboardService';

// Get the current domain and protocol
const hostname = window.location.hostname;

// Set the base URL based on the environment
const baseURL = hostname === 'localhost'
  ? 'http://localhost:5000/api'  // Development
  : '/api';  // Production (relative path)

console.log('Current hostname:', hostname);
console.log('Using API baseURL:', baseURL);

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 10000,
});

// Add request logging with more details
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  
  // Always include token in Authorization header if it exists
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  console.log('API Request:', {
    url: config.url,
    method: config.method,
    baseURL: config.baseURL,
    headers: config.headers,
    fullUrl: `${config.baseURL}${config.url}`
  });
  
  return config;
}, (error) => {
  console.error('Request error:', error);
  return Promise.reject(error);
});

// Enhanced error handling
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  async (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      response: error.response?.data,
      baseURL: error.config?.baseURL
    });

    const originalRequest = error.config;

    // Handle 401 and 403 errors
    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Try to refresh the token
        const response = await api.post('/auth/refresh-token');
        const { token } = response.data;
        
        if (token) {
          localStorage.setItem('token', token);
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Clear user data and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: async (data: { email: string; password: string; role: 'mentor' | 'mentee' }) => {
    const response = await api.post('/auth/login', data);
    // Store token and user data
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  },
  register: async (data: { 
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
    const response = await api.post('/auth/register', data);
    // Store token and user data
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  },
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },
};

// Mentor services
export const mentorService = {
  getAllMentors: async () => {
    const response = await api.get('/mentors');
    return response.data;
  },
  getMentorById: async (id: string) => {
    const response = await api.get(`/mentors/${id}`);
    return response.data;
  },
  getMentees: async () => {
    const response = await api.get('/mentors/mentees');
    return response.data;
  },
  getConnectionRequests: async () => {
    const response = await api.get('/mentors/connection-requests');
    return response.data;
  },
  handleConnectionRequest: async (requestId: string, status: 'approved' | 'rejected') => {
    const response = await api.put(`/mentors/connection-requests/${requestId}`, { status });
    return response.data;
  },
  updateProfile: async (data: {
    name?: string;
    bio?: string;
    expertise?: string[];
    yearsOfExperience?: number;
    currentRole?: string;
    company?: string;
    linkedIn?: string;
    availableSlots?: Array<{ 
      date: string;
      timeSlots: Array<{ 
        startTime: string; 
        endTime: string; 
      }> 
    }>;
  }) => {
    console.log('Raw data being sent to updateProfile:', JSON.stringify(data, null, 2));
    const response = await api.put('/mentors/profile', data);
    console.log('Response from updateProfile:', JSON.stringify(response.data, null, 2));
    return response.data;
  },
  requestConnection: async (mentorId: string, message: string) => {
    const response = await api.post(`/mentors/${mentorId}/connect`, { message });
    return response.data;
  },
};

// Mentee services
export const menteeService = {
  getMenteeProfile: async () => {
    const response = await api.get('/mentees/profile');
    return response.data;
  },
  updateProfile: async (data: {
    name?: string;
    interests?: string[];
    goals?: string;
    currentRole?: string;
    education?: string;
  }) => {
    const response = await api.put('/mentees/profile', data);
    return response.data;
  },
};

// Session services
export const sessionService = {
  getUpcomingSessions: async () => {
    try {
      const response = await api.get('/sessionrequests/upcoming');
      // Validate and filter out invalid session data
      return response.data.filter((session: Session) => 
        session && 
        session._id && 
        session.mentee && 
        session.mentee.name && 
        session.date && 
        session.timeSlot
      );
    } catch (error) {
      console.error('Error in getUpcomingSessions:', error);
      throw error;
    }
  },

  getAvailableSessions: async () => {
    const response = await api.get('/sessions/available');
    return response.data;
  },

  getMySessions: async () => {
    const response = await api.get('/sessions');
    return response.data;
  },

  scheduleSession: async (sessionId: string, data: { mentorId: string; slotId: string }) => {
    const response = await api.post(`/sessions/${sessionId}/schedule`, data);
    return response.data;
  },

  requestSession: async (data: {
    mentorId: string;
    date: string;
    timeSlot: {
      startTime: string;
      endTime: string;
    };
    topic: string;
    description: string;
  }) => {
    const response = await api.post('/sessions/request', data);
    return response.data;
  },

  getSessionRequests: async () => {
    try {
      console.log('Calling getSessionRequests endpoint...');
      const response = await api.get('/sessionrequests');
      
      // Validate and filter out invalid session data
      const validRequests = response.data.filter((request: Session) => 
        request && 
        request._id && 
        request.mentee && 
        request.mentee.name && 
        request.date && 
        request.timeSlot &&
        request.timeSlot.startTime &&
        request.timeSlot.endTime
      );
      console.log('Session requests response:', validRequests);
      return validRequests;
    } catch (error: any) {
      console.error('Error in getSessionRequests:', error);
      if (error.response?.status === 403) {
        throw new Error('You do not have permission to view session requests. Please make sure you are logged in as a mentor.');
      }
      throw error;
    }
  },

  handleSessionRequest: async (requestId: string, status: 'approved' | 'rejected' | 'cancelled') => {
    try {
      console.log('Handling session request:', { requestId, status });
      // Update the endpoint to match the backend route structure
      const response = await api.put(`/sessionrequests/${requestId}`, { status });
      console.log('Session request handled successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error in handleSessionRequest:', error);
      if (error.response?.status === 403) {
        throw new Error('You do not have permission to handle this request. Please make sure you are logged in as a mentor.');
      } else if (error.response?.status === 404) {
        throw new Error('Session request not found. It may have been cancelled or already handled.');
      }
      throw new Error(error.response?.data?.message || 'Failed to handle session request');
    }
  },

  getBookedSlots: async (mentorId: string, date: string) => {
    const response = await api.get('/sessions/booked-slots', {
      params: { mentorId, date }
    });
    return response.data;
  }
};

// Lecture request services
export const lectureService = {
  getLectureRequests: async () => {
    const response = await api.get('/lecture-requests');
    return response.data;
  },
  createLectureRequest: async (data: {
    mentorId: string;
    subject: string;
    description: string;
    date: string;
  }) => {
    const response = await api.post('/lecture-requests', data);
    return response.data;
  },
  updateLectureRequest: async (requestId: string, status: string) => {
    const response = await api.put(`/lecture-requests/${requestId}`, { status });
    return response.data;
  },
};

export default api; 
