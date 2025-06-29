import React, { useState, useEffect } from 'react';
import { 
  getCardActivities, 
  getAllActivities, 
  getRecentActivities,
  getUserActivities,
  formatActivityTimestamp, 
  getActivityIcon, 
  getActivityDescription 
} from '../../data/initialData';
import './ActivityLog.css';

const ActivityLog = ({ 
  isOpen, 
  onClose, 
  activities, 
  users, 
  cards, 
  cardId = null, // Se fornecido, mostra apenas atividades do card
  userId = null, // Se fornecido, mostra apenas atividades do usuário
  limit = 50 
}) => {
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!activities) return;

    let activityList = [];

    if (cardId) {
      activityList = getCardActivities(cardId, activities);
    } else if (userId) {
      activityList = getUserActivities(userId, activities);
    } else {
      activityList = getAllActivities(activities);
    }

    // Aplicar filtros
    if (filterType !== 'all') {
      activityList = activityList.filter(activity => activity.type === filterType);
    }

    // Aplicar busca
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      activityList = activityList.filter(activity => {
        const description = getActivityDescription(activity, users, cards).toLowerCase();
        const userName = users[activity.userId]?.name.toLowerCase() || '';
        const cardTitle = cards[activity.cardId]?.title.toLowerCase() || '';
        
        return description.includes(searchLower) || 
               userName.includes(searchLower) || 
               cardTitle.includes(searchLower);
      });
    }

    // Limitar resultados
    setFilteredActivities(activityList.slice(0, limit));
  }, [activities, users, cards, cardId, userId, filterType, searchTerm, limit]);

  if (!isOpen) return null;

  const getTitle = () => {
    if (cardId) {
      const card = cards[cardId];
      return `Histórico do Card: ${card?.title || 'Card não encontrado'}`;
    }
    if (userId) {
      const user = users[userId];
      return `Atividades de ${user?.name || 'Usuário não encontrado'}`;
    }
    return 'Histórico de Atividades';
  };

  const renderActivity = (activity) => {
    const user = users[activity.userId];
    const card = cards[activity.cardId];
    const icon = getActivityIcon(activity.type);
    const description = getActivityDescription(activity, users, cards);
    const timestamp = formatActivityTimestamp(activity.timestamp);

    return (
      <div key={activity.id} className="activity-item">
        <div className="activity-icon">{icon}</div>
        <div className="activity-content">
          <div className="activity-header">
            <div className="activity-user">
              {user && (
                <div 
                  className="user-avatar-tiny"
                  style={{
                    backgroundColor: user.bgColor,
                    color: user.color,
                    border: `1px solid ${user.color}`
                  }}
                  title={user.email}
                >
                  {user.avatar}
                </div>
              )}
              <span className="activity-description">{description}</span>
            </div>
            <span className="activity-timestamp">{timestamp}</span>
          </div>
          
          {card && !cardId && (
            <div className="activity-card-reference">
              <span className="card-reference">
                📋 {card.title}
              </span>
            </div>
          )}

          {/* Detalhes específicos da atividade */}
          {activity.type === 'card_moved' && activity.oldValue && activity.newValue && (
            <div className="activity-details">
              <span className="detail-item old-value">
                📂 {activity.oldValue.column}
              </span>
              <span className="arrow">→</span>
              <span className="detail-item new-value">
                📂 {activity.newValue.column}
              </span>
            </div>
          )}

          {activity.type === 'priority_changed' && (
            <div className="activity-details">
              <span className="detail-item old-value">
                ⭐ {activity.oldValue}
              </span>
              <span className="arrow">→</span>
              <span className="detail-item new-value">
                ⭐ {activity.newValue}
              </span>
            </div>
          )}

          {activity.type === 'card_blocked' && activity.newValue?.blockReason && (
            <div className="activity-details">
              <span className="block-reason">
                💬 "{activity.newValue.blockReason}"
              </span>
            </div>
          )}

          {(activity.type === 'labels_changed' || activity.type === 'users_assigned') && (
            <div className="activity-details">
              {activity.oldValue && (
                <div className="change-detail">
                  <span className="change-label">Anterior:</span>
                  <span className="change-value">{JSON.stringify(activity.oldValue)}</span>
                </div>
              )}
              {activity.newValue && (
                <div className="change-detail">
                  <span className="change-label">Novo:</span>
                  <span className="change-value">{JSON.stringify(activity.newValue)}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const filterOptions = [
    { value: 'all', label: 'Todas as atividades', icon: '📌' },
    { value: 'card_created', label: 'Cards criados', icon: '✨' },
    { value: 'card_moved', label: 'Movimentações', icon: '🔄' },
    { value: 'card_blocked', label: 'Bloqueios', icon: '🚫' },
    { value: 'priority_changed', label: 'Mudanças de prioridade', icon: '⭐' },
    { value: 'users_assigned', label: 'Atribuições', icon: '👥' },
    { value: 'labels_changed', label: 'Alterações de labels', icon: '🏷️' }
  ];

  return (
    <div className="activity-log-overlay">
      <div className="activity-log-modal">
        <div className="activity-log-header">
          <h2>{getTitle()}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="activity-log-filters">
          <div className="search-container">
            <input
              type="text"
              placeholder="Buscar atividades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>

          <div className="filter-container">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              {filterOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.icon} {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="activity-log-content">
          {filteredActivities.length === 0 ? (
            <div className="no-activities">
              <div className="no-activities-icon">📝</div>
              <h3>Nenhuma atividade encontrada</h3>
              <p>
                {searchTerm.trim() || filterType !== 'all' 
                  ? 'Tente ajustar os filtros ou termo de busca.'
                  : 'As atividades aparecerão aqui conforme você interage com o board.'
                }
              </p>
            </div>
          ) : (
            <div className="activities-list">
              <div className="activities-count">
                {filteredActivities.length} atividade{filteredActivities.length !== 1 ? 's' : ''} encontrada{filteredActivities.length !== 1 ? 's' : ''}
              </div>
              {filteredActivities.map(renderActivity)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;
