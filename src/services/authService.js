import apiService from './apiService.js';

// Serviço de autenticação
export const authService = {
  // Registrar usuário
  async register(userData) {
    const response = await apiService.post('/auth/register', userData);
    if (response.token) {
      localStorage.setItem('boardsync_token', response.token);
      localStorage.setItem('boardsync_user', JSON.stringify(response.user));
    }
    return response;
  },

  // Login do usuário
  async login(email, password) {
    const response = await apiService.post('/auth/login', { email, password });
    if (response.token) {
      localStorage.setItem('boardsync_token', response.token);
      localStorage.setItem('boardsync_user', JSON.stringify(response.user));
    }
    return response;
  },

  // Logout
  logout() {
    localStorage.removeItem('boardsync_token');
    localStorage.removeItem('boardsync_user');
  },

  // Verificar se está logado
  isAuthenticated() {
    return !!localStorage.getItem('boardsync_token');
  },

  // Obter usuário atual
  getCurrentUser() {
    const userStr = localStorage.getItem('boardsync_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Verificar token
  async verifyToken() {
    try {
      const response = await apiService.get('/auth/verify');
      return response;
    } catch (error) {
      this.logout();
      throw error;
    }
  }
};
