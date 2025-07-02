import React, { createContext, useContext, useReducer, useMemo } from 'react';
import { initialData, activityTypes } from '../data/initialData';

// Tipos de ações
export const actionTypes = {
  // Autenticação
  SET_USER: 'SET_USER',
  SET_CURRENT_PAGE: 'SET_CURRENT_PAGE',
  LOGOUT: 'LOGOUT',
  
  // Dados do board
  SET_DATA: 'SET_DATA',
  UPDATE_CARD: 'UPDATE_CARD',
  ADD_CARD: 'ADD_CARD',
  DELETE_CARD: 'DELETE_CARD',
  MOVE_CARD: 'MOVE_CARD',
  BLOCK_CARD: 'BLOCK_CARD',
  UNBLOCK_CARD: 'UNBLOCK_CARD',
  ADD_COLUMN: 'ADD_COLUMN',
  
  // Filtros
  SET_SELECTED_CATEGORIES: 'SET_SELECTED_CATEGORIES',
  SET_SELECTED_DATE_FILTERS: 'SET_SELECTED_DATE_FILTERS',
  RESET_FILTERS: 'RESET_FILTERS',
  
  // Modais
  TOGGLE_MODAL: 'TOGGLE_MODAL',
  SET_SELECTED_COLUMN: 'SET_SELECTED_COLUMN',
  
  // Comentários
  SET_COMMENTS: 'SET_COMMENTS',
  ADD_COMMENT: 'ADD_COMMENT',
  EDIT_COMMENT: 'EDIT_COMMENT',
  DELETE_COMMENT: 'DELETE_COMMENT',
  
  // Atividades
  ADD_ACTIVITY: 'ADD_ACTIVITY',
  
  // UI
  SET_FILTERS_MINIMIZED: 'SET_FILTERS_MINIMIZED'
};

