import React from 'react';
import './Header.css';

const Header = ({ user, onManageLabels, onManageUsers, onLogout }) => {
  return (
    <header className="header">
      <div className="header-content">
        <h1>BoardSync</h1>
        <div className="header-actions">
          <button 
            className="header-btn"
            onClick={onManageLabels}
            title="Gerenciar Labels"
          >
            🏷️ Labels
          </button>
          <button 
            className="header-btn"
            onClick={onManageUsers}
            title="Gerenciar Usuários"
          >
            👥 Usuários
          </button>
          
          <div className="user-info">
            <span className="user-name">Olá, {user?.name || user?.firstName || 'Usuário'}</span>
            <button 
              className="logout-btn"
              onClick={onLogout}
              title="Sair"
            >
              🚪 Sair
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
