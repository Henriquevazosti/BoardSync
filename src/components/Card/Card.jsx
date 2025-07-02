import React from 'react';
import { 
  categoryConfig, 
  isSubtask, 
  getParentCard, 
  getSubtasks, 
  getCardLabels, 
  getCardAssignedUsers,
  formatDate,
  getDueDateStatus
} from '../../data/initialData';
import './Card.css';

const Card = ({ card, columnId, allCards, allLabels, allUsers, onOpenCardDetail, onBlockCard, onManageLabels, onViewActivityLog, onViewComments }) => {
  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'alta': return 'priority-high';
      case 'media': return 'priority-medium';
      case 'baixa': return 'priority-low';
      default: return '';
    }
  };

  const getCategoryInfo = (category) => {
    return categoryConfig[category] || categoryConfig.atividade;
  };

  const isCardSubtask = isSubtask(card.category);
  const parentCard = isCardSubtask ? getParentCard(card.id, allCards) : null;
  const subtasks = !isCardSubtask ? getSubtasks(card.id, allCards) : [];
  const hasSubtasks = subtasks.length > 0;
  const cardLabels = getCardLabels(card, allLabels || {});
  const assignedUsers = getCardAssignedUsers(card, allUsers || {});
  const dueDateStatus = getDueDateStatus(card.dueDate);

  const getDragTitle = () => {
    if (isCardSubtask && parentCard) {
      return `Arraste "${card.title}" (moverá também "${parentCard.title}" e todas suas subtarefas)`;
    } else if (hasSubtasks) {
      return `Arraste "${card.title}" (moverá junto ${subtasks.length} subtarefa${subtasks.length > 1 ? 's' : ''})`;
    } else {
      return `Arraste "${card.title}" para mover entre colunas`;
    }
  };

  const handleDragStart = (e) => {
    console.log('🚀 Iniciando arraste do card:', card.title);
    
    // Armazenar dados do card sendo arrastado
    e.dataTransfer.setData('cardId', card.id);
    e.dataTransfer.setData('sourceColumn', columnId);
    e.dataTransfer.effectAllowed = 'move';
    
    // Feedback visual diferente para cards com subtarefas
    e.target.style.opacity = '0.5';
    e.target.style.transform = hasSubtasks ? 'rotate(5deg) scale(1.02)' : 'rotate(5deg)';
    
    // Log informativo
    if (isCardSubtask && parentCard) {
      console.log(`📦 Movendo subtarefa que irá mover o card pai "${parentCard.title}" e todas suas subtarefas`);
    } else if (hasSubtasks) {
      console.log(`📦 Movendo card principal com ${subtasks.length} subtarefas`);
    }
  };

  const handleDragEnd = (e) => {
    console.log('✅ Finalizando arraste do card:', card.title);
    
    // Remover feedback visual
    e.target.style.opacity = '1';
    e.target.style.transform = 'none';
  };

  const handleEdit = () => {
    onOpenCardDetail(card);
  };

  const categoryInfo = getCategoryInfo(card.category);

  return (
    <div
      className={`card ${getPriorityClass(card.priority)} ${isCardSubtask ? 'subtask-card' : ''} ${card.isBlocked ? 'blocked-card' : ''}`}
      draggable={!card.isBlocked}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      title={card.isBlocked ? `Card bloqueado: ${card.blockReason}` : getDragTitle()}
    >
      {isCardSubtask && parentCard && (
        <div className="subtask-header">
          <span className="subtask-indicator">↳</span>
          <span className="parent-card-title">
            {getCategoryInfo(parentCard.category).icon} {parentCard.title}
          </span>
        </div>
      )}

      {card.isBlocked && (
        <div className="block-indicator">
          <span className="block-icon">🚫</span>
          <span className="block-text">Bloqueado</span>
          <div className="block-reason-preview">
            {card.blockReason}
          </div>
        </div>
      )}
      
      <div className="card-header">
        <div className="category-badge" style={{ 
          backgroundColor: categoryInfo.bgColor,
          color: categoryInfo.color 
        }}>
          <span className="category-icon">{categoryInfo.icon}</span>
          <span className="category-name">{categoryInfo.name}</span>
        </div>
        <div className="card-actions">
          <button 
            className="edit-button" 
            onClick={handleEdit}
            title="Editar card"
          >
            ✏️
          </button>
          <button 
            className={`block-btn ${card.isBlocked ? 'unblock' : 'block'}`}
            onClick={() => onBlockCard(card)}
            title={card.isBlocked ? 'Gerenciar bloqueio' : 'Bloquear card'}
          >
            {card.isBlocked ? '🔓' : '🚫'}
          </button>
          <button 
            className="activity-btn"
            onClick={() => onViewActivityLog(card.id)}
            title="Ver histórico de atividades"
          >
            📋
          </button>
          <button 
            className="comments-btn"
            onClick={() => {
              console.log('Clicou no botão de comentários, cardId:', card.id);
              console.log('onViewComments function:', onViewComments);
              onViewComments(card.id);
            }}
            title="Ver comentários"
          >
            💬
          </button>
          <div className="drag-handle">⋮⋮</div>
        </div>
      </div>
      
      <h4 className="card-title">{card.title}</h4>
      {card.description && (
        <p className="card-description">{card.description}</p>
      )}

      {card.attachments && card.attachments.length > 0 && (
        <div className="card-attachments">
          <div className="attachments-indicator">
            <span className="attachment-icon">📎</span>
            <span className="attachment-count">{card.attachments.length}</span>
            <span className="attachment-text">
              {card.attachments.length === 1 ? 'anexo' : 'anexos'}
            </span>
          </div>
        </div>
      )}

      {cardLabels.length > 0 && (
        <div className="card-labels">
          {cardLabels.map((label) => (
            <span
              key={label.id}
              className="card-label"
              style={{
                backgroundColor: label.bgColor,
                color: label.color,
                borderColor: label.color
              }}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      {assignedUsers.length > 0 && (
        <div className="card-users">
          <div className="assigned-users">
            {assignedUsers.slice(0, 3).map((user) => (
              <div
                key={user.id}
                className="user-avatar-small"
                style={{
                  backgroundColor: user.bgColor,
                  color: user.color,
                  border: `2px solid ${user.color}`
                }}
                title={`${user.name} (${user.email})`}
              >
                {user.avatar}
              </div>
            ))}
            {assignedUsers.length > 3 && (
              <div className="user-avatar-small user-avatar-count">
                +{assignedUsers.length - 3}
              </div>
            )}
          </div>
        </div>
      )}

      {card.dueDate && (
        <div className="card-due-date">
          <div className={`due-date-badge ${dueDateStatus}`}>
            <span className="due-date-icon">📅</span>
            <span className="due-date-text">{formatDate(card.dueDate)}</span>
          </div>
        </div>
      )}
      
      <div className="card-footer">
        <div className="card-meta">
          <span className={`priority-badge ${getPriorityClass(card.priority)}`}>
            {card.priority}
          </span>
          <span className="card-id">#{card.id}</span>
          {hasSubtasks && (
            <span className="subtasks-count" title={`Este card possui ${subtasks.length} subtarefa(s) que serão movidas junto`}>
              📎 {subtasks.length}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Card;
