import apiService from './apiService.js';

const mergeDataEnvelope = (response) => {
  if (response?.data && typeof response.data === 'object') {
    return { ...response, ...response.data };
  }

  return response;
};

const listService = {
  async list(boardId) {
    return mergeDataEnvelope(await apiService.get(`/lists/board/${boardId}`));
  },

  async create(boardId, listData) {
    return mergeDataEnvelope(await apiService.post(`/lists/board/${boardId}`, listData));
  },

  async update(listId, listData) {
    return mergeDataEnvelope(await apiService.put(`/lists/${listId}`, listData));
  },

  async delete(listId) {
    return apiService.delete(`/lists/${listId}`);
  }
};

export default listService;