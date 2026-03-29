import { API_BASE_URL } from '../config/api.js';

// Classe para gerenciar requests HTTP
class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Método para fazer requests
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Adicionar token de autenticação se existir
    const token = localStorage.getItem('boardsync_token') || localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const details = Array.isArray(errorData.details)
          ? errorData.details.map(detail => `${detail.field}: ${detail.message}`).join(', ')
          : '';
        const message = details
          ? `${errorData.error || 'Erro na API'}: ${details}`
          : (errorData.error || `HTTP error! status: ${response.status}`);
        throw new Error(message);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // Métodos GET
  async get(endpoint) {
    return this.request(endpoint);
  }

  // Métodos POST
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Métodos PUT
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Métodos DELETE
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }
}

// Instância singleton do serviço
const apiService = new ApiService();

export default apiService;
