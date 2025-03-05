// src/api/newsletterApi.js
const API_BASE_URL = 'https://ci-backend-1.onrender.com/api';

export const fetchNewsletters = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/daily_newsletters`);
    if (!response.ok) {
      throw new Error('Failed to fetch newsletters');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching newsletters:', error);
    throw error;
  }
};