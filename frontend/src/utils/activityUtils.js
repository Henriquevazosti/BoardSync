// Tipos de atividades para o sistema de log
export const activityTypes = {
  CARD_CREATED: 'card_created',
  CARD_UPDATED: 'card_updated',
  CARD_MOVED: 'card_moved',
  CARD_BLOCKED: 'card_blocked',
  CARD_UNBLOCKED: 'card_unblocked',
  CARD_DELETED: 'card_deleted',
  COMMENT_ADDED: 'comment_added',
  COMMENT_EDITED: 'comment_edited',
  COMMENT_DELETED: 'comment_deleted',
  LABEL_ASSIGNED: 'label_assigned',
  LABEL_REMOVED: 'label_removed',
  USER_ASSIGNED: 'user_assigned',
  USER_REMOVED: 'user_removed',
  DUE_DATE_SET: 'due_date_set',
  DUE_DATE_REMOVED: 'due_date_removed',
  PRIORITY_CHANGED: 'priority_changed',
  CATEGORY_CHANGED: 'category_changed',
  DESCRIPTION_UPDATED: 'description_updated',
  TITLE_UPDATED: 'title_updated'
};

// Função para criar uma nova atividade
export const createActivity = (cardId, userId, type, description, oldValue = null, newValue = null, metadata = null) => {
  const activityId = `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    id: activityId,
    cardId,
    userId,
    type,
    description,
    oldValue,
    newValue,
    metadata,
    timestamp: new Date().toISOString()
  };
};

// Função para obter a descrição amigável de um tipo de atividade
export const getActivityTypeDescription = (type) => {
  const descriptions = {
    [activityTypes.CARD_CREATED]: 'Card criado',
    [activityTypes.CARD_UPDATED]: 'Card atualizado',
    [activityTypes.CARD_MOVED]: 'Card movido',
    [activityTypes.CARD_BLOCKED]: 'Card bloqueado',
    [activityTypes.CARD_UNBLOCKED]: 'Card desbloqueado',
    [activityTypes.CARD_DELETED]: 'Card excluído',
    [activityTypes.COMMENT_ADDED]: 'Comentário adicionado',
    [activityTypes.COMMENT_EDITED]: 'Comentário editado',
    [activityTypes.COMMENT_DELETED]: 'Comentário removido',
    [activityTypes.LABEL_ASSIGNED]: 'Label atribuída',
    [activityTypes.LABEL_REMOVED]: 'Label removida',
    [activityTypes.USER_ASSIGNED]: 'Usuário atribuído',
    [activityTypes.USER_REMOVED]: 'Usuário removido',
    [activityTypes.DUE_DATE_SET]: 'Data de vencimento definida',
    [activityTypes.DUE_DATE_REMOVED]: 'Data de vencimento removida',
    [activityTypes.PRIORITY_CHANGED]: 'Prioridade alterada',
    [activityTypes.CATEGORY_CHANGED]: 'Categoria alterada',
    [activityTypes.DESCRIPTION_UPDATED]: 'Descrição atualizada',
    [activityTypes.TITLE_UPDATED]: 'Título atualizado'
  };
  
  return descriptions[type] || type;
};

// Função para obter ícone de uma atividade
export const getActivityIcon = (type) => {
  const icons = {
    [activityTypes.CARD_CREATED]: '📝',
    [activityTypes.CARD_UPDATED]: '✏️',
    [activityTypes.CARD_MOVED]: '🔄',
    [activityTypes.CARD_BLOCKED]: '🚫',
    [activityTypes.CARD_UNBLOCKED]: '✅',
    [activityTypes.CARD_DELETED]: '🗑️',
    [activityTypes.COMMENT_ADDED]: '💬',
    [activityTypes.COMMENT_EDITED]: '📝',
    [activityTypes.COMMENT_DELETED]: '🗑️',
    [activityTypes.LABEL_ASSIGNED]: '🏷️',
    [activityTypes.LABEL_REMOVED]: '🏷️',
    [activityTypes.USER_ASSIGNED]: '👤',
    [activityTypes.USER_REMOVED]: '👤',
    [activityTypes.DUE_DATE_SET]: '📅',
    [activityTypes.DUE_DATE_REMOVED]: '📅',
    [activityTypes.PRIORITY_CHANGED]: '⚡',
    [activityTypes.CATEGORY_CHANGED]: '📂',
    [activityTypes.DESCRIPTION_UPDATED]: '📄',
    [activityTypes.TITLE_UPDATED]: '📝'
  };
  
  return icons[type] || '📋';
};
