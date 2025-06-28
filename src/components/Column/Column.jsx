import React from 'react';
import Card from '../Card/Card';
import './Column.css';

const Column = ({ title, cards, onAddCard }) => {
  return (
    <div className="column">
      <div className="column-header">
        <h3>{title}</h3>
      </div>
      <div className="column-content">
        {cards.map(card => (
          <Card 
            key={card.id} 
            title={card.title} 
            description={card.description}
            priority={card.priority}
          />
        ))}
      </div>
      <div className="add-card-area">
        <button className="add-card-button" onClick={onAddCard}>
          + Adicionar um cartão
        </button>
      </div>
    </div>
  );
};

export default Column;
