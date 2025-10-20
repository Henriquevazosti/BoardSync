import apiService from './apiService.js';

// Serviço de boards
export const boardService = {
  // Listar boards de um workspace
  async getBoards(workspaceId) {
    return await apiService.get(`/boards/workspace/${workspaceId}`);
  },

  // Obter board por ID
  async getBoard(id) {
    return await apiService.get(`/boards/${id}`);
  },

  // Criar novo board
  async createBoard(workspaceId, boardData) {
    return await apiService.post(`/boards/workspace/${workspaceId}`, boardData);
  },

  // Atualizar board
  async updateBoard(id, boardData) {
    return await apiService.put(`/boards/${id}`, boardData);
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
