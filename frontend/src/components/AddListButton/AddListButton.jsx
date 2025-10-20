import React, { useState, useRef, useEffect } from 'react';
import './AddListButton.css';

const AddListButton = ({ onAddColumn }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleButtonClick = () => {
    setIsEditing(true);
    setInputValue('');
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleConfirm();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleConfirm = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue) {
      onAddColumn(trimmedValue);
    }
    setIsEditing(false);
    setInputValue('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setInputValue('');
  };

  const handleBlur = (e) => {
    // Verificar se o clique foi no botão de confirmar
    if (e.relatedTarget && e.relatedTarget.classList.contains('confirm-btn')) {
      return;
    }
    handleCancel();
  };

  if (isEditing) {
    return (
      <div className="add-list-editing">
        <input
          ref={inputRef}
          type="text"
          className="add-list-input"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          onBlur={handleBlur}
          placeholder="Insira o título da lista..."
          maxLength={50}
        />
        <div className="add-list-actions">
          <button 
            className="confirm-btn"
            onClick={handleConfirm}
            disabled={!inputValue.trim()}
          >
            Adicionar lista
          </button>
          <button 
            className="cancel-btn"
            onClick={handleCancel}
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  return (
    <button className="add-list-button" onClick={handleButtonClick}>
      <span className="add-list-icon">+</span>
      <span className="add-list-text">Adicionar outra lista</span>
    </button>
  );
};

export default AddListButton;
