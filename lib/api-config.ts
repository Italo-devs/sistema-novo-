// Backend API Configuration
export const API_BASE_URL = typeof window !== 'undefined' 
  ? window.location.origin + '/api'
  : 'http://localhost:8001/api';

export const API_ENDPOINTS = {
  checkAdminExists: `${API_BASE_URL}/auth/check-admin-exists`,
  register: `${API_BASE_URL}/auth/register`,
  login: `${API_BASE_URL}/auth/login`,
  verifyEmail: `${API_BASE_URL}/auth/verify-email`,
  forgotPassword: `${API_BASE_URL}/auth/forgot-password`,
  resetPassword: `${API_BASE_URL}/auth/reset-password`,
};
