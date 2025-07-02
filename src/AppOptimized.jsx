import React, { Suspense, useCallback, useMemo } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppProvider, useApp, actions } from './contexts/AppContext';
import { usePerformanceMonitor, useDebounce } from './hooks/performanceHooks';

// Componentes críticos (carregados imediatamente)
import { 
  Header, 
  Card, 
  Login,
  LoadingFallback,
  // Lazy components
  NewCardModal,
  CategoryFilter,
  DueDateFilter,
  BlockCardModal,
  LabelManager,
  UserManager,
  ThemeSelector,
  ActivityLog,
  CommentsModal,
  CardDetailView,
  TeamChat,
  Register,
  DataManager
} from './utils/componentLoader.jsx';

// Importar Column virtualizada
import ColumnVirtualized from './components/Column/ColumnVirtualized';
import PerformanceDashboard from './components/PerformanceDashboard/PerformanceDashboard';

// Utilitários de data
import { 
  isOverdue, 
  isDueToday, 
  isDueSoon
} from './data/initialData';
import PerformanceNotifications from './components/PerformanceNotifications/PerformanceNotifications';

import { 
  getSubtasks, 
  isSubtask, 
  createActivity,
  activityTypes
} from './data/initialData';

import './styles/themes.css';
import './styles/performance.css';
import './App.css';

// Componente principal do board (memoizado)
const BoardContent = React.memo(() => {
  const { 
    data, 
    getFilteredCards, 
    selectedCategories,
    selectedDateFilters,
    modals,
    comments,
    getCardComments,
    user,
    dispatch 
  } = useApp();

  usePerformanceMonitor('BoardContent');

  // Função para calcular estatísticas dos cards
  const getCardsStats = useMemo(() => {
    if (!data?.cards) {
      return {
        total: 0,
        overdue: 0,
        dueToday: 0,
        dueSoon: 0,
        noDate: 0
      };
    }

    const allCards = Object.values(data.cards);
    
    return {
      total: allCards.length,
      overdue: allCards.filter(card => isOverdue(card.dueDate)).length,
      dueToday: allCards.filter(card => isDueToday(card.dueDate)).length,
      dueSoon: allCards.filter(card => isDueSoon(card.dueDate)).length,
      noDate: allCards.filter(card => !card.dueDate).length
    };
  }, [data?.cards]);

  // Debounce para filtros para evitar re-renders excessivos
  // const debouncedCategories = useDebounce(selectedCategories, 300);
  // const debouncedDateFilters = useDebounce(selectedDateFilters, 300);

  // Memoizar handlers para evitar re-renders desnecessários
  const handlers = useMemo(() => ({
    handleAddCard: (columnId) => {
      dispatch(actions.toggleModal('isModalOpen', true, { selectedColumn: columnId }));
    },

    handleEditCard: (updatedCard) => {
      const originalCard = data.cards[updatedCard.id];
      
      // Atualizar o card
      dispatch(actions.updateCard(updatedCard.id, updatedCard));
      
      // Detectar mudanças específicas e adicionar atividades
      if (originalCard && originalCard.title !== updatedCard.title) {
        const activity = createActivity(
          updatedCard.id,
          user.id,
          activityTypes.TITLE_CHANGED,
          'Título alterado',
          originalCard.title,
          updatedCard.title
        );
        dispatch(actions.addActivity(activity));
      }
      
      if (originalCard && originalCard.description !== updatedCard.description) {
        const activity = createActivity(
          updatedCard.id,
          user.id,
          activityTypes.DESCRIPTION_CHANGED,
          'Descrição atualizada'
        );
        dispatch(actions.addActivity(activity));
      }
      
      // Adicionar outras verificações se necessário...
    },

    handleDeleteCard: (cardId) => {
      const card = data.cards[cardId];
      if (card && window.confirm('Tem certeza que deseja excluir este card?')) {
        dispatch(actions.deleteCard(cardId));
        
        // Adicionar atividade
        const activity = createActivity(
          cardId,
          user.id,
          activityTypes.CARD_DELETED,
          'Card excluído',
          null,
          { cardTitle: card.title }
        );
        dispatch(actions.addActivity(activity));
      }
    },

    handleMoveCard: (cardId, sourceColumnId, destinationColumnId, destinationIndex) => {
      dispatch(actions.moveCard(cardId, sourceColumnId, destinationColumnId, destinationIndex));
      
      // Adicionar atividade
      const activity = createActivity(
        cardId,
        user.id,
        activityTypes.CARD_MOVED,
        'Card movido',
        null,
        { 
          cardTitle: data.cards[cardId]?.title || 'Card',
          fromColumn: data.columns[sourceColumnId]?.title,
          toColumn: data.columns[destinationColumnId]?.title
        }
      );
      dispatch(actions.addActivity(activity));
    },

    handleBlockCard: (card) => {
      dispatch(actions.toggleModal('isBlockModalOpen', true, { selectedCardForBlock: card }));
    },

    handleUnblockCard: (cardId) => {
      dispatch(actions.updateCard(cardId, { blocked: false, blockReason: null }));
      
      // Adicionar atividade
      const activity = createActivity(
        cardId,
        user.id,
        activityTypes.CARD_UNBLOCKED,
        'Card desbloqueado',
        null,
        { cardTitle: data.cards[cardId]?.title || 'Card' }
      );
      dispatch(actions.addActivity(activity));
    },

    handleViewComments: (card) => {
      dispatch(actions.toggleModal('isCommentsModalOpen', true, { 
        selectedCardForComments: card 
      }));
    },

    handleViewActivityLog: (cardId) => {
      dispatch(actions.toggleModal('isActivityLogOpen', true, { 
        activityLogCardId: cardId 
      }));
    },

    handleOpenCardDetail: (card) => {
      dispatch(actions.toggleModal('isCardDetailOpen', true, { 
        selectedCardForDetail: card 
      }));
    },

    handleAddComment: (comment) => {
      dispatch(actions.addComment(comment));
      
      // Adicionar atividade
      const activity = createActivity(
        comment.cardId,
        user.id,
        activityTypes.COMMENT_ADDED,
        'Comentário adicionado',
        null,
        { 
          cardTitle: modals.selectedCardForComments?.title || 'Card',
          commentText: comment.text.length > 50 ? comment.text.substring(0, 50) + '...' : comment.text
        }
      );
      dispatch(actions.addActivity(activity));
    },

    handleEditComment: (editedComment) => {
      dispatch(actions.editComment(editedComment));
      
      // Adicionar atividade
      const activity = createActivity(
        editedComment.cardId,
        user.id,
        activityTypes.COMMENT_EDITED,
        'Comentário editado',
        null,
        { 
          cardTitle: modals.selectedCardForComments?.title || 'Card',
          commentText: editedComment.text.length > 50 ? editedComment.text.substring(0, 50) + '...' : editedComment.text
        }
      );
      dispatch(actions.addActivity(activity));
    },

    handleDeleteComment: (commentId) => {
      const comment = comments.find(c => c.id === commentId);
      if (comment) {
        dispatch(actions.deleteComment(commentId));
        
        // Adicionar atividade
        const activity = createActivity(
          comment.cardId,
          user.id,
          activityTypes.COMMENT_DELETED,
          'Comentário removido',
          null,
          { 
            cardTitle: modals.selectedCardForComments?.title || 'Card',
            commentText: comment.text.length > 50 ? comment.text.substring(0, 50) + '...' : comment.text
          }
        );
        dispatch(actions.addActivity(activity));
      }
    }
  }), [data, user, dispatch, comments, modals]);

  // Memoizar colunas renderizadas
  const renderedColumns = useMemo(() => {
    if (!data?.columnOrder || !data?.columns) {
      return [];
    }
    
    return data.columnOrder.map(columnId => {
      const column = data.columns[columnId];
      if (!column) return null;
      
      const filteredCards = getFilteredCards(columnId);
      
      return (
        <ColumnVirtualized
          key={columnId}
          column={column}
          cards={filteredCards}
          totalCards={data?.cards ? Object.values(data.cards).filter(card => card.columnId === columnId).length : 0}
          allCards={data?.cards ? Object.values(data.cards) : []}
          allLabels={data?.labels || {}}
          allUsers={data?.users || {}}
          onAddCard={handlers.handleAddCard}
          onMoveCard={handlers.handleMoveCard}
          onOpenCardDetail={handlers.handleOpenCardDetail}
          onBlockCard={handlers.handleBlockCard}
          onManageLabels={() => dispatch(actions.toggleModal('isLabelManagerOpen', true))}
          onViewActivityLog={handlers.handleViewActivityLog}
          onViewComments={handlers.handleViewComments}
        />
      );
    }).filter(Boolean); // Remove valores nulos
  }, [data, getFilteredCards, handlers, user]);

  return (
    <div className="app">
      <Header 
        user={user}
        onManageLabels={() => {
          console.log('📋 onManageLabels chamado');
          dispatch(actions.toggleModal('isLabelManagerOpen', true));
        }}
        onManageUsers={() => {
          console.log('👥 onManageUsers chamado');
          dispatch(actions.toggleModal('isUserManagerOpen', true));
        }}
        onManageThemes={() => {
          console.log('🎨 onManageThemes chamado');
          dispatch(actions.toggleModal('isThemeSelectorOpen', true));
        }}
        onViewActivities={() => {
          console.log('📋 onViewActivities chamado');
          dispatch(actions.toggleModal('isActivityLogOpen', true));
        }}
        onOpenTeamChat={() => {
          console.log('💬 onOpenTeamChat chamado');
          dispatch(actions.toggleModal('isTeamChatOpen', true));
        }}
        onManageData={() => {
          console.log('💾 onManageData chamado');
          dispatch(actions.toggleModal('isDataManagerOpen', true));
        }}
        onLogout={() => {
          console.log('🚪 onLogout chamado');
          dispatch(actions.logout());
        }}
      />
      
      <div className="board">
        <div className={`filters-section ${modals.isFiltersMinimized ? 'minimized' : ''} ${(selectedCategories.length > 0 || selectedDateFilters.length > 0) ? 'has-active-filters' : ''}`}>
          <div className="filters-header">
            <h3 className="filters-title">
              {modals.isFiltersMinimized ? 'Filtros' : 'Filtros do Board'}
            </h3>
            <button 
              className="toggle-filters-btn"
              onClick={() => dispatch(actions.toggleModal('isFiltersMinimized', !modals.isFiltersMinimized))}
              title={modals.isFiltersMinimized ? 'Expandir filtros' : 'Minimizar filtros'}
            >
              {modals.isFiltersMinimized ? '🔽' : '🔼'}
            </button>
          </div>
          {!modals.isFiltersMinimized && (
            <div className="filters-content">
              <Suspense fallback={<LoadingFallback message="Carregando filtros..." />}>
                <CategoryFilter 
                  selectedCategories={selectedCategories}
                  onCategoryToggle={(category) => {
                    const newCategories = selectedCategories.includes(category) 
                      ? selectedCategories.filter(cat => cat !== category)
                      : [...selectedCategories, category];
                    dispatch(actions.setSelectedCategories(newCategories));
                  }}
                  onClearAll={() => dispatch(actions.setSelectedCategories([]))}
                />
                <DueDateFilter 
                  selectedFilters={selectedDateFilters}
                  onFiltersChange={(filters) => dispatch(actions.setSelectedDateFilters(filters))}
                  cardsStats={getCardsStats}
                />
              </Suspense>
            </div>
          )}
        </div>
        
        <div className="board-content">
          {renderedColumns}
          <button 
            className="add-list-button" 
            onClick={() => dispatch(actions.addColumn(`column-${Date.now()}`, 'Nova Lista'))}
          >
            + Adicionar outra lista
          </button>
        </div>
      </div>

      {/* Modais lazy loaded */}
      <Suspense fallback={<div className="modal-loading-fallback"><LoadingFallback /></div>}>
        {modals.isModalOpen && (
          <NewCardModal
            isOpen={modals.isModalOpen}
            onClose={() => dispatch(actions.toggleModal('isModalOpen', false))}
            onSubmit={(cardData) => {
              const newCard = {
                id: `card-${Date.now()}`,
                ...cardData,
                columnId: modals.selectedColumn,
                createdAt: new Date().toISOString(),
                completed: false,
                blocked: false
              };
              dispatch(actions.addCard(newCard));
              dispatch(actions.toggleModal('isModalOpen', false));
            }}
            column={data.columns[modals.selectedColumn]}
            allLabels={data.labels}
            allUsers={data.users}
          />
        )}

        {modals.isCommentsModalOpen && (
          <CommentsModal
            isOpen={modals.isCommentsModalOpen}
            onClose={() => dispatch(actions.toggleModal('isCommentsModalOpen', false))}
            card={modals.selectedCardForComments}
            comments={getCardComments(modals.selectedCardForComments?.id)}
            currentUser={user}
            onAddComment={handlers.handleAddComment}
            onEditComment={handlers.handleEditComment}
            onDeleteComment={handlers.handleDeleteComment}
          />
        )}

        {modals.isCardDetailOpen && modals.selectedCardForDetail && (
          <CardDetailView
            card={modals.selectedCardForDetail}
            allCards={data.cards}
            allLabels={data.labels}
            allUsers={data.users}
            comments={getCardComments(modals.selectedCardForDetail?.id)}
            currentUser={user}
            onSave={handlers.handleEditCard}
            onClose={() => dispatch(actions.toggleModal('isCardDetailOpen', false))}
            onAddComment={handlers.handleAddComment}
            onEditComment={handlers.handleEditComment}
            onDeleteComment={handlers.handleDeleteComment}
            onViewActivityLog={handlers.handleViewActivityLog}
            onManageLabels={() => dispatch(actions.toggleModal('isLabelManagerOpen', true))}
          />
        )}

        {/* Outros modais... */}
      </Suspense>
    </div>
  );
});

