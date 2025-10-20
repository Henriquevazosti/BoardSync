import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { useWorkspaces } from '../hooks/useWorkspaces.js';

// Estado inicial
const initialState = {
  // Auth
  user: null,
  isAuthenticated: false,
  authLoading: true,
  
  // Workspaces
  workspaces: [],
  currentWorkspace: null,
  workspacesLoading: false,
  
  // Boards
  boards: [],
  currentBoard: null,
  boardsLoading: false,
  
  // UI
  activeModal: null,
  sidebarOpen: true,
  error: null,
};

// Ações
export const APP_ACTIONS = {
  // Auth
  SET_USER: 'SET_USER',
  SET_AUTH_LOADING: 'SET_AUTH_LOADING',
  LOGOUT: 'LOGOUT',
  
  // Workspaces
  SET_WORKSPACES: 'SET_WORKSPACES',
  SET_CURRENT_WORKSPACE: 'SET_CURRENT_WORKSPACE',
  SET_WORKSPACES_LOADING: 'SET_WORKSPACES_LOADING',
  ADD_WORKSPACE: 'ADD_WORKSPACE',
  UPDATE_WORKSPACE: 'UPDATE_WORKSPACE',
  DELETE_WORKSPACE: 'DELETE_WORKSPACE',
  
  // Boards
  SET_BOARDS: 'SET_BOARDS',
  SET_CURRENT_BOARD: 'SET_CURRENT_BOARD',
  SET_BOARDS_LOADING: 'SET_BOARDS_LOADING',
  ADD_BOARD: 'ADD_BOARD',
  UPDATE_BOARD: 'UPDATE_BOARD',
  DELETE_BOARD: 'DELETE_BOARD',
  
  // UI
  SET_ACTIVE_MODAL: 'SET_ACTIVE_MODAL',
  SET_SIDEBAR_OPEN: 'SET_SIDEBAR_OPEN',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    // Auth
    case APP_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
      };
    
    case APP_ACTIONS.SET_AUTH_LOADING:
      return {
        ...state,
        authLoading: action.payload,
      };
    
    case APP_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        workspaces: [],
        currentWorkspace: null,
        boards: [],
        currentBoard: null,
      };
    
    // Workspaces
    case APP_ACTIONS.SET_WORKSPACES:
      return {
        ...state,
        workspaces: action.payload,
      };
    
    case APP_ACTIONS.SET_CURRENT_WORKSPACE:
      return {
        ...state,
        currentWorkspace: action.payload,
        currentBoard: null, // Reset board quando workspace muda
      };
    
    case APP_ACTIONS.SET_WORKSPACES_LOADING:
      return {
        ...state,
        workspacesLoading: action.payload,
      };
    
    case APP_ACTIONS.ADD_WORKSPACE:
      return {
        ...state,
        workspaces: [...state.workspaces, action.payload],
      };
    
    case APP_ACTIONS.UPDATE_WORKSPACE:
      return {
        ...state,
        workspaces: state.workspaces.map(ws => 
          ws.id === action.payload.id ? action.payload : ws
        ),
        currentWorkspace: state.currentWorkspace?.id === action.payload.id 
          ? action.payload 
          : state.currentWorkspace,
      };
    
    case APP_ACTIONS.DELETE_WORKSPACE:
      return {
        ...state,
        workspaces: state.workspaces.filter(ws => ws.id !== action.payload),
        currentWorkspace: state.currentWorkspace?.id === action.payload 
          ? null 
          : state.currentWorkspace,
      };
    
    // Boards
    case APP_ACTIONS.SET_BOARDS:
      return {
        ...state,
        boards: action.payload,
      };
    
    case APP_ACTIONS.SET_CURRENT_BOARD:
      return {
        ...state,
        currentBoard: action.payload,
      };
    
    case APP_ACTIONS.SET_BOARDS_LOADING:
      return {
        ...state,
        boardsLoading: action.payload,
      };
    
    // UI
    case APP_ACTIONS.SET_ACTIVE_MODAL:
      return {
        ...state,
        activeModal: action.payload,
      };
    
    case APP_ACTIONS.SET_SIDEBAR_OPEN:
      return {
        ...state,
        sidebarOpen: action.payload,
      };
    
    case APP_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
      };
    
    case APP_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    
    default:
      return state;
  }
}

// Contexto
const AppContext = createContext();

// Provider
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const auth = useAuth();
  const workspaces = useWorkspaces();

  // Sincronizar auth state
  useEffect(() => {
    dispatch({ type: APP_ACTIONS.SET_USER, payload: auth.user });
    dispatch({ type: APP_ACTIONS.SET_AUTH_LOADING, payload: auth.loading });
  }, [auth.user, auth.loading]);

  // Sincronizar workspaces state
  useEffect(() => {
    dispatch({ type: APP_ACTIONS.SET_WORKSPACES, payload: workspaces.workspaces });
    dispatch({ type: APP_ACTIONS.SET_WORKSPACES_LOADING, payload: workspaces.loading });
  }, [workspaces.workspaces, workspaces.loading]);

  useEffect(() => {
    dispatch({ type: APP_ACTIONS.SET_CURRENT_WORKSPACE, payload: workspaces.currentWorkspace });
  }, [workspaces.currentWorkspace]);

  // Funções da aplicação
  const appActions = {
    // Auth
    login: auth.login,
    register: auth.register,
    logout: () => {
      auth.logout();
      dispatch({ type: APP_ACTIONS.LOGOUT });
    },
    
    // Workspaces
    loadWorkspaces: workspaces.loadWorkspaces,
    createWorkspace: workspaces.createWorkspace,
    updateWorkspace: workspaces.updateWorkspace,
    deleteWorkspace: workspaces.deleteWorkspace,
    setCurrentWorkspace: (workspace) => {
      workspaces.setCurrentWorkspace(workspace);
      dispatch({ type: APP_ACTIONS.SET_CURRENT_WORKSPACE, payload: workspace });
    },
    
    // UI
    setActiveModal: (modal) => {
      dispatch({ type: APP_ACTIONS.SET_ACTIVE_MODAL, payload: modal });
    },
    setSidebarOpen: (open) => {
      dispatch({ type: APP_ACTIONS.SET_SIDEBAR_OPEN, payload: open });
    },
    setError: (error) => {
      dispatch({ type: APP_ACTIONS.SET_ERROR, payload: error });
    },
    clearError: () => {
      dispatch({ type: APP_ACTIONS.CLEAR_ERROR });
    },
  };

  const contextValue = {
    ...state,
    ...appActions,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

// Hook para usar o contexto
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
