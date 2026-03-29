import apiService from './apiService.js';

const mergeDataEnvelope = (response) => {
  if (response?.data && typeof response.data === 'object') {
    return { ...response, ...response.data };
  }

  return response;
};

// Serviço de boards
export const boardService = {
  // Listar boards de um workspace
  async getBoards(workspaceId) {
    return mergeDataEnvelope(await apiService.get(`/boards/workspace/${workspaceId}`));
  },

  // Obter board por ID
  async getBoard(id) {
    return mergeDataEnvelope(await apiService.get(`/boards/${id}`));
  },

  // Criar novo board
  async createBoard(workspaceId, boardData) {
    return mergeDataEnvelope(await apiService.post(`/boards/workspace/${workspaceId}`, boardData));
  },

  // Atualizar board
  async updateBoard(id, boardData) {
    return mergeDataEnvelope(await apiService.put(`/boards/${id}`, boardData));
  },

  // Deletar board
  async deleteBoard(id) {
    return await apiService.delete(`/boards/${id}`);
  },

  // Obter dados completos do board (com listas e cards)
  async getBoardData(id) {
    return await apiService.get(`/boards/${id}/complete`);
  }
};
