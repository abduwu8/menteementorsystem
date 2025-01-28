import axios from 'axios';

// Configure axios with base URL and default headers
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Adjust this URL to match your backend URL
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

const sessionService = {
  getAvailableSessions: async () => {
    const response = await api.get('/sessions/available');
    return response.data;
  },

  getMySessions: async () => {
    const response = await api.get('/sessions/my-sessions');
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

  handleSessionRequest: async (requestId: string, status: 'approved' | 'rejected') => {
    const response = await api.put(`/sessions/requests/${requestId}`, { status });
    return response.data;
  },

  getUpcomingSessions: async () => {
    const response = await api.get('/sessions/upcoming');
    return response.data;
  },

  getBookedSlots: async (mentorId: string, date: string): Promise<TimeSlot[]> => {
    const response = await api.get(`/sessions/booked-slots`, {
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