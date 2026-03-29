import apiService from './apiService.js';

const cardService = {
  async block(cardId, blockReason) {
    return apiService.put(`/cards/${cardId}`, { is_blocked: true, block_reason: blockReason });
  },
  async unblock(cardId) {
    return apiService.put(`/cards/${cardId}`, { is_blocked: false, block_reason: '' });
  }
};

export default cardService;
