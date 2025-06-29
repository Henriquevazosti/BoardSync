import React, { useState } from 'react';
import { labelColors, generateLabelId } from '../../data/initialData';
import './LabelManager.css';

const LabelManager = ({ labels, onClose, onCreateLabel, onEditLabel, onDeleteLabel }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingLabel, setEditingLabel] = useState(null);
  const [newLabelName, setNewLabelName] = useState('');
  const [selectedColor, setSelectedColor] = useState(labelColors[0]);

  const handleCreateLabel = (e) => {
    e.preventDefault();
    if (newLabelName.trim()) {
      const newLabel = {
        id: generateLabelId(),
        name: newLabelName.trim(),
        color: selectedColor.color,
        bgColor: selectedColor.bgColor
      };
      onCreateLabel(newLabel);
      setNewLabelName('');
      setSelectedColor(labelColors[0]);
      setIsCreating(false);
    }
  };

  const handleEditLabel = (e) => {
    e.preventDefault();
    if (newLabelName.trim() && editingLabel) {
      const updatedLabel = {
        ...editingLabel,
        name: newLabelName.trim(),
        color: selectedColor.color,
        bgColor: selectedColor.bgColor
      };
      onEditLabel(updatedLabel);
      setEditingLabel(null);
      setNewLabelName('');
      setSelectedColor(labelColors[0]);
    }
  };

  const startEdit = (label) => {
    setEditingLabel(label);
    setNewLabelName(label.name);
    const colorMatch = labelColors.find(c => c.color === label.color) || labelColors[0];
    setSelectedColor(colorMatch);
    setIsCreating(false);
  };

  const cancelEdit = () => {
    setEditingLabel(null);
    setIsCreating(false);
    setNewLabelName('');
    setSelectedColor(labelColors[0]);
  };

  const startCreate = () => {
    setIsCreating(true);
    setEditingLabel(null);
    setNewLabelName('');
    setSelectedColor(labelColors[0]);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content label-manager" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🏷️ Gerenciar Labels</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="labels-list">
          <h3>Labels Existentes</h3>
          {Object.values(labels).length === 0 ? (
            <p className="no-labels">Nenhuma label criada ainda</p>
          ) : (
            <div className="existing-labels">
              {Object.values(labels).map((label) => (
                <div key={label.id} className="label-item">
                  <div 
                    className="label-preview"
                    style={{
                      backgroundColor: label.bgColor,
                      color: label.color
                    }}
                  >
                    {label.name}
                  </div>
                  <div className="label-actions">
                    <button 
                      className="edit-label-btn"
                      onClick={() => startEdit(label)}
                      title="Editar label"
                    >
                      ✏️
                    </button>
                    <button 
                      className="delete-label-btn"
                      onClick={() => onDeleteLabel(label.id)}
                      title="Excluir label"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {(isCreating || editingLabel) && (
          <div className="label-form">
            <h3>{editingLabel ? 'Editar Label' : 'Nova Label'}</h3>
            <form onSubmit={editingLabel ? handleEditLabel : handleCreateLabel}>
              <div className="form-group">
                <label htmlFor="labelName">Nome da Label</label>
                <input
                  type="text"
                  id="labelName"
                  value={newLabelName}
                  onChange={(e) => setNewLabelName(e.target.value)}
                  placeholder="Digite o nome da label..."
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label>Cor da Label</label>
                <div className="color-selector">
                  {labelColors.map((colorOption, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`color-option ${selectedColor.color === colorOption.color ? 'selected' : ''}`}
                      style={{
                        backgroundColor: colorOption.bgColor,
                        borderColor: colorOption.color
                      }}
                      onClick={() => setSelectedColor(colorOption)}
                      title={colorOption.name}
                    >
                      <span style={{ color: colorOption.color }}>●</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="label-preview-section">
                <label>Prévia:</label>
                <div 
                  className="label-preview large"
                  style={{
                    backgroundColor: selectedColor.bgColor,
                    color: selectedColor.color
                  }}
                >
                  {newLabelName || 'Nome da label'}
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={cancelEdit} className="btn-cancel">
                  Cancelar
                </button>
                <button type="submit" className="btn-save">
                  {editingLabel ? 'Salvar Alterações' : 'Criar Label'}
                </button>
              </div>
            </form>
          </div>
        )}

        {!isCreating && !editingLabel && (
          <div className="add-label-section">
            <button className="btn-add-label" onClick={startCreate}>
              + Nova Label
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LabelManager;
