// client/src/services/api.ts
import axios from 'axios';
import { auth } from '../firebase/config';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from 'firebase/auth';

// Assuming you have an API_URL defined at the top of your file
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add authentication interceptor
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Event API functions
export const eventApi = {
  getUpcomingEvents: async () => {
    const response = await api.get('/events/upcoming');
    return response.data;
  },
  
  getRecommendedEvents: async () => {
    const response = await api.get('/events/recommended');
    return response.data;
  },
  
  getEventById: async (id: string) => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },
  
  saveEvent: async (id: string) => {
    await api.post(`/events/${id}/save`);
  },
  
  followOrganizer: async (organizerId: string) => {
    await api.post(`/events/organizer/${organizerId}/follow`);
  }
};

// Auth functions that use Firebase directly
export const authApi = {
  login: async (email: string, password: string) => {
    return await signInWithEmailAndPassword(auth, email, password);
  },
  
  signup: async (email: string, password: string) => {
    return await createUserWithEmailAndPassword(auth, email, password);
  },
  
  logout: async () => {
    return await signOut(auth);
  },
  
  getCurrentUser: () => {
    return auth.currentUser;
  },
  
  async resetPasswordRequest(email: string): Promise<void> {
    try {
      // For development purposes, simulate a successful API call if backend is not ready
      if (process.env.NODE_ENV === 'development' && !process.env.REACT_APP_USE_REAL_API) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('Development mode: Password reset email would be sent to:', email);
        return;
      }
      
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
        // Add these options to help with CORS issues
        credentials: 'include',
        mode: 'cors',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to send reset password email');
      }
    } catch (error: any) {
      // Check if it's a network error
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        throw new Error('Server is not responding. Please check your connection or try again later.');
      }
      console.error('Password reset request error:', error);
      throw error;
    }
  },
  
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      // For development purposes
      if (process.env.NODE_ENV === 'development' && !process.env.REACT_APP_USE_REAL_API) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('Development mode: Password would be reset with token:', token);
        return;
      }
      
      const response = await fetch(`${API_URL}/auth/reset-password/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
        credentials: 'include',
        mode: 'cors',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to reset password');
      }
    } catch (error: any) {
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        throw new Error('Server is not responding. Please check your connection or try again later.');
      }
      console.error('Password reset error:', error);
      throw error;
    }
  }
};