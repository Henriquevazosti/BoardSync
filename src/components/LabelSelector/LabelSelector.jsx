import React, { useState } from 'react';
import './LabelSelector.css';

const LabelSelector = ({ availableLabels, selectedLabels, onLabelsChange, onManageLabels }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleLabel = (labelId) => {
    const newLabels = selectedLabels.includes(labelId)
      ? selectedLabels.filter(id => id !== labelId)
      : [...selectedLabels, labelId];
    onLabelsChange(newLabels);
  };

  const isLabelSelected = (labelId) => {
    return selectedLabels.includes(labelId);
  };

  return (
    <div className="label-selector">
      <div className="selector-header">
        <button 
          type="button"
          className="toggle-selector"
          onClick={() => setIsOpen(!isOpen)}
        >
          🏷️ Labels ({selectedLabels.length})
        </button>
        <button 
          type="button"
          className="manage-labels-btn"
          onClick={onManageLabels}
          title="Gerenciar labels"
        >
          ⚙️
        </button>
      </div>

      {isOpen && (
        <div className="labels-dropdown">
          {Object.values(availableLabels).length === 0 ? (
            <div className="no-labels-message">
              <p>Nenhuma label disponível</p>
              <button 
                type="button"
                className="create-first-label"
                onClick={onManageLabels}
              >
                Criar primeira label
              </button>
            </div>
          ) : (
            <div className="labels-grid">
              {Object.values(availableLabels).map((label) => (
                <div
                  key={label.id}
                  className={`label-option ${isLabelSelected(label.id) ? 'selected' : ''}`}
                  onClick={() => toggleLabel(label.id)}
                >
                  <div 
                    className="label-color-indicator"
                    style={{
                      backgroundColor: label.bgColor,
                      borderColor: label.color
                    }}
                  >
                    <span style={{ color: label.color }}>
                      {isLabelSelected(label.id) ? '✓' : '○'}
                    </span>
                  </div>
                  <span className="label-name">{label.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedLabels.length > 0 && (
        <div className="selected-labels-preview">
          {selectedLabels.map(labelId => {
            const label = availableLabels[labelId];
            if (!label) return null;
            return (
              <span
                key={labelId}
                className="selected-label"
                style={{
                  backgroundColor: label.bgColor,
                  color: label.color,
                  borderColor: label.color
                }}
              >
                {label.name}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LabelSelector;
