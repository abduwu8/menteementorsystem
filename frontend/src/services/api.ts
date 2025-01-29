import axios from 'axios';

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

// Add a function to validate and parse user data
const getUserFromStorage = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    const user = JSON.parse(userStr);
    return user && user.name ? user : null;  // Validate user has required fields
  } catch (e) {
    console.error('Error parsing user data:', e);
    return null;
  }
};

// Add a function to safely store user data
const setUserInStorage = (user) => {
  try {
    if (user && user.name) {  // Validate user has required fields
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      console.error('Invalid user data:', user);
    }
  } catch (e) {
    console.error('Error storing user data:', e);
  }
};

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
    // If the response contains user data, validate and store it
    if (response.data && response.data.user) {
      setUserInStorage(response.data.user);
    }
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
        const { token, user } = response.data;
        
        if (token && user && user.name) {  // Validate user has required fields
          localStorage.setItem('token', token);
          setUserInStorage(user);
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        } else {
          throw new Error('Invalid token refresh response');
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // If we get a 404 or the user data is invalid, redirect to login
    if (error.response?.status === 404 || !getUserFromStorage()) {
      console.error('User-related resource not found or invalid user data');
      localStorage.clear();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: async (data: { email: string; password: string; role: 'mentor' | 'mentee' }) => {
    const response = await api.post('/auth/login', data);
    const { token, user } = response.data;
    
    if (!token || !user || !user.name) {
      throw new Error('Invalid login response');
    }
    
    localStorage.setItem('token', token);
    setUserInStorage(user);
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
    const { token, user } = response.data;
    
    if (!token || !user || !user.name) {
      throw new Error('Invalid registration response');
    }
    
    localStorage.setItem('token', token);
    setUserInStorage(user);
    return response.data;
  },
  
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.clear();
      window.location.href = '/login';
    }
  },

  // Add a method to check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    const user = getUserFromStorage();
    return !!(token && user && user.name);
  },

  // Add a method to get current user
  getCurrentUser: () => {
    return getUserFromStorage();
  }
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
    const response = await api.get('/sessionrequests/upcoming');
    return response.data;
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
    const response = await api.get('/sessions/requests');
    return response.data;
  },

  handleSessionRequest: async (requestId: string, status: 'approved' | 'rejected' | 'cancelled') => {
    const response = await api.put(`/sessions/requests/${requestId}`, { status });
    return response.data;
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
