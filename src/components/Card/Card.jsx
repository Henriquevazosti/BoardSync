import React from 'react';
import { categoryConfig, isSubtask, getParentCard, getSubtasks } from '../../data/initialData';
import './Card.css';

const Card = ({ card, columnId, allCards }) => {
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

  const categoryInfo = getCategoryInfo(card.category);

  return (
    <div
      className={`card ${getPriorityClass(card.priority)} ${isCardSubtask ? 'subtask-card' : ''}`}
      draggable="true"
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      title={getDragTitle()}
    >
      {isCardSubtask && parentCard && (
        <div className="subtask-header">
          <span className="subtask-indicator">↳</span>
          <span className="parent-card-title">
            {getCategoryInfo(parentCard.category).icon} {parentCard.title}
          </span>
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
        <div className="drag-handle">⋮⋮</div>
      </div>
      
      <h4 className="card-title">{card.title}</h4>
      {card.description && (
        <p className="card-description">{card.description}</p>
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
