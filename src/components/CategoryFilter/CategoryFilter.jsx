import React from 'react';
import { categoryConfig, getMainCategories, getSubtaskCategories } from '../../data/initialData';
import './CategoryFilter.css';

const CategoryFilter = ({ 
  categories = [], 
  selectedCategories = [], 
  onSelectionChange, 
  onCategoryToggle, 
  onClearAll 
}) => {
  // Usar dados locais se categories for passado, senão usar dados do initialData
  const mainCategories = categories.length > 0 ? 
    categories.filter(cat => !cat.isSubtask) : 
    getMainCategories();
  
  const subtaskCategories = categories.length > 0 ? 
    categories.filter(cat => cat.isSubtask) : 
    getSubtaskCategories();

  // Função unificada para toggle de categoria
  const handleCategoryToggle = (categoryKey) => {
    if (onCategoryToggle) {
      onCategoryToggle(categoryKey);
    } else if (onSelectionChange) {
      if (selectedCategories.includes(categoryKey)) {
        onSelectionChange(selectedCategories.filter(cat => cat !== categoryKey));
      } else {
        onSelectionChange([...selectedCategories, categoryKey]);
      }
    }
  };

  // Função unificada para limpar todas
  const handleClearAll = () => {
    if (onClearAll) {
      onClearAll();
    } else if (onSelectionChange) {
      onSelectionChange([]);
    }
  };

  const renderCategoryButton = (key, config) => {
    // Garantir que config existe e tem as propriedades necessárias
    const safeConfig = config || {};
    const buttonKey = key || safeConfig.id || 'unknown';
    const displayName = safeConfig.name || buttonKey;
    const buttonColor = safeConfig.color || '#666';
    const buttonIcon = safeConfig.icon || '📋';
    
    return (
      <button
        key={buttonKey}
        className={`category-filter-btn ${selectedCategories.includes(buttonKey) ? 'active' : ''}`}
        onClick={() => handleCategoryToggle(buttonKey)}
        style={{
          borderColor: buttonColor
        }}
      >
        <span className="filter-icon" style={{ color: buttonColor }}>{buttonIcon}</span>
        <span className="filter-name">{displayName}</span>
      </button>
    );
  };

  return (
    <div className="category-filter">
      <div className="filter-header">
        <span className="filter-title">Filtrar por tipo:</span>
        <button className="clear-filters" onClick={handleClearAll}>
          Limpar filtros
        </button>
      </div>
      
      <div className="filter-section">
        <div className="filter-subsection">
          <span className="subsection-title">Tarefas Principais:</span>
          <div className="category-buttons">
            {categories.length > 0 ? 
              categories
                .filter(cat => !cat.isSubtask)
                .map((category) => renderCategoryButton(category.id, category)) :
              mainCategories.map((key) => renderCategoryButton(key, categoryConfig[key]))
            }
          </div>
        </div>
        
        <div className="filter-subsection">
          <span className="subsection-title">Subtarefas:</span>
          <div className="category-buttons">
            {categories.length > 0 ? 
              categories
                .filter(cat => cat.isSubtask)
                .map((category) => renderCategoryButton(category.id, category)) :
              subtaskCategories.map((key) => renderCategoryButton(key, categoryConfig[key]))
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryFilter;
