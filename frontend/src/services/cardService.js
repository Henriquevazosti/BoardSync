import apiService from './apiService.js';

const mergeDataEnvelope = (response) => {
  if (response?.data && typeof response.data === 'object') {
    return { ...response, ...response.data };
  }

  return response;
};

const cardService = {
  async list(listId) {
    return mergeDataEnvelope(await apiService.get(`/cards/list/${listId}`));
  },

  async create(listId, cardData) {
    return mergeDataEnvelope(await apiService.post(`/cards/list/${listId}`, cardData));
  },

  async update(cardId, cardData) {
    return mergeDataEnvelope(await apiService.put(`/cards/${cardId}`, cardData));
  },

  async block(cardId, blockReason) {
    return this.update(cardId, { is_blocked: true, block_reason: blockReason });
  },

  async unblock(cardId) {
    return this.update(cardId, { is_blocked: false, block_reason: '' });
  },

  async move(cardId, newListId, newPosition, oldListId) {
    return mergeDataEnvelope(await apiService.post(`/cards/${cardId}/move`, {
      new_list_id: newListId,
      new_position: newPosition,
      old_list_id: oldListId
    }));
  }
};

export default cardService;
