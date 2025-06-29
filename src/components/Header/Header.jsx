import React from 'react';
import './Header.css';

const Header = ({ onManageLabels, onManageUsers }) => {
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
        </div>
      </div>
    </header>
  );
};

export default Header;