BoardContent.displayName = 'BoardContent';

// Componente wrapper para autenticação
const AuthWrapper = React.memo(() => {
  const { currentPage, user, dispatch } = useApp();

  const handleLogin = useCallback((userData) => {
    dispatch(actions.setUser(userData));
    dispatch(actions.setCurrentPage('board'));
  }, [dispatch]);

  const handleRegister = useCallback((userData) => {
    dispatch(actions.setUser(userData));
    dispatch(actions.setCurrentPage('board'));
  }, [dispatch]);

  if (currentPage === 'login') {
    return (
      <Login 
        onLogin={handleLogin}
        onSwitchToRegister={() => dispatch(actions.setCurrentPage('register'))}
      />
    );
  }

  if (currentPage === 'register') {
    return (
      <Suspense fallback={<LoadingFallback message="Carregando registro..." />}>
        <Register 
          onRegister={handleRegister}
          onSwitchToLogin={() => dispatch(actions.setCurrentPage('login'))}
        />
      </Suspense>
    );
  }

  if (user && currentPage === 'board') {
    return <BoardContent />;
  }

  return <LoadingFallback message="Inicializando..." />;
});

AuthWrapper.displayName = 'AuthWrapper';

// Componente para gerenciar atalhos de teclado globais
const GlobalKeyboardHandler = ({ children }) => {
  return children;
};

