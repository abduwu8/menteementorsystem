import axios from 'axios';

// Get the current domain and protocol
const hostname = window.location.hostname;

// Set the base URL based on the environment
const baseURL = hostname === 'localhost'
  ? 'http://localhost:5000/api'  // Development
  : '/api';  // Production (relative path)

console.log('Current hostname:', hostname);
console.log('Using API baseURL:', baseURL);

// Configure axios with base URL and default headers
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true,
  timeout: 10000
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
    headers: config.headers
  });
  return config;
});

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

  requestSession: async (data: SessionRequest) => {
    const response = await api.post('/sessions/request', data);
    return response.data;
  },

  getSessionRequests: async () => {
    console.log('Calling getSessionRequests endpoint...');
    const response = await api.get('/sessions/requests');
    console.log('Session requests response:', response);
    return response.data;
  },

  handleSessionRequest: async (requestId: string, status: 'approved' | 'rejected' | 'cancelled') => {
    const response = await api.put(`/sessions/requests/${requestId}`, { status });
    return response.data;
  },

  getUpcomingSessions: async () => {
    const response = await api.get('/sessionrequests/upcoming');
    return response.data;
  },

  getBookedSlots: async (mentorId: string, date: string): Promise<TimeSlot[]> => {
    const response = await api.get('/sessions/booked-slots', {
      params: { mentorId, date }
    });
    return response.data;
  },

  getSessions: async () => {
    const response = await api.get('/sessions');
    return response.data;
  }
};

export default sessionService; 