import React from 'react';
import Card from '../Card/Card';
import './Column.css';

const Column = ({ column, cards, totalCards, onAddCard, onMoveCard }) => {
  const handleDragOver = (e) => {
    e.preventDefault();
    console.log('📍 Arrastando sobre a coluna:', column.title);
    e.dataTransfer.dropEffect = 'move';
    
    // Adicionar classe visual
    e.currentTarget.querySelector('.column-content').classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    console.log('🚪 Saindo da coluna:', column.title);
    
    // Remover classe visual
    e.currentTarget.querySelector('.column-content').classList.remove('drag-over');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    console.log('🎯 Soltando card na coluna:', column.title);
    
    // Obter dados do card
    const cardId = e.dataTransfer.getData('cardId');
    const sourceColumn = e.dataTransfer.getData('sourceColumn');
    
    console.log('📦 Dados recebidos:', { cardId, sourceColumn, targetColumn: column.id });
    
    // Remover classe visual
    e.currentTarget.querySelector('.column-content').classList.remove('drag-over');
    
    // Mover o card se for de colunas diferentes
    if (sourceColumn && cardId && sourceColumn !== column.id) {
      console.log('✨ Movendo card de', sourceColumn, 'para', column.id);
      onMoveCard(cardId, sourceColumn, column.id);
    } else {
      console.log('❌ Movimento cancelado - mesma coluna ou dados inválidos');
    }
  };

  const filteredCount = cards.length;
  const hasFilter = filteredCount !== totalCards;

  return (
    <div 
      className="column"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="column-header">
        <h3 className="column-title">{column.title}</h3>
        <div className="column-counts">
          {hasFilter && (
            <>
              <span className="filtered-count">{filteredCount}</span>
              <span className="count-separator">/</span>
            </>
          )}
          <span className="total-count">{totalCards}</span>
        </div>
      </div>

      <div className="column-content">
        {cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            columnId={column.id}
          />
        ))}
        
        {cards.length === 0 && (
          <div className="empty-column">
            <p>{hasFilter ? 'Nenhum card corresponde ao filtro' : 'Solte cards aqui'}</p>
          </div>
        )}
      </div>

      <button
        className="add-card-button"
        onClick={() => onAddCard(column.id)}
      >
        + Adicionar um cartão
      </button>
    </div>
  );
};

export default Column;
