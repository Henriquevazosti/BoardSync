import React, { useState } from 'react';
import { getAllUsers, generateUserId, defaultAvatars, labelColors } from '../../data/initialData';
import './UserManager.css';

const UserManager = ({ isOpen, onClose, users, onUsersChange }) => {
  const [editingUser, setEditingUser] = useState(null);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    avatar: '👩‍💻',
    color: '#0052cc',
    bgColor: '#e6f3ff'
  });

  if (!isOpen) return null;

  const allUsers = Object.values(users);

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      avatar: '👩‍💻',
      color: '#0052cc',
      bgColor: '#e6f3ff'
    });
    setEditingUser(null);
    setIsCreatingUser(false);
  };

  const handleCreateUser = () => {
    setIsCreatingUser(true);
    resetForm();
  };

  const handleEditUser = (user) => {
    setEditingUser(user.id);
    setFormData({
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      color: user.color,
      bgColor: user.bgColor
    });
  };

  const handleSaveUser = () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      alert('Nome e email são obrigatórios');
      return;
    }

    const userEmail = formData.email.toLowerCase();
    const existingUser = allUsers.find(u => 
      u.email.toLowerCase() === userEmail && u.id !== editingUser
    );

    if (existingUser) {
      alert('Já existe um usuário com este email');
      return;
    }

    if (editingUser) {
      // Editando usuário existente
      const updatedUsers = {
        ...users,
        [editingUser]: {
          ...users[editingUser],
          ...formData
        }
      };
      onUsersChange(updatedUsers);
    } else {
      // Criando novo usuário
      const newUserId = generateUserId();
      const newUser = {
        id: newUserId,
        ...formData
      };
      const updatedUsers = {
        ...users,
        [newUserId]: newUser
      };
      onUsersChange(updatedUsers);
    }

    resetForm();
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      const updatedUsers = { ...users };
      delete updatedUsers[userId];
      onUsersChange(updatedUsers);
    }
  };

  const handleColorSelect = (colorOption) => {
    setFormData({
      ...formData,
      color: colorOption.color,
      bgColor: colorOption.bgColor
    });
  };

  const handleCancel = () => {
    resetForm();
  };

  return (
    <div className="user-manager-overlay">
      <div className="user-manager-modal">
        <div className="user-manager-header">
          <h2>Gerenciar Usuários</h2>
          <button 
            className="close-btn"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="user-manager-content">
          {/* Formulário para criar/editar usuário */}
          {(isCreatingUser || editingUser) ? (
            <div className="user-form">
              <h3>{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</h3>
              
              <div className="form-group">
                <label>Nome *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome do usuário"
                  maxLength={50}
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@empresa.com"
                />
              </div>

              <div className="form-group">
                <label>Avatar</label>
                <div className="avatar-selector">
                  {defaultAvatars.map((avatar, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`avatar-option ${formData.avatar === avatar ? 'selected' : ''}`}
                      onClick={() => setFormData({ ...formData, avatar })}
                      style={{
                        backgroundColor: formData.avatar === avatar ? formData.bgColor : '#f4f5f7',
                        color: formData.avatar === avatar ? formData.color : '#5e6c84'
                      }}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Cor</label>
                <div className="color-selector">
                  {labelColors.map((colorOption, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`color-option ${formData.color === colorOption.color ? 'selected' : ''}`}
                      onClick={() => handleColorSelect(colorOption)}
                      style={{
                        backgroundColor: colorOption.bgColor,
                        color: colorOption.color,
                        border: `2px solid ${colorOption.color}`
                      }}
                      title={colorOption.name}
                    >
                      {formData.color === colorOption.color && '✓'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="user-preview">
                <label>Preview</label>
                <div 
                  className="user-preview-avatar"
                  style={{
                    backgroundColor: formData.bgColor,
                    color: formData.color,
                    border: `2px solid ${formData.color}`
                  }}
                >
                  {formData.avatar}
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="button"
                  className="btn-secondary"
                  onClick={handleCancel}
                >
                  Cancelar
                </button>
                <button 
                  type="button"
                  className="btn-primary"
                  onClick={handleSaveUser}
                >
                  {editingUser ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </div>
          ) : (
            /* Lista de usuários */
            <div className="users-list">
              <div className="users-list-header">
                <h3>Usuários ({allUsers.length})</h3>
                <button 
                  className="btn-primary"
                  onClick={handleCreateUser}
                >
                  + Novo Usuário
                </button>
              </div>

              <div className="users-grid">
                {allUsers.length === 0 ? (
                  <div className="no-users">
                    <p>Nenhum usuário cadastrado</p>
                    <button 
                      className="btn-primary"
                      onClick={handleCreateUser}
                    >
                      Criar primeiro usuário
                    </button>
                  </div>
                ) : (
                  allUsers.map(user => (
                    <div key={user.id} className="user-card">
                      <div className="user-card-header">
                        <div 
                          className="user-avatar"
                          style={{
                            backgroundColor: user.bgColor,
                            color: user.color,
                            border: `2px solid ${user.color}`
                          }}
                        >
                          {user.avatar}
                        </div>
                        <div className="user-info">
                          <div className="user-name">{user.name}</div>
                          <div className="user-email">{user.email}</div>
                        </div>
                      </div>
                      <div className="user-card-actions">
                        <button
                          className="btn-edit"
                          onClick={() => handleEditUser(user)}
                          title="Editar usuário"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDeleteUser(user.id)}
                          title="Excluir usuário"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManager;
