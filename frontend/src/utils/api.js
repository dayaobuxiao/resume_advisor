import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const login = async (username, password) => {
  const response = await api.post('/login/', { username, password });
  return response.data;
};

export const register = async (username, email, password) => {
  const response = await api.post('/register/', { username, email, password });
  return response.data;
};

export const createResume = async (resumeData) => {
  const response = await api.post('/resumes/', resumeData);
  return response.data;
};

export const getSubscription = async () => {
  const response = await api.get('/subscription/');
  return response.data;
};

export const updateSubscription = async (plan) => {
  const response = await api.patch('/subscription/', { plan });
  return response.data;
};

export const analyzeResume = async (resumeId) => {
  const response = await api.post(`/resumes/${resumeId}/analyze/`);
  return response.data;
};

export const getAnalysis = async (resumeId) => {
  const response = await api.get(`/resumes/${resumeId}/analysis/`);
  return response.data;
};