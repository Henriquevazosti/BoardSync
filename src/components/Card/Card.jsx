import React from 'react';
import './Card.css';

const Card = ({ card, columnId }) => {
  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'alta': return 'priority-high';
      case 'media': return 'priority-medium';
      case 'baixa': return 'priority-low';
      default: return '';
    }
  };

  const handleDragStart = (e) => {
    console.log('🚀 Iniciando arraste do card:', card.title);
    
    // Armazenar dados do card sendo arrastado
    e.dataTransfer.setData('cardId', card.id);
    e.dataTransfer.setData('sourceColumn', columnId);
    e.dataTransfer.effectAllowed = 'move';
    
    // Adicionar feedback visual
    e.target.style.opacity = '0.5';
    e.target.style.transform = 'rotate(5deg)';
  };

  const handleDragEnd = (e) => {
    console.log('✅ Finalizando arraste do card:', card.title);
    
    // Remover feedback visual
    e.target.style.opacity = '1';
    e.target.style.transform = 'none';
  };

  return (
    <div
      className={`card ${getPriorityClass(card.priority)}`}
      draggable="true"
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      title={`Arraste "${card.title}" para mover entre colunas`}
    >
      <div className="drag-handle">⋮⋮</div>
      <h4 className="card-title">{card.title}</h4>
      {card.description && (
        <p className="card-description">{card.description}</p>
      )}
      <div className="card-footer">
        <span className={`priority-badge ${getPriorityClass(card.priority)}`}>
          {card.priority}
        </span>
      </div>
    </div>
  );
};

export default Card;
