import axios from 'axios';

// Get the current domain and environment
const isProduction = window.location.hostname === 'menteementorsystemm.onrender.com';
const baseURL = isProduction 
  ? '/api'  // Use relative path in production
  : 'http://localhost:5000/api';  // Development URL

console.log('Environment:', isProduction ? 'production' : 'development');
console.log('Using API baseURL:', baseURL);

// Create a shared API instance
export const api = axios.create({
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
  const userStr = localStorage.getItem('user');
  
  console.log('Current user data:', userStr);
  
  let user = null;
  try {
    user = userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    console.error('Error parsing user data:', e);
  }
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Add user role to headers if available
  if (user && user.role) {
    config.headers['X-User-Role'] = user.role;
    console.log('Setting user role in headers:', user.role);
  } else {
    console.warn('No user role found in localStorage');
  }

  console.log('API Request:', {
    url: config.url,
    method: config.method,
    baseURL: config.baseURL,
    headers: config.headers,
    environment: isProduction ? 'production' : 'development',
    userRole: user?.role
  });
  return config;
}, (error) => {
  console.error('Request interceptor error:', error);
  return Promise.reject(error);
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    // Update user role from response headers if available
    const userRole = response.headers['x-user-role'];
    const userStr = localStorage.getItem('user');
    let user = null;
    
    try {
      user = userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      console.error('Error parsing user data:', e);
    }

    if (userRole && user) {
      if (user.role !== userRole) {
        console.log('Updating user role:', { old: user.role, new: userRole });
        user.role = userRole;
        localStorage.setItem('user', JSON.stringify(user));
      }
    }

    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data,
      headers: response.headers,
      userRole: user?.role
    });
    return response;
  },
  async (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
      userRole: JSON.parse(localStorage.getItem('user') || '{}')?.role
    });

    const originalRequest = error.config;

    // Handle token refresh for 401 errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const response = await api.post('/auth/refresh-token');
        const { token, user } = response.data;
        
        if (token) {
          localStorage.setItem('token', token);
          if (user) {
            console.log('Updating user data after token refresh:', user);
            localStorage.setItem('user', JSON.stringify(user));
          }
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          if (user?.role) {
            originalRequest.headers['X-User-Role'] = user.role;
          }
          return api(originalRequest);
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
  getSessionRequests: async () => {
    try {
      console.log('Calling getSessionRequests endpoint...');
      const response = await api.get('/sessionrequests');
      console.log('Session requests response:', response);
      return response.data;
    } catch (error) {
      console.error('Error in getSessionRequests:', error);
      throw error;
    }
  },

  getDashboardSessions: async () => {
    try {
      console.log('Fetching dashboard sessions...');
      const response = await api.get('/sessionrequests/dashboard');
      console.log('Dashboard sessions response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in getDashboardSessions:', error);
      throw error;
    }
  },

  handleSessionRequest: async (requestId: string, status: 'approved' | 'rejected' | 'cancelled') => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      console.log('Current user before request:', { role: user.role, id: user.id });

      // Validate user role and action
      if (!user.role) {
        throw new Error('User role not found');
      }

      if ((['approved', 'rejected'].includes(status) && user.role !== 'mentor') ||
          (status === 'cancelled' && user.role !== 'mentee')) {
        throw new Error(`You do not have permission to ${status} this request. Required role: ${
          ['approved', 'rejected'].includes(status) ? 'mentor' : 'mentee'
        }`);
      }

      console.log('Sending session request update:', { requestId, status });
      const response = await api.put(`/sessionrequests/${requestId}/status`, { 
        status,
        role: user.role
      });
      
      console.log('Session request update response:', {
        data: response.data,
        headers: response.headers,
        userRole: user.role
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Error in handleSessionRequest:', {
        error,
        requestId,
        status,
        response: error.response?.data,
        userRole: JSON.parse(localStorage.getItem('user') || '{}')?.role
      });
      
      // Throw a more user-friendly error message
      if (error.response?.status === 404) {
        throw new Error('Session request not found or already handled');
      } else if (error.response?.status === 403) {
        throw new Error(`You do not have permission to modify this request. Required role: ${error.response.data.requiredRole}`);
      } else if (error.response?.status === 400) {
        throw new Error(error.response.data.message || 'Invalid request');
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Failed to update session request');
      }
    }
  },

  requestSession: async (data: any) => {
    try {
      const response = await api.post('/sessions/request', data);
      return response.data;
    } catch (error) {
      console.error('Error in requestSession:', error);
      throw error;
    }
  },

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

  getUpcomingSessions: async () => {
    try {
      console.log('Fetching upcoming sessions...');
      const response = await api.get('/sessionrequests/upcoming');
      console.log('Upcoming sessions response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in getUpcomingSessions:', error);
      throw error;
    }
  },

  getBookedSlots: async (mentorId: string, date: string) => {
    try {
      const response = await api.get('/sessions/booked-slots', {
        params: { mentorId, date }
      });
      return response.data;
    } catch (error) {
      console.error('Error in getBookedSlots:', error);
      throw error;
    }
  },

  cancelSession: async (requestId: string) => {
    try {
      console.log('Cancelling session request:', requestId);
      const response = await api.put(`/sessionrequests/${requestId}/status`, { status: 'cancelled' });
      console.log('Session cancelled successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error in cancelSession:', error);
      if (error.response?.status === 403) {
        throw new Error('You do not have permission to cancel this session');
      } else if (error.response?.status === 404) {
        throw new Error('Session not found or already cancelled');
      }
      throw new Error(error.response?.data?.message || 'Failed to cancel session');
    }
  },

  completeSession: async (sessionId: string) => {
    try {
      console.log('Completing session:', sessionId);
      const response = await api.post(`/sessionrequests/${sessionId}/complete`);
      console.log('Session completed successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error in completeSession:', error);
      if (error.response?.status === 403) {
        throw new Error('You do not have permission to complete this session');
      } else if (error.response?.status === 404) {
        throw new Error('Session not found or already completed');
      }
      throw new Error(error.response?.data?.message || 'Failed to complete session');
    }
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
