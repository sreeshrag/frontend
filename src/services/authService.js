import api from './api';

class AuthService {
  // Register company
  async registerCompany(data) {
    const response = await api.post('/auth/register-company', data);
    return response.data;
  }

  // Login
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    const { user, tokens, company, subscription } = response.data;
    
    // Store tokens and user data
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    
    if (company) {
      localStorage.setItem('company', JSON.stringify(company));
    }
    
    if (subscription) {
      localStorage.setItem('subscription', JSON.stringify(subscription));
    }
    
    return response.data;
  }

  // Logout
  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API error:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('company');
      localStorage.removeItem('subscription');
    }
  }

  // Get current user profile
  async getProfile() {
    const response = await api.get('/auth/profile');
    return response.data;
  }

  // Update profile
  async updateProfile(data) {
    const response = await api.put('/auth/profile', data);
    return response.data;
  }

  // Change password
  async changePassword(data) {
    const response = await api.put('/auth/change-password', data);
    return response.data;
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    return !!(token && user);
  }

  // Get current user
  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // Get current company
  getCurrentCompany() {
    const company = localStorage.getItem('company');
    return company ? JSON.parse(company) : null;
  }

  // Get current subscription
  getCurrentSubscription() {
    const subscription = localStorage.getItem('subscription');
    return subscription ? JSON.parse(subscription) : null;
  }
}

export default new AuthService();
