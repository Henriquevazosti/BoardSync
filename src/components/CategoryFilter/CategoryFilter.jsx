import React from 'react';
import { categoryConfig } from '../../data/initialData';
import './CategoryFilter.css';

const CategoryFilter = ({ selectedCategories, onCategoryToggle, onClearAll }) => {
  return (
    <div className="category-filter">
      <div className="filter-header">
        <span className="filter-title">Filtrar por tipo:</span>
        <button className="clear-filters" onClick={onClearAll}>
          Limpar filtros
        </button>
      </div>
      
      <div className="category-buttons">
        {Object.entries(categoryConfig).map(([key, config]) => (
          <button
            key={key}
            className={`category-filter-btn ${selectedCategories.includes(key) ? 'active' : ''}`}
            onClick={() => onCategoryToggle(key)}
            style={{
              backgroundColor: selectedCategories.includes(key) ? config.color : 'transparent',
              color: selectedCategories.includes(key) ? 'white' : config.color,
              borderColor: config.color
            }}
          >
            <span className="filter-icon">{config.icon}</span>
            <span className="filter-name">{config.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
