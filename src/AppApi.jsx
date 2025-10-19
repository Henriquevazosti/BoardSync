import React, { useState } from 'react';
import { AppProvider, useApp } from './contexts/AppContext.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import Header from './components/Header/Header.jsx';
import LoginApi from './components/Login/LoginApi.jsx';
import RegisterApi from './components/Register/RegisterApi.jsx';
import Column from './components/Column/Column.jsx';
import NewCardModal from './components/NewCardModal/NewCardModal.jsx';
import CategoryFilter from './components/CategoryFilter/CategoryFilter.jsx';
import DueDateFilter from './components/DueDateFilter/DueDateFilter.jsx';
import BlockCardModal from './components/BlockCardModal/BlockCardModal.jsx';
import LabelManager from './components/LabelManager/LabelManager.jsx';
import UserManager from './components/UserManager/UserManager.jsx';
import ThemeSelector from './components/ThemeSelector/ThemeSelector.jsx';
import ActivityLog from './components/ActivityLog/ActivityLog.jsx';
import CommentsModal from './components/CommentsModal/CommentsModal.jsx';
import CardDetailView from './components/CardDetailView/CardDetailView.jsx';
import TeamChat from './components/TeamChat/TeamChat.jsx';
import DataManager from './components/DataManager/DataManager.jsx';
import './styles/themes.css';
import './App.css';

// Componente principal da aplicação
function AppContent() {
  const { 
    user, 
    isAuthenticated, 
    authLoading,
    workspaces,
    currentWorkspace,
    workspacesLoading,
    activeModal,
    setActiveModal,
    sidebarOpen,
    setSidebarOpen,
    error,
    clearError
  } = useApp();

  const [authMode, setAuthMode] = useState('login'); // 'login' ou 'register'
  const [selectedCategory, setSelectedCategory] = useState('todas');
  const [selectedDueDate, setSelectedDueDate] = useState('todas');
  const [searchTerm, setSearchTerm] = useState('');

  // Debug logs
  console.log('AppContent state:', {
    user,
    isAuthenticated,
    authLoading,
    workspaces,
    currentWorkspace,
    workspacesLoading,
    error
  });

  // Mostrar loading enquanto verifica autenticação
  if (authLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Carregando BoardSync...</p>
      </div>
    );
  }

  // Se não estiver autenticado, mostrar tela de login/registro
  if (!isAuthenticated) {
    return (
      <div className="auth-container">
        {authMode === 'login' ? (
          <LoginApi onGoToRegister={() => setAuthMode('register')} />
        ) : (
          <RegisterApi onGoToLogin={() => setAuthMode('login')} />
        )}
      </div>
    );
  }

  // Se autenticado mas sem workspaces
  if (!workspacesLoading && workspaces.length === 0) {
    return (
      <div className="no-workspaces">
        <div className="no-workspaces-content">
          <h2>Bem-vindo ao BoardSync!</h2>
          <p>Você ainda não tem nenhum workspace. Crie um para começar.</p>
          <button
            onClick={() => setActiveModal('createWorkspace')}
            className="create-workspace-button"
          >
            Criar Primeiro Workspace
          </button>
        </div>
      </div>
    );
  }

  // Estrutura vazia para boards (dados vêm da API)
  const emptyBoardData = {
    lists: [
      {
        id: 'default-list-todo',
        name: 'A Fazer',
        cards: []
      },
      {
        id: 'default-list-doing',
        name: 'Em Progresso',
        cards: []
      },
      {
        id: 'default-list-done',
        name: 'Concluído',
        cards: []
      }
    ]
  };

  return (
    <div className="app">
      {/* Error Display */}
      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={clearError}>×</button>
        </div>
      )}

      {/* Header */}
      <Header
        user={user}
        currentWorkspace={currentWorkspace}
        workspaces={workspaces}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
        onOpenModal={setActiveModal}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* Main Content */}
      <div className="main-content">
        {/* Sidebar */}
        {sidebarOpen && (
          <div className="sidebar">
            <CategoryFilter
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
            <DueDateFilter
              selectedDueDate={selectedDueDate}
              onDueDateChange={setSelectedDueDate}
            />
            <div className="sidebar-section">
              <h3>Workspace Atual</h3>
              <div className="workspace-info">
                <h4>{currentWorkspace?.name || 'Carregando...'}</h4>
                <p>{currentWorkspace?.description || ''}</p>
              </div>
            </div>
          </div>
        )}

        {/* Board Content */}
        <div className="board-container">
          {workspacesLoading ? (
            <div className="loading">
              <div className="loading-spinner"></div>
              <p>Carregando workspace...</p>
            </div>
          ) : (
            <div className="board">
              {emptyBoardData.lists.map(list => (
                <Column
                  key={list.id}
                  listId={list.id}
                  title={list.name}
                  cards={list.cards}
                  onCardClick={(card) => setActiveModal({ type: 'cardDetail', card })}
                  searchTerm={searchTerm}
                  selectedCategory={selectedCategory}
                  selectedDueDate={selectedDueDate}
                />
              ))}
              
              {/* Add List Button */}
              <div className="add-list-column">
                <button
                  className="add-list-button"
                  onClick={() => setActiveModal('addList')}
                >
                  + Adicionar Lista
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {activeModal && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {activeModal === 'createWorkspace' && (
              <div>
                <h2>Criar Workspace</h2>
                <p>Funcionalidade em desenvolvimento...</p>
                <button onClick={() => setActiveModal(null)}>Fechar</button>
              </div>
            )}
            
            {activeModal === 'addList' && (
              <div>
                <h2>Adicionar Lista</h2>
                <p>Funcionalidade em desenvolvimento...</p>
                <button onClick={() => setActiveModal(null)}>Fechar</button>
              </div>
            )}
            
            {activeModal?.type === 'cardDetail' && (
              <CardDetailView
                card={activeModal.card}
                onClose={() => setActiveModal(null)}
                onUpdate={() => {}}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Componente raiz com providers
function AppApi() {
  return (
    <AppProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AppProvider>
  );
}

export default AppApi;
