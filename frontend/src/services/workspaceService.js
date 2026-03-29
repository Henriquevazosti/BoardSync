import apiService from './apiService.js';

const mergeDataEnvelope = (response) => {
  if (response?.data && typeof response.data === 'object') {
    return { ...response, ...response.data };
  }

  return response;
};

// Serviço de workspaces
export const workspaceService = {
  // Listar workspaces do usuário
  async getWorkspaces() {
    return mergeDataEnvelope(await apiService.get('/workspaces'));
  },

  // Obter workspace por ID
  async getWorkspace(id) {
    return mergeDataEnvelope(await apiService.get(`/workspaces/${id}`));
  },

  // Criar novo workspace
  async createWorkspace(workspaceData) {
    return mergeDataEnvelope(await apiService.post('/workspaces', workspaceData));
  },

  // Atualizar workspace
  async updateWorkspace(id, workspaceData) {
    return mergeDataEnvelope(await apiService.put(`/workspaces/${id}`, workspaceData));
  },

  // Deletar workspace
  async deleteWorkspace(id) {
    return await apiService.delete(`/workspaces/${id}`);
  },

  // Adicionar membro ao workspace
  async addMember(workspaceId, userData) {
    return mergeDataEnvelope(await apiService.post(`/workspaces/${workspaceId}/members`, userData));
  },

  // Remover membro do workspace
  async removeMember(workspaceId, userId) {
    return await apiService.delete(`/workspaces/${workspaceId}/members/${userId}`);
  }
};