// Estado inicial
const initialState = {
  // Autenticação
  user: null,
  currentPage: 'login',
  
  // Dados do board
  data: initialData,
  
  // Filtros
  selectedCategories: [],
  selectedDateFilters: [],
  
  // Modais
  isModalOpen: false,
  selectedColumn: null,
  isBlockModalOpen: false,
  selectedCardForBlock: null,
  isLabelManagerOpen: false,
  isUserManagerOpen: false,
  isThemeSelectorOpen: false,
  isActivityLogOpen: false,
  activityLogCardId: null,
  isCommentsModalOpen: false,
  selectedCardForComments: null,
  isCardDetailOpen: false,
  selectedCardForDetail: null,
  isTeamChatOpen: false,
  isDataManagerOpen: false,
  
  // Comentários
  comments: [],
  
  // UI
  isFiltersMinimized: false
};

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    // Autenticação
    case actionTypes.SET_USER:
      return { ...state, user: action.payload };
      
    case actionTypes.SET_CURRENT_PAGE:
      return { ...state, currentPage: action.payload };
      
    case actionTypes.LOGOUT:
      return {
        ...initialState,
        data: initialData
      };
    
    // Dados do board
    case actionTypes.SET_DATA:
      return { ...state, data: action.payload || initialData };
      
    case actionTypes.UPDATE_CARD: {
      const { cardId, updates } = action.payload;
      return {
        ...state,
        data: {
          ...state.data,
          cards: {
            ...state.data.cards,
            [cardId]: {
              ...state.data.cards[cardId],
              ...updates
            }
          }
        }
      };
    }
    
    case actionTypes.ADD_CARD: {
      const newCard = action.payload;
      return {
        ...state,
        data: {
          ...state.data,
          cards: {
            ...state.data.cards,
            [newCard.id]: newCard
          },
          columns: {
            ...state.data.columns,
            [newCard.columnId]: {
              ...state.data.columns[newCard.columnId],
              cardIds: [...state.data.columns[newCard.columnId].cardIds, newCard.id]
            }
          }
        }
      };
    }
    
    case actionTypes.DELETE_CARD: {
      const cardId = action.payload;
      const card = state.data.cards[cardId];
      if (!card) return state;
      
      const newCards = { ...state.data.cards };
      delete newCards[cardId];
      
      const newColumns = {
        ...state.data.columns,
        [card.columnId]: {
          ...state.data.columns[card.columnId],
          cardIds: state.data.columns[card.columnId].cardIds.filter(id => id !== cardId)
        }
      };
      
      return {
        ...state,
        data: {
          ...state.data,
          cards: newCards,
          columns: newColumns
        }
      };
    }
    
    case actionTypes.MOVE_CARD: {
      const { cardId, sourceColumnId, destinationColumnId, destinationIndex } = action.payload;
      
      const newColumns = { ...state.data.columns };
      
      // Remover da coluna origem
      newColumns[sourceColumnId] = {
        ...newColumns[sourceColumnId],
        cardIds: newColumns[sourceColumnId].cardIds.filter(id => id !== cardId)
      };
      
      // Adicionar na coluna destino
      const destCardIds = [...newColumns[destinationColumnId].cardIds];
      destCardIds.splice(destinationIndex, 0, cardId);
      
      newColumns[destinationColumnId] = {
        ...newColumns[destinationColumnId],
        cardIds: destCardIds
      };
      
      return {
        ...state,
        data: {
          ...state.data,
          columns: newColumns,
          cards: {
            ...state.data.cards,
            [cardId]: {
              ...state.data.cards[cardId],
              columnId: destinationColumnId
            }
          }
        }
      };
    }
    
    case actionTypes.ADD_COLUMN: {
      const { columnId, title } = action.payload;
      const newColumn = {
        id: columnId,
        title: title || 'Nova Lista',
        cardIds: []
      };
      
      return {
        ...state,
        data: {
          ...state.data,
          columns: {
            ...state.data.columns,
            [columnId]: newColumn
          },
          columnOrder: [...state.data.columnOrder, columnId]
        }
      };
    }
    
    // Filtros
    case actionTypes.SET_SELECTED_CATEGORIES:
      return { ...state, selectedCategories: action.payload };
      
    case actionTypes.SET_SELECTED_DATE_FILTERS:
      return { ...state, selectedDateFilters: action.payload };
      
    case actionTypes.RESET_FILTERS:
      return {
        ...state,
        selectedCategories: [],
        selectedDateFilters: []
      };
    
    // Modais
    case actionTypes.TOGGLE_MODAL: {
      const { modalName, isOpen, data } = action.payload;
      const updates = { [modalName]: isOpen };
      
      if (data) {
        Object.assign(updates, data);
      }
      
      return { ...state, ...updates };
    }
    
    // Comentários
    case actionTypes.SET_COMMENTS:
      return { ...state, comments: action.payload };
      
    case actionTypes.ADD_COMMENT:
      return {
        ...state,
        comments: [...state.comments, action.payload]
      };
      
    case actionTypes.EDIT_COMMENT: {
      const editedComment = action.payload;
      return {
        ...state,
        comments: state.comments.map(comment =>
          comment.id === editedComment.id ? editedComment : comment
        )
      };
    }
    
    case actionTypes.DELETE_COMMENT: {
      const commentId = action.payload;
      return {
        ...state,
        comments: state.comments.filter(comment => comment.id !== commentId)
      };
    }
    
    // Atividades
    case actionTypes.ADD_ACTIVITY: {
      const activity = action.payload;
      return {
        ...state,
        data: {
          ...state.data,
          activities: {
            ...state.data.activities,
            [activity.id]: activity
          }
        }
      };
    }
    
    // UI
    case actionTypes.SET_FILTERS_MINIMIZED:
      return { ...state, isFiltersMinimized: action.payload };
    
    default:
      return state;
  }
}

// Context
const AppContext = createContext();

