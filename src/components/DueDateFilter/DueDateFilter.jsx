import React from 'react';
import './DueDateFilter.css';

const DueDateFilter = ({ selectedFilters = [], onSelectionChange, onFiltersChange, cardsStats = {} }) => {
  const filters = [
    {
      id: 'all',
      name: 'Todos',
      icon: '📋',
      count: cardsStats.total || 0,
      color: 'var(--color-textSecondary)'
    },
    {
      id: 'overdue',
      name: 'Vencidos',
      icon: '⚠️',
      count: cardsStats.overdue || 0,
      color: 'var(--color-error)'
    },
    {
      id: 'due-today',
      name: 'Vence Hoje',
      icon: '🔔',
      count: cardsStats.dueToday || 0,
      color: 'var(--color-warning)'
    },
    {
      id: 'due-soon',
      name: 'Vence em Breve',
      icon: '⏰',
      count: cardsStats.dueSoon || 0,
      color: 'var(--color-primary)'
    },
    {
      id: 'no-date',
      name: 'Sem Data',
      icon: '📝',
      count: cardsStats.noDate || 0,
      color: 'var(--color-textMuted)'
    }
  ];

  const handleFilterClick = (filterId) => {
    const handleChange = onFiltersChange || onSelectionChange;
    if (!handleChange) return;
    
    if (filterId === 'all') {
      handleChange([]);
    } else if (selectedFilters.includes(filterId)) {
      handleChange(selectedFilters.filter(f => f !== filterId));
    } else {
      handleChange([...selectedFilters, filterId]);
    }
  };

  const isFilterActive = (filterId) => {
    if (filterId === 'all') {
      return selectedFilters.length === 0;
    }
    return selectedFilters.includes(filterId);
  };

  return (
    <div className="due-date-filter">
      <div className="filter-header">
        <h3>📅 Filtrar por Prazo</h3>
      </div>
      
      <div className="filter-options">
        {filters.map((filter) => (
          <button
            key={filter.id}
            className={`filter-option ${isFilterActive(filter.id) ? 'active' : ''}`}
            onClick={() => handleFilterClick(filter.id)}
            disabled={filter.count === 0 && filter.id !== 'all'}
            style={{
              '--filter-color': filter.color
            }}
          >
            <span className="filter-icon">{filter.icon}</span>
            <span className="filter-name">{filter.name}</span>
            <span className="filter-count">({filter.count})</span>
          </button>
        ))}
      </div>

      {selectedFilters.length > 0 && (
        <div className="active-filters">
          <span className="active-filters-label">Filtros ativos:</span>
          <div className="active-filter-tags">
            {selectedFilters.map(filterId => {
              const filter = filters.find(f => f.id === filterId);
              return (
                <span
                  key={filterId}
                  className="active-filter-tag"
                  style={{ '--filter-color': filter?.color }}
                >
                  {filter?.icon} {filter?.name}
                  <button
                    className="remove-filter-btn"
                    onClick={() => handleFilterClick(filterId)}
                    title={`Remover filtro ${filter?.name}`}
                  >
                    ×
                  </button>
                </span>
              );
            })}
            <button
              className="clear-all-filters-btn"
              onClick={() => onSelectionChange && onSelectionChange([])}
              title="Limpar todos os filtros"
            >
              Limpar tudo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DueDateFilter;
