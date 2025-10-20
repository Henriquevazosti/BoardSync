import React, { useState, useRef, useEffect } from 'react';
import { categoryConfig, isSubtask, getParentCard, getMainCategories, getSubtaskCategories } from '../../data/initialData';
import LabelSelector from '../LabelSelector/LabelSelector';
import UserSelector from '../UserSelector/UserSelector';
import DatePicker from '../DatePicker/DatePicker';
import './EditableCard.css';

const EditableCard = ({ card, columnId, allCards, allLabels, allUsers, onSave, onCancel, onManageLabels }) => {
  const [editedCard, setEditedCard] = useState({
    title: card.title,
    description: card.description || '',
    priority: card.priority,
    category: card.category,
    parentId: card.parentId || '',
    labels: card.labels || [],
    assignedUsers: card.assignedUsers || [],
    dueDate: card.dueDate || null
  });

  const titleRef = useRef(null);
  const mainCategories = getMainCategories();
  const subtaskCategories = getSubtaskCategories();
  const isCurrentSubtask = isSubtask(editedCard.category);
  const mainCards = Object.values(allCards).filter(c => !isSubtask(c.category) && c.id !== card.id);

  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.focus();
      titleRef.current.select();
    }
  }, []);

  const handleSave = () => {
    if (editedCard.title.trim()) {
      const updatedCard = {
        ...card,
        title: editedCard.title.trim(),
        description: editedCard.description.trim(),
        priority: editedCard.priority,
        category: editedCard.category,
        parentId: isCurrentSubtask ? editedCard.parentId : undefined,
        labels: editedCard.labels,
        assignedUsers: editedCard.assignedUsers,
        dueDate: editedCard.dueDate
      };
      onSave(updatedCard);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  const getCategoryInfo = (category) => {
    return categoryConfig[category] || categoryConfig.atividade;
  };

  const parentCard = isCurrentSubtask && editedCard.parentId ? allCards[editedCard.parentId] : null;

  return (
    <div className="editable-card">
      {/* Header com categoria atual */}
      <div className="edit-header">
        <div className="category-preview" style={{ 
          backgroundColor: getCategoryInfo(editedCard.category).bgColor,
          color: getCategoryInfo(editedCard.category).color 
        }}>
          <span className="category-icon">{getCategoryInfo(editedCard.category).icon}</span>
          <span className="category-name">{getCategoryInfo(editedCard.category).name}</span>
        </div>
      </div>

      {/* Indicador de subtarefa se aplicável */}
      {isCurrentSubtask && parentCard && (
        <div className="subtask-indicator-edit">
          <span className="subtask-arrow">↳</span>
          <span className="parent-title">
            {getCategoryInfo(parentCard.category).icon} {parentCard.title}
          </span>
        </div>
      )}

      <div className="edit-form">
        {/* Seleção de categoria */}
        <div className="form-group">
          <label>Tipo</label>
          <div className="category-sections">
            <div className="category-section">
              <span className="section-title">Principais</span>
              <div className="category-options">
                {mainCategories.map(key => (
                  <button
                    key={key}
                    type="button"
                    className={`category-option ${editedCard.category === key ? 'active' : ''}`}
                    onClick={() => setEditedCard(prev => ({ 
                      ...prev, 
                      category: key,
                      parentId: '' // Limpa parentId se mudar para categoria principal
                    }))}
                  >
                    {categoryConfig[key].icon} {categoryConfig[key].name}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="category-section">
              <span className="section-title">Subtarefas</span>
              <div className="category-options">
                {subtaskCategories.map(key => (
                  <button
                    key={key}
                    type="button"
                    className={`category-option ${editedCard.category === key ? 'active' : ''}`}
                    onClick={() => setEditedCard(prev => ({ ...prev, category: key }))}
                  >
                    {categoryConfig[key].icon} {categoryConfig[key].name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Seleção de card pai para subtarefas */}
        {isCurrentSubtask && (
          <div className="form-group">
            <label>Card Pai</label>
            <select
              value={editedCard.parentId}
              onChange={(e) => setEditedCard(prev => ({ ...prev, parentId: e.target.value }))}
              required
            >
              <option value="">Selecione um card pai</option>
              {mainCards.map(mainCard => (
                <option key={mainCard.id} value={mainCard.id}>
                  {getCategoryInfo(mainCard.category).icon} {mainCard.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Título */}
        <div className="form-group">
          <label>Título</label>
          <input
            ref={titleRef}
            type="text"
            value={editedCard.title}
            onChange={(e) => setEditedCard(prev => ({ ...prev, title: e.target.value }))}
            onKeyDown={handleKeyDown}
            placeholder="Digite o título do card..."
            className="edit-title"
          />
        </div>

        {/* Descrição */}
        <div className="form-group">
          <label>Descrição</label>
          <textarea
            value={editedCard.description}
            onChange={(e) => setEditedCard(prev => ({ ...prev, description: e.target.value }))}
            onKeyDown={handleKeyDown}
            placeholder="Descreva os detalhes do card..."
            className="edit-description"
            rows="3"
          />
        </div>

        {/* Prioridade */}
        <div className="form-group">
          <label>Prioridade</label>
          <div className="priority-options">
            {['baixa', 'media', 'alta'].map(priority => (
              <button
                key={priority}
                type="button"
                className={`priority-option ${editedCard.priority === priority ? 'active' : ''} priority-${priority}`}
                onClick={() => setEditedCard(prev => ({ ...prev, priority }))}
              >
                {priority === 'baixa' && '🟢 Baixa'}
                {priority === 'media' && '🟡 Média'}
                {priority === 'alta' && '🔴 Alta'}
              </button>
            ))}
          </div>
        </div>

        {/* Labels */}
        <div className="form-group">
          <LabelSelector
            availableLabels={allLabels || {}}
            selectedLabels={editedCard.labels}
            onLabelsChange={(labels) => setEditedCard(prev => ({ ...prev, labels }))}
            onManageLabels={onManageLabels}
          />
        </div>

        {/* Usuários */}
        <div className="form-group">
          <label>Usuários Atribuídos</label>
          <UserSelector
            allUsers={allUsers || {}}
            selectedUserIds={editedCard.assignedUsers}
            onUsersChange={(userIds) => setEditedCard(prev => ({ ...prev, assignedUsers: userIds }))}
            placeholder="Atribuir usuários..."
            isEditing={true}
          />
        </div>

        {/* Data de Vencimento */}
        <div className="form-group">
          <DatePicker
            value={editedCard.dueDate}
            onChange={(date) => setEditedCard(prev => ({ ...prev, dueDate: date }))}
            label="Data de Vencimento"
            placeholder="Selecionar data de vencimento..."
            clearable={true}
          />
        </div>

        {/* Botões de ação */}
        <div className="edit-actions">
          <button type="button" onClick={onCancel} className="btn-cancel">
            Cancelar
          </button>
          <button 
            type="button" 
            onClick={handleSave} 
            className="btn-save"
            disabled={!editedCard.title.trim() || (isCurrentSubtask && !editedCard.parentId)}
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditableCard;
