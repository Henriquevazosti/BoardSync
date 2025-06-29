import React, { useState, useRef, useEffect } from 'react';
import './UserSelector.css';

const UserSelector = ({ 
  allUsers, 
  selectedUserIds = [], 
  onUsersChange, 
  placeholder = "Atribuir usuários...",
  maxVisible = 3,
  isEditing = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  const selectedUsers = selectedUserIds.map(id => allUsers[id]).filter(Boolean);
  const availableUsers = Object.values(allUsers).filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleUser = (userId) => {
    const newSelectedIds = selectedUserIds.includes(userId)
      ? selectedUserIds.filter(id => id !== userId)
      : [...selectedUserIds, userId];
    
    onUsersChange(newSelectedIds);
  };

  const removeUser = (userId) => {
    const newSelectedIds = selectedUserIds.filter(id => id !== userId);
    onUsersChange(newSelectedIds);
  };

  const renderUserAvatar = (user, size = 'small', showRemove = false) => {
    return (
      <div 
        key={user.id} 
        className={`user-avatar user-avatar-${size}`}
        style={{ 
          backgroundColor: user.bgColor,
          color: user.color,
          border: `2px solid ${user.color}`
        }}
        title={`${user.name} (${user.email})`}
      >
        <span className="user-avatar-emoji">{user.avatar}</span>
        {showRemove && isEditing && (
          <button
            className="user-remove-btn"
            onClick={(e) => {
              e.stopPropagation();
              removeUser(user.id);
            }}
            type="button"
          >
            ×
          </button>
        )}
      </div>
    );
  };

  const visibleUsers = selectedUsers.slice(0, maxVisible);
  const hiddenCount = selectedUsers.length - maxVisible;

  return (
    <div className="user-selector" ref={dropdownRef}>
      <div 
        className={`user-selector-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedUsers.length === 0 ? (
          <span className="user-selector-placeholder">{placeholder}</span>
        ) : (
          <div className="selected-users-display">
            <div className="user-avatars-row">
              {visibleUsers.map(user => renderUserAvatar(user, 'small', true))}
              {hiddenCount > 0 && (
                <div className="user-avatar user-avatar-small user-avatar-count">
                  <span>+{hiddenCount}</span>
                </div>
              )}
            </div>
          </div>
        )}
        <span className={`dropdown-arrow ${isOpen ? 'rotated' : ''}`}>▼</span>
      </div>

      {isOpen && (
        <div className="user-selector-dropdown">
          <div className="user-search">
            <input
              type="text"
              placeholder="Buscar usuários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="user-search-input"
              autoFocus
            />
          </div>

          <div className="user-options">
            {availableUsers.length === 0 ? (
              <div className="no-users-found">Nenhum usuário encontrado</div>
            ) : (
              availableUsers.map(user => (
                <div
                  key={user.id}
                  className={`user-option ${selectedUserIds.includes(user.id) ? 'selected' : ''}`}
                  onClick={() => toggleUser(user.id)}
                >
                  {renderUserAvatar(user, 'medium')}
                  <div className="user-info">
                    <div className="user-name">{user.name}</div>
                    <div className="user-email">{user.email}</div>
                  </div>
                  {selectedUserIds.includes(user.id) && (
                    <span className="selection-check">✓</span>
                  )}
                </div>
              ))
            )}
          </div>

          {selectedUsers.length > 0 && (
            <div className="selected-users-section">
              <div className="section-title">Usuários Selecionados ({selectedUsers.length})</div>
              <div className="selected-users-list">
                {selectedUsers.map(user => (
                  <div key={user.id} className="selected-user-item">
                    {renderUserAvatar(user, 'small')}
                    <span className="user-name">{user.name}</span>
                    <button
                      className="remove-user-btn"
                      onClick={() => removeUser(user.id)}
                      type="button"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserSelector;
