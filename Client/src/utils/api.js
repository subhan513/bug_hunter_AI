import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const analyzeCode = async (code, language) => {
  try {
    const response = await api.post('/analyze', { code, language });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to connect to the server');
  }
};

// Interview APIs
export const fetchAvailableTopics = async () => {
  try {
    const response = await api.get('/interview/available-topics');
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to connect to the server');
  }
};

export const generateInterviewQuestion = async (config) => {
  try {
    const response = await api.post('/interview/generate-question', config);
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to connect to the server');
  }
};

export const generateByDifficulty = async (difficulty) => {
  try {
    const response = await api.post('/interview/generate-by-difficulty', { difficulty });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to connect to the server');
  }
};

export const generateByCompany = async (company) => {
  try {
    const response = await api.post('/interview/generate-by-company', { company });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to connect to the server');
  }
};

// Stats APIs
export const getInitialProgress = async (userId) => {
  try {
    const response = await api.get(`/stats/init/${userId}`);
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to connect to the server');
  }
};

export const updateProgress = async (data) => {
  try {
    const response = await api.post('/stats/update', data);
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to connect to the server');
  }
};

export default api;
