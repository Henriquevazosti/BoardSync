import React, { useState } from 'react';
import { categoryConfig, getMainCategories, getSubtaskCategories, isSubtask } from '../../data/initialData';
import './NewCardModal.css';

const NewCardModal = ({ onClose, onCreateCard, allCards }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('media');
  const [category, setCategory] = useState('historia');
  const [parentId, setParentId] = useState('');

  const mainCategories = getMainCategories();
  const subtaskCategories = getSubtaskCategories();
  const isCurrentSubtask = isSubtask(category);
  
  // Obter cards principais disponíveis
  const mainCards = allCards ? Object.values(allCards).filter(card => !isSubtask(card.category)) : [];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim()) {
      const cardData = {
        title: title.trim(),
        description: description.trim(),
        priority,
        category
      };
      
      // Adicionar parentId se for subtarefa
      if (isCurrentSubtask && parentId) {
        cardData.parentId = parentId;
      }
      
      onCreateCard(cardData);
      setTitle('');
      setDescription('');
      setPriority('media');
      setCategory('historia');
      setParentId('');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Novo Card</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="category">Tipo</label>
            <select
              id="category"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                // Limpar parentId se mudou para categoria principal
                if (!isSubtask(e.target.value)) {
                  setParentId('');
                }
              }}
            >
              <optgroup label="Tarefas Principais">
                {mainCategories.map((key) => (
                  <option key={key} value={key}>
                    {categoryConfig[key].icon} {categoryConfig[key].name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Subtarefas">
                {subtaskCategories.map((key) => (
                  <option key={key} value={key}>
                    {categoryConfig[key].icon} {categoryConfig[key].name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {isCurrentSubtask && (
            <div className="form-group">
              <label htmlFor="parentId">Tarefa Principal</label>
              <select
                id="parentId"
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                required
              >
                <option value="">Selecione uma tarefa principal...</option>
                {mainCards.map((card) => (
                  <option key={card.id} value={card.id}>
                    {categoryConfig[card.category].icon} {card.title}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="title">Título</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
              placeholder="Digite o título do card..."
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Descrição</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
              placeholder="Descreva os detalhes do card..."
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="priority">Prioridade</label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="baixa">🟢 Baixa</option>
              <option value="media">🟡 Média</option>
              <option value="alta">🔴 Alta</option>
            </select>
          </div>
          
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancelar
            </button>
            <button type="submit" className="btn-save">
              Criar Card
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewCardModal;
