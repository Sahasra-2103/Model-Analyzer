import axios from 'axios';

const configuredApiUrl = import.meta.env.VITE_API_URL;
const localApiPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/api\/?$/i;
const baseURL = import.meta.env.PROD && (!configuredApiUrl || localApiPattern.test(configuredApiUrl))
  ? '/api'
  : configuredApiUrl || 'http://localhost:5000/api';

const api = axios.create({
  baseURL,
  timeout: 120000,
});

export const uploadFiles = async (files) => {
  const formData = new FormData();
  for (let i = 0; i < files.length; i++) {
    formData.append('files', files[i]);
  }
  
  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const analyzeDocument = async (documentId) => {
  const response = await api.post('/analyze', { documentId });
  return response.data;
};

export const getHistory = async () => {
  const response = await api.get('/history');
  return response.data;
};

export const getAnalytics = async () => {
  const response = await api.get('/analytics');
  return response.data;
};

export const chatWithDocument = async (documentId, message) => {
  const response = await api.post('/chat', { documentId, message });
  return response.data;
};

export default api;
