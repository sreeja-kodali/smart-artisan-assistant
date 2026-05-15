import axios from 'axios';

const api = axios.create({
  // backend runs on http://localhost:5000
  baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  if (userInfo && userInfo.token) {
    config.headers.Authorization = `Bearer ${userInfo.token}`;
  }
  return config;
});

export default api;
