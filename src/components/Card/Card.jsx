import React from 'react';
import './Card.css';

const Card = ({ title, description, priority }) => {
  return (
    <div className={`card priority-${priority}`}>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
};

export default Card;
