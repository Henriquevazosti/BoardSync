import apiService from './apiService.js';

const mergeDataEnvelope = (response) => {
  if (response?.data && typeof response.data === 'object') {
    return { ...response, ...response.data };
  }

  return response;
};

const commentService = {
  async list(cardId) {
    return mergeDataEnvelope(await apiService.get(`/comments/card/${cardId}`));
  },
  async add(cardId, content) {
    return mergeDataEnvelope(await apiService.post(`/comments/card/${cardId}`, { content }));
  },
  async remove(commentId) {
    return apiService.delete(`/comments/${commentId}`);
  },
  async edit(commentId, content) {
    return mergeDataEnvelope(await apiService.put(`/comments/${commentId}`, { content }));
  }
};

export default commentService;
