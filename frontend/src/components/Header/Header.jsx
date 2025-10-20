import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import './Header.css';

const Header = ({ user, onManageLabels, onManageUsers, onManageThemes, onViewActivities, onOpenTeamChat, onManageData, onResetBoard, onLogout }) => {
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
          <button 
            className="header-btn"
            onClick={onManageThemes}
            title="Personalizar Visual"
          >
            🎨 Temas
          </button>
          <button 
            className="header-btn"
            onClick={onViewActivities}
            title="Histórico de Atividades"
          >
            📋 Histórico
          </button>
          <button 
            className="header-btn chat-btn"
            onClick={onOpenTeamChat}
            title="Chat da Equipe"
          >
            💬 Chat
          </button>
          <button 
            className="header-btn"
            onClick={onManageData}
            title="Exportar/Importar Dados"
          >
            💾 Dados
          </button>
          <button 
            className="header-btn reset-btn"
            onClick={() => {
              console.log('🔍 Header: Botão limpar clicado');
              console.log('🔍 Header: onResetBoard tipo:', typeof onResetBoard);
              
              if (onResetBoard && typeof onResetBoard === 'function') {
                console.log('🔍 Header: Chamando onResetBoard');
                onResetBoard();
              } else {
                console.error('❌ Header: onResetBoard não está definido ou não é uma função');
                
                // Fallback: implementar reset básico aqui
                if (confirm('⚠️ Tem certeza que deseja limpar o board? (Funcionalidade de fallback)')) {
                  console.log('🔄 Header: Executando reset via fallback - recarregando página');
                  window.location.reload();
                }
              }
            }}
            title="Limpar Board - Resetar todos os dados"
          >
            🧹 Limpar
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
