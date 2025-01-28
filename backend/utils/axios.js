import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request logging
instance.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.baseURL + config.url);
    console.log('Request data:', config.data);
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance; 