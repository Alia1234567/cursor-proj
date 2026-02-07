import axios from 'axios';

// Base URL for API requests
// In development, Vite proxy handles this
// In production, use full backend URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Calendar Statistics Type
 * Matches the response from /api/calendar/stats
 */
export interface CalendarStats {
  totalEvents: number;
  averageDuration: number; // in milliseconds
  averageDurationFormatted: string;
  soloMeetings: number;
  guestMeetings: number;
  busiestDay: {
    day: string;
    count: number;
  };
  totalDuration: number; // in milliseconds
  totalDurationFormatted: string;
}

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important: Send cookies with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (optional - for adding auth headers if needed)
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401) {
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  /**
   * Initiate Google OAuth login
   * Redirects to backend /auth/google endpoint
   */
  login: () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  },

  /**
   * Logout user
   */
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  /**
   * Get current user info
   */
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export const calendarAPI = {
  /**
   * Get calendar statistics for a date range
   * @param startDate - ISO date string
   * @param endDate - ISO date string
   */
  getStats: async (startDate: string, endDate: string) => {
    const response = await api.get('/api/calendar/stats', {
      params: {
        startDate,
        endDate,
      },
    });
    return response.data;
  },
};

export default api;