// Provider
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  // Seletores memoizados para otimizar re-renders
  const selectors = useMemo(() => ({
    // Dados básicos
    user: state.user,
    currentPage: state.currentPage,
    data: state.data,
    
    // Cards filtrados (memoizado)
    getFilteredCards: (columnId) => {
      if (!state.data || !state.data.columns || !state.data.cards) {
        return [];
      }
      
      const column = state.data.columns[columnId];
      if (!column || !column.cardIds) return [];
      
      return column.cardIds
        .map(cardId => state.data.cards[cardId])
        .filter(card => {
          if (!card) return false;
          
          // Filtro por categoria
          if (state.selectedCategories.length > 0) {
            if (!state.selectedCategories.includes(card.category)) {
              return false;
            }
          }
          
          // Filtro por data
          if (state.selectedDateFilters.length > 0) {
            const hasOverdue = state.selectedDateFilters.includes('overdue') && card.dueDate && new Date(card.dueDate) < new Date();
            const hasDueToday = state.selectedDateFilters.includes('dueToday') && card.dueDate && new Date(card.dueDate).toDateString() === new Date().toDateString();
            const hasDueSoon = state.selectedDateFilters.includes('dueSoon') && card.dueDate && new Date(card.dueDate) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
            const hasNoDueDate = state.selectedDateFilters.includes('noDueDate') && !card.dueDate;
            
            if (!hasOverdue && !hasDueToday && !hasDueSoon && !hasNoDueDate) {
              return false;
            }
          }
          
          return true;
        });
    },
    
    // Estados de filtros
    selectedCategories: state.selectedCategories,
    selectedDateFilters: state.selectedDateFilters,
    
    // Estados de modais
    modals: {
      isModalOpen: state.isModalOpen,
      selectedColumn: state.selectedColumn,
      isBlockModalOpen: state.isBlockModalOpen,
      selectedCardForBlock: state.selectedCardForBlock,
      isLabelManagerOpen: state.isLabelManagerOpen,
      isUserManagerOpen: state.isUserManagerOpen,
      isThemeSelectorOpen: state.isThemeSelectorOpen,
      isActivityLogOpen: state.isActivityLogOpen,
      activityLogCardId: state.activityLogCardId,
      isCommentsModalOpen: state.isCommentsModalOpen,
      selectedCardForComments: state.selectedCardForComments,
      isCardDetailOpen: state.isCardDetailOpen,
      selectedCardForDetail: state.selectedCardForDetail,
      isTeamChatOpen: state.isTeamChatOpen,
      isDataManagerOpen: state.isDataManagerOpen,
      isFiltersMinimized: state.isFiltersMinimized
    },
    
    // Comentários
    comments: state.comments,
    getCardComments: (cardId) => state.comments.filter(comment => comment.cardId === cardId)
  }), [state]);
  
  const value = useMemo(() => ({
    ...selectors,
    dispatch
  }), [selectors]);
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Hook para usar o contexto
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp deve ser usado dentro de AppProvider');
  }
  return context;
};

// Actions creators (helpers)
export const actions = {
  // Autenticação
  setUser: (user) => ({ type: actionTypes.SET_USER, payload: user }),
  setCurrentPage: (page) => ({ type: actionTypes.SET_CURRENT_PAGE, payload: page }),
  logout: () => ({ type: actionTypes.LOGOUT }),
  
  // Dados do board
  setData: (data) => ({ type: actionTypes.SET_DATA, payload: data }),
  updateCard: (cardId, updates) => ({ type: actionTypes.UPDATE_CARD, payload: { cardId, updates } }),
  addCard: (card) => ({ type: actionTypes.ADD_CARD, payload: card }),
  deleteCard: (cardId) => ({ type: actionTypes.DELETE_CARD, payload: cardId }),
  moveCard: (cardId, sourceColumnId, destinationColumnId, destinationIndex) => ({
    type: actionTypes.MOVE_CARD,
    payload: { cardId, sourceColumnId, destinationColumnId, destinationIndex }
  }),
  addColumn: (columnId, title) => ({ type: actionTypes.ADD_COLUMN, payload: { columnId, title } }),
  
  // Filtros
  setSelectedCategories: (categories) => ({ type: actionTypes.SET_SELECTED_CATEGORIES, payload: categories }),
  setSelectedDateFilters: (filters) => ({ type: actionTypes.SET_SELECTED_DATE_FILTERS, payload: filters }),
  resetFilters: () => ({ type: actionTypes.RESET_FILTERS }),
  
  // Modais
  toggleModal: (modalName, isOpen, data = null) => ({
    type: actionTypes.TOGGLE_MODAL,
    payload: { modalName, isOpen, data }
  }),
  
  // Comentários
  setComments: (comments) => ({ type: actionTypes.SET_COMMENTS, payload: comments }),
  addComment: (comment) => ({ type: actionTypes.ADD_COMMENT, payload: comment }),
  editComment: (comment) => ({ type: actionTypes.EDIT_COMMENT, payload: comment }),
  deleteComment: (commentId) => ({ type: actionTypes.DELETE_COMMENT, payload: commentId }),
  
  // Atividades
  addActivity: (activity) => ({ type: actionTypes.ADD_ACTIVITY, payload: activity }),
  
  // UI
  setFiltersMinimized: (minimized) => ({ type: actionTypes.SET_FILTERS_MINIMIZED, payload: minimized })
};
