import apiService from './apiService.js';

// Serviço de workspaces
export const workspaceService = {
  // Listar workspaces do usuário
  async getWorkspaces() {
    return await apiService.get('/workspaces');
  },

  // Obter workspace por ID
  async getWorkspace(id) {
    return await apiService.get(`/workspaces/${id}`);
  },

  // Criar novo workspace
  async createWorkspace(workspaceData) {
    return await apiService.post('/workspaces', workspaceData);
  },

  // Atualizar workspace
  async updateWorkspace(id, workspaceData) {
    return await apiService.put(`/workspaces/${id}`, workspaceData);
  },

  // Deletar workspace
  async deleteWorkspace(id) {
    return await apiService.delete(`/workspaces/${id}`);
  },

  // Adicionar membro ao workspace
  async addMember(workspaceId, userData) {
    return await apiService.post(`/workspaces/${workspaceId}/members`, userData);
  },

  // Remover membro do workspace
  async removeMember(workspaceId, userId) {
    return await apiService.delete(`/workspaces/${workspaceId}/members/${userId}`);
  }
};
