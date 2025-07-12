// Serviço para comunicação com a API do BoardSync
const API_BASE_URL = 'http://localhost:3001/api/v1';

// Função para fazer requisições autenticadas
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('authToken');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
}

// Função para buscar todos os usuários da API
export async function fetchUsers() {
  try {
    console.log('🔍 Buscando usuários da API...');
    const response = await apiRequest('/users');
    console.log('✅ Usuários encontrados:', response);
    
    // A API retorna { success: true, data: [...], count: X }
    if (response && response.success && response.data) {
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error('❌ Erro ao buscar usuários:', error);
    return [];
  }
}

// Função para buscar usuário por ID
export async function fetchUserById(userId) {
  try {
    const response = await apiRequest(`/users/${userId}`);
    return response;
  } catch (error) {
    console.error('❌ Erro ao buscar usuário:', error);
    return null;
  }
}

// Correção para src/services/userService.js
export const syncUsersWithAPI = async () => {
  console.log('➡️ Buscando usuários na API...');
  try {
    const token = localStorage.getItem('authToken');
    if (!token) return [];

    const response = await fetch('http://localhost:3001/api/v1/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) return [];

    const data = await response.json();
    // Ajuste conforme o retorno da sua API
    const users = data.data || [];

    // Converta para o formato do board
    return users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatar || null,
      avatarColor: user.color || '#888',
      role: user.role || 'member'
    }));
  } catch (err) {
    console.error('Erro ao sincronizar usuários:', err);
    return [];
  }
};

// Função auxiliar para converter usuários da API para o formato do board
const convertApiUserToBoardUser = (apiUser) => {
  // Cores para avatares
  const avatarColors = ['#FF5733', '#33FF57', '#3357FF', '#F033FF', '#FF33A8', '#33FFF6'];
  const randomColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];

  return {
    id: apiUser.id.toString(),
    name: apiUser.name,
    email: apiUser.email,
    avatarUrl: apiUser.avatarUrl || null,
    avatarColor: apiUser.avatarColor || randomColor,
    role: apiUser.role || 'member'
  };
};

export default {
  fetchUsers,
  fetchUserById,
  convertApiUserToBoardUser,
  syncUsersWithAPI,
  apiRequest
};
