// Serviço para comunicação com a API do BoardSync
const API_BASE_URL = 'http://localhost:3001/api/v1';

// Função para fazer requisições autenticadas
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('boardsync_token') || localStorage.getItem('authToken');
  
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

// Função principal para sincronizar usuários com a API
export const syncUsersWithAPI = async () => {
  console.log('➡️ Buscando usuários na API...');
  try {
    const token = localStorage.getItem('boardsync_token') || localStorage.getItem('authToken');
    if (!token) {
      console.log('❌ Token não encontrado');
      return [];
    }

    console.log('🔑 Token encontrado, fazendo requisição...');
    const response = await fetch('http://localhost:3001/api/v1/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('📡 Resposta da API recebida:', response.status);
    
    if (!response.ok) {
      console.log('❌ Resposta não OK:', response.status);
      return [];
    }

    const data = await response.json();
    console.log('📦 Dados brutos da API:', data);
    
    // Ajuste conforme o retorno da sua API
    const users = data.data || [];
    console.log('👥 Array de usuários extraído:', users);

    // Converta para o formato do board
    const convertedUsers = users.map(user => {
      const converted = {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || '👤',
        color: user.color || '#0052cc',
        bgColor: user.bg_color || '#e6f3ff',
        role: user.role || 'member'
      };
      console.log('🔄 Usuário convertido:', converted);
      return converted;
    });
    
    console.log('✅ Todos os usuários convertidos:', convertedUsers);
    return convertedUsers;
  } catch (err) {
    console.error('❌ Erro ao sincronizar usuários:', err);
    return [];
  }
};

// Função para buscar todos os usuários da API (alias para compatibilidade)
export async function fetchUsers() {
  return await syncUsersWithAPI();
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

export default {
  fetchUsers,
  fetchUserById,
  syncUsersWithAPI,
  apiRequest
};
