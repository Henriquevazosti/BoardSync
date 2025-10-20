import React from 'react';
import { categoryConfig, getMainCategories, getSubtaskCategories } from '../../data/initialData';
import './CategoryFilter.css';

const CategoryFilter = ({ selectedCategories, onCategoryToggle, onClearAll }) => {
  const mainCategories = getMainCategories();
  const subtaskCategories = getSubtaskCategories();

  const renderCategoryButton = (key, config) => (
    <button
      key={key}
      className={`category-filter-btn ${selectedCategories.includes(key) ? 'active' : ''}`}
      onClick={() => onCategoryToggle(key)}
      style={{
        borderColor: config.color
      }}
    >
      <span className="filter-icon" style={{ color: config.color }}>{config.icon}</span>
      <span className="filter-name">{config.name}</span>
    </button>
  );

  return (
    <div className="category-filter">
      <div className="filter-header">
        <span className="filter-title">Filtrar por tipo:</span>
        <button className="clear-filters" onClick={onClearAll}>
          Limpar filtros
        </button>
      </div>
      
      <div className="filter-section">
        <div className="filter-subsection">
          <span className="subsection-title">Tarefas Principais:</span>
          <div className="category-buttons">
            {mainCategories.map((key) => renderCategoryButton(key, categoryConfig[key]))}
          </div>
        </div>
        
        <div className="filter-subsection">
          <span className="subsection-title">Subtarefas:</span>
          <div className="category-buttons">
            {subtaskCategories.map((key) => renderCategoryButton(key, categoryConfig[key]))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryFilter;
