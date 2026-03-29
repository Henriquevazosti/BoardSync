import apiService from './apiService.js';

const commentService = {
  async list(cardId) {
    return apiService.get(`/comments/card/${cardId}`);
  },
  async add(cardId, content) {
    return apiService.post(`/comments/card/${cardId}`, { content });
  },
  async remove(commentId) {
    return apiService.delete(`/comments/${commentId}`);
  },
  async edit(commentId, content) {
    return apiService.put(`/comments/${commentId}`, { content });
  }
};

export default commentService;
