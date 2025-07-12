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

  // Função para renderizar descrição do card com suporte a imagens
  const renderCardDescription = (description) => {
    if (!description) return null;

    // Verificar se há imagens na descrição
    const hasImages = description.includes('![') && description.includes('data:image');
    
    if (!hasImages) {
      // Apenas texto - mostrar truncado
      const truncatedText = description.length > 100 
        ? description.substring(0, 100) + '...' 
        : description;
      return <span className="description-text">{truncatedText}</span>;
    }

    // Tem imagens - mostrar preview compacto
    const imageRegex = /!\[([^\]]*)\]\((data:image[^)]+)\)/g;
    const imageMatches = [...description.matchAll(imageRegex)];
    
    if (imageMatches.length > 0) {
      // Pegar a primeira imagem
      const firstImage = imageMatches[0];
      const [, alt, src] = firstImage;
      
      // Pegar texto sem imagens para mostrar
      let textOnly = description.replace(imageRegex, '').trim();
      const truncatedText = textOnly.length > 60 
        ? textOnly.substring(0, 60) + '...' 
        : textOnly;

      return (
        <div className="card-description-with-media">
          {truncatedText && (
            <div className="description-text">{truncatedText}</div>
          )}
          <div className="description-image-preview">
            <img 
              src={src} 
              alt={alt || 'Imagem'} 
              className="card-image-thumbnail"
            />
            {imageMatches.length > 1 && (
              <div className="more-images-indicator">
                +{imageMatches.length - 1} imagem{imageMatches.length > 2 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
      );
    }

    return <span className="description-text">{description}</span>;
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
    console.log('🚀 Card.handleDragStart: Iniciando arraste do card:', card.title);
    console.log('📍 Card.handleDragStart: Card ID:', card.id, 'Column ID:', columnId);
    
    // Validações básicas
    if (!card.id || !columnId) {
      console.error('❌ Card.handleDragStart: Dados inválidos', { cardId: card.id, columnId });
      e.preventDefault();
      return;
    }

    if (card.isBlocked) {
      console.warn('🚫 Card.handleDragStart: Card bloqueado, drag cancelado');
      e.preventDefault();
      return;
    }
    
    try {
      // Armazenar dados do card sendo arrastado
      e.dataTransfer.setData('text/plain', card.id); // Fallback para compatibilidade
      e.dataTransfer.setData('cardId', card.id);
      e.dataTransfer.setData('sourceColumn', columnId);
      e.dataTransfer.effectAllowed = 'move';
      
      // Verificar se os dados foram definidos corretamente
      console.log('📦 Card.handleDragStart: Dados definidos:', {
        cardId: card.id,
        sourceColumn: columnId,
        effectAllowed: e.dataTransfer.effectAllowed
      });
      
      // Feedback visual diferente para cards com subtarefas
      e.target.style.opacity = '0.5';
      e.target.style.transform = hasSubtasks ? 'rotate(2deg) scale(1.02)' : 'rotate(2deg)';
      e.target.style.cursor = 'grabbing';
      
      // Log informativo sobre relações
      if (isCardSubtask && parentCard) {
        console.log(`📦 Card.handleDragStart: Movendo subtarefa (pai: "${parentCard.title}")`);
      } else if (hasSubtasks) {
        console.log(`📦 Card.handleDragStart: Movendo card principal com ${subtasks.length} subtarefas`);
      } else {
        console.log(`📦 Card.handleDragStart: Movendo card individual`);
      }
    } catch (error) {
      console.error('❌ Card.handleDragStart: Erro ao configurar drag', error);
      e.preventDefault();
    }
  };

  const handleDragEnd = (e) => {
    console.log('✅ Card.handleDragEnd: Finalizando arraste do card:', card.title);
    
    // Remover feedback visual
    e.target.style.opacity = '1';
    e.target.style.transform = 'none';
    e.target.style.cursor = 'grab';
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
      data-card-id={card.id}
      data-column-id={columnId}
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
        <div className="card-description">
          {renderCardDescription(card.description)}
        </div>
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
