import React, { useState } from 'react';
import './NewCardModal.css';

const NewCardModal = ({ isOpen, onClose, onSave, columnId }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim()) {
      onSave({
        title: title.trim(),
        description: description.trim(),
        priority,
        columnId
      });
      setTitle('');
      setDescription('');
      setPriority('medium');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Novo Card</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Título</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Descrição</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
            />
          </div>
          <div className="form-group">
            <label htmlFor="priority">Prioridade</label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancelar
            </button>
            <button type="submit" className="btn-save">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewCardModal;