// App principal
function App() {
  usePerformanceMonitor('App');
  
  // Estado para controlar dashboard de performance
  const [showPerformanceDashboard, setShowPerformanceDashboard] = React.useState(false);
  const [showPerformanceNotifications, setShowPerformanceNotifications] = React.useState(false); // Desabilitado temporariamente

  // Teste de clique simples
  React.useEffect(() => {
    const testClick = () => {
      console.log('🖱️ Clique global detectado!');
    };
    
    document.addEventListener('click', testClick);
    return () => document.removeEventListener('click', testClick);
  }, []);

  // Atalho de teclado para toggle do dashboard (Ctrl+Shift+P)
  React.useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'P') {
        event.preventDefault();
        setShowPerformanceDashboard(prev => !prev);
      }
      // Ctrl+Shift+N para notificações
      if (event.ctrlKey && event.shiftKey && event.key === 'N') {
        event.preventDefault();
        setShowPerformanceNotifications(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <ThemeProvider>
      <AppProvider>
        <GlobalKeyboardHandler>
          <div className="app-container">
            <AuthWrapper />
            
            {/* Dashboard de Performance */}
            <PerformanceDashboard
              isVisible={showPerformanceDashboard}
              onClose={() => setShowPerformanceDashboard(false)}
            />
            
            {/* Notificações de Performance - Desabilitadas temporariamente */}
            {false && (
              <PerformanceNotifications
                isEnabled={showPerformanceNotifications}
              />
            )}
            
            {/* Indicador de atalho */}
            {!showPerformanceDashboard && (
              <div 
                className="performance-shortcut-hint"
                title="Pressione Ctrl+Shift+P para Dashboard | Ctrl+Shift+N para Notificações"
                onClick={() => setShowPerformanceDashboard(true)}
              >
                📊
              </div>
            )}
          </div>
        </GlobalKeyboardHandler>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
