import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/Header/Header';
import Column from './components/Column/Column';
import NewCardModal from './components/NewCardModal/NewCardModal';
import CategoryFilter from './components/CategoryFilter/CategoryFilter';
import DueDateFilter from './components/DueDateFilter/DueDateFilter';
import BlockCardModal from './components/BlockCardModal/BlockCardModal';
import LabelManager from './components/LabelManager/LabelManager';
import UserManager from './components/UserManager/UserManager';
import ThemeSelector from './components/ThemeSelector/ThemeSelector';
import ActivityLog from './components/ActivityLog/ActivityLog';
import CommentsModal from './components/CommentsModal/CommentsModal';
import CardDetailView from './components/CardDetailView/CardDetailView';
import TeamChat from './components/TeamChat/TeamChat';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import DataManager from './components/DataManager/DataManager';
import AddListButton from './components/AddListButton/AddListButton';
import { buildApiUrl } from './config/api';
import { syncUsersWithAPI } from './services/userService';
import { workspaceService } from './services/workspaceService';
import { boardService } from './services/boardService';
import { initialData } from './data/productionInitialData';
import { activityTypes, createActivity } from './utils/activityUtils';
import { isOverdue, isDueToday, isDueSoon } from './utils/dateUtils';
import './App.css';
import './styles/themes.css';
import './App.css';
import commentService from './services/commentService';
import cardService from './services/cardService';
import listService from './services/listService';

const createEmptyBoardState = (baseData) => ({
  ...baseData,
  cards: {},
  columns: {},
  columnOrder: []
});

const normalizeCardFromApi = (apiCard, fallback = {}) => ({
  id: apiCard.id,
  title: apiCard.title,
  description: apiCard.description || '',
  priority: apiCard.priority || 'media',
  category: apiCard.category || 'tarefa',
  labels: fallback.labels || apiCard.labels || [],
  assignedUsers: fallback.assignedUsers || apiCard.assignedUsers || [],
  dueDate: apiCard.due_date || fallback.dueDate || null,
  createdAt: apiCard.created_at || fallback.createdAt || new Date().toISOString(),
  createdBy: apiCard.created_by || fallback.createdBy || null,
  comments: fallback.comments || apiCard.comments || [],
  attachments: fallback.attachments || apiCard.attachments || [],
  completedAt: apiCard.completed_at || fallback.completedAt || null,
  isBlocked: Boolean(apiCard.is_blocked),
  blockReason: apiCard.block_reason || '',
  startDate: apiCard.start_date || fallback.startDate || null,
  estimatedHours: apiCard.estimated_hours ?? fallback.estimatedHours ?? null,
  actualHours: apiCard.actual_hours ?? fallback.actualHours ?? null,
  coverImage: apiCard.cover_image || fallback.coverImage || '',
  columnId: apiCard.list_id || fallback.columnId || null,
  parentId: apiCard.parent_card_id || fallback.parentId || null
});

function App() {
  // Estados de autenticação
  const [user, setUser] = useState(() => {
    // Tenta restaurar do localStorage ao inicializar
    const savedUser = localStorage.getItem('boardsync_user') || localStorage.getItem('user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [currentPage, setCurrentPage] = useState('login'); // 'login', 'register', 'board'
  
  // Estados do board
  const [data, setData] = useState(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedDateFilters, setSelectedDateFilters] = useState([]);
  const [isFiltersMinimized, setIsFiltersMinimized] = useState(false);
  
  // Estados para modais e dialogs
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [selectedCardForBlock, setSelectedCardForBlock] = useState(null);
  const [isLabelManagerOpen, setIsLabelManagerOpen] = useState(false);
  const [isUserManagerOpen, setIsUserManagerOpen] = useState(false);
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState(false);
  const [isActivityLogOpen, setIsActivityLogOpen] = useState(false);
  const [activityLogCardId, setActivityLogCardId] = useState(null);
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const [selectedCardForComments, setSelectedCardForComments] = useState(null);
  const [isCardDetailOpen, setIsCardDetailOpen] = useState(false);
  const [selectedCardForDetail, setSelectedCardForDetail] = useState(null);
  const [isTeamChatOpen, setIsTeamChatOpen] = useState(false);
  const [isDataManagerOpen, setIsDataManagerOpen] = useState(false);
  const [currentBoardId, setCurrentBoardId] = useState(null);
  const [isBoardLoading, setIsBoardLoading] = useState(false);
  
  // Estados para dados dinâmicos
  const [comments, setComments] = useState([]);
  // Estado para mensagens do chat da equipe
  const [chatMessages, setChatMessages] = useState([]);
  
  // Efeito para verificar se há token de autenticação salvo no localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('boardsync_token') || localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('boardsync_user') || localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      try {
        localStorage.setItem('boardsync_token', savedToken);
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setCurrentPage('board');
        
        // Sincronizar usuários e board persistidos na API após restaurar sessão
        setIsBoardLoading(true);
        Promise.all([syncUsers(), loadBoardData()]).finally(() => {
          setIsBoardLoading(false);
        });
      } catch (error) {
        console.error('Erro ao restaurar sessão:', error);
        handleLogout();
      }
    }
  }, []);

  // Função para calcular estatísticas dos cards
  const getCardStatusCounts = () => {
    const allCards = Object.values(data.cards);
    
    return {
      total: allCards.length,
      overdue: allCards.filter(card => isOverdue(card.dueDate)).length,
      dueToday: allCards.filter(card => isDueToday(card.dueDate)).length,
      dueSoon: allCards.filter(card => isDueSoon(card.dueDate)).length,
      noDate: allCards.filter(card => !card.dueDate).length
    };
  };

  const filterCardsByDate = (cards) => {
    if (selectedDateFilters.length === 0) return cards;
    
    return cards.filter(card => {
      return selectedDateFilters.some(filter => {
        switch (filter) {
          case 'overdue':
            return isOverdue(card.dueDate);
          case 'due-today':
            return isDueToday(card.dueDate);
          case 'due-soon':
            return isDueSoon(card.dueDate);
          case 'no-date':
            return !card.dueDate;
          default:
            return false;
        }
      });
    });
  };

  // Função para filtrar cards combinando categoria e data
  const getFilteredCards = () => {
    let filteredCards = Object.values(data.cards);
    
    // Aplicar filtros de categoria
    if (selectedCategories.length > 0) {
      filteredCards = filteredCards.filter(card => 
        selectedCategories.includes(card.category)
      );
    }
    
    // Aplicar filtros de data
    filteredCards = filterCardsByDate(filteredCards);
    
    return filteredCards;
  };
  
  // FUNÇÕES DE AUTENTICAÇÃO
  
  // Sincronizar usuários com a API
  const syncUsers = async () => {
    console.log('➡️ Chamando syncUsersWithAPI...');
    const apiUsers = await syncUsersWithAPI();
    console.log('🔍 Usuários recebidos da API:', apiUsers);
    if (apiUsers && apiUsers.length > 0) {
      // Converter array para objeto { id: user }
      const usersObj = {};
      apiUsers.forEach(user => {
        usersObj[user.id] = user;
      });
      setData(prev => ({
        ...prev,
        users: usersObj
      }));
      setTimeout(() => {
        console.log('🟢 Estado data.users após sync:', usersObj);
      }, 1000);
    }
  };

  const loadBoardData = async () => {
    try {
      let workspace = null;
      const workspacesResponse = await workspaceService.getWorkspaces();
      const workspaces = [...(workspacesResponse.workspaces || [])].sort(
        (left, right) => new Date(right.updated_at || right.created_at || 0) - new Date(left.updated_at || left.created_at || 0)
      );
      workspace = workspaces[0] || null;

      if (!workspace) {
        const createdWorkspaceResponse = await workspaceService.createWorkspace({
          name: 'Workspace Principal',
          description: 'Workspace criado automaticamente para o ambiente stage',
          color: '#0b6b4b',
          visibility: 'private'
        });
        workspace = createdWorkspaceResponse.workspace;
      }

      let board = null;
      const boardsResponse = await boardService.getBoards(workspace.id);
      const boards = [...(boardsResponse.boards || [])].sort(
        (left, right) => new Date(right.updated_at || right.created_at || 0) - new Date(left.updated_at || left.created_at || 0)
      );
      board = boards[0] || null;

      if (!board) {
        const createdBoardResponse = await boardService.createBoard(workspace.id, {
          name: 'Board Principal',
          description: 'Board criado automaticamente para o ambiente stage',
          background_color: '#ffffff'
        });
        board = createdBoardResponse.board;
      }

      setCurrentBoardId(board.id);

      let boardResponse = await boardService.getBoard(board.id);
      let lists = [...(boardResponse.lists || [])].sort((left, right) => (left.position || 0) - (right.position || 0));

      if (lists.length === 0) {
        const defaultLists = ['Backlog', 'Em desenvolvimento', 'Em revisão', 'Concluido'];
        for (const listName of defaultLists) {
          await listService.create(board.id, { name: listName });
        }
        boardResponse = await boardService.getBoard(board.id);
        lists = [...(boardResponse.lists || [])].sort((left, right) => (left.position || 0) - (right.position || 0));
      }

      const cardResponses = await Promise.all(
        lists.map((list) => cardService.list(list.id).catch(() => ({ cards: [] })))
      );

      const cards = {};
      const columns = {};
      const columnOrder = [];

      lists.forEach((list, index) => {
        const listCards = [...(cardResponses[index].cards || [])].sort((left, right) => (left.position || 0) - (right.position || 0));

        columns[list.id] = {
          id: list.id,
          title: list.name,
          color: list.color || null,
          cardIds: []
        };
        columnOrder.push(list.id);

        listCards.forEach((apiCard) => {
          const normalizedCard = normalizeCardFromApi(apiCard);
          cards[normalizedCard.id] = normalizedCard;
          columns[list.id].cardIds.push(normalizedCard.id);
        });
      });

      setData((prevData) => ({
        ...prevData,
        cards,
        columns,
        columnOrder
      }));
    } catch (error) {
      console.error('Erro ao carregar board do backend:', error);
      setData((prevData) => createEmptyBoardState(prevData));
    }
  };

  // Login
  const handleLogin = async (userData) => {
    console.log('🔐 handleLogin chamado com:', userData);
    
    // Se os dados já vêm do Login.jsx (que já fez a autenticação)
    if (userData && userData.token) {
      localStorage.setItem('boardsync_token', userData.token);
      localStorage.setItem('authToken', userData.token);
      localStorage.setItem('boardsync_user', JSON.stringify(userData)); // <-- Adicione esta linha
      setUser(userData);
      setCurrentPage('board');
      setIsBoardLoading(true);
      await Promise.all([syncUsers(), loadBoardData()]);
      setIsBoardLoading(false);
      return true;
    }
    
    // Fallback para login direto (se necessário)
    try {
      const response = await fetch(buildApiUrl('/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        throw new Error('Credenciais inválidas');
      }
      
      const data = await response.json();
      
      if (data.token) {
        localStorage.setItem('boardsync_token', data.token);
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('boardsync_user', JSON.stringify(data.user)); // <-- Adicione esta linha
        setUser(data.user);
        setCurrentPage('board');
        setIsBoardLoading(true);
        await Promise.all([syncUsers(), loadBoardData()]);
        setIsBoardLoading(false);
        return true;
      } else {
        throw new Error(data.message || 'Erro no login');
      }
    } catch (error) {
      console.error('❌ Erro no login:', error);
      alert(`Erro no login: ${error.message}`);
      return false;
    }
  };

  // Registro
  const handleRegister = async (userData) => {
    console.log('📝 handleRegister chamado com:', userData);
    
    // Se os dados já vêm do Register.jsx (que já fez o registro)
    if (userData && userData.token) {
      localStorage.setItem('boardsync_token', userData.token);
      localStorage.setItem('authToken', userData.token);
      localStorage.setItem('boardsync_user', JSON.stringify(userData.user || userData));
      setUser(userData);
      setCurrentPage('board');
      
      // Sincronizar usuários e board com a API
      setIsBoardLoading(true);
      await Promise.all([syncUsers(), loadBoardData()]);
      setIsBoardLoading(false);
      
      return true;
    }
    
    // Fallback caso necessário
    try {
      const response = await fetch(buildApiUrl('/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro no registro');
      }
      
      const data = await response.json();
      
      if (data.token || data.user || data.message) {
        return handleLogin({
          email: userData.email,
          password: userData.password
        });
      } else {
        throw new Error(data.message || 'Erro no registro');
      }
    } catch (error) {
      console.error('❌ Erro no registro:', error);
      alert(`Erro no registro: ${error.message}`);
      return false;
    }
  };

  // Logout
  const handleLogout = () => {
    // Limpar dados de autenticação (ambos os formatos)
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('boardsync_token');
    localStorage.removeItem('boardsync_user');
    
    // Resetar estados
    setUser(null);
    setCurrentPage('login');
    setCurrentBoardId(null);
    setData(createEmptyBoardState(initialData));
  };

  // Navegação
  const goToLogin = () => setCurrentPage('login');
  const goToRegister = () => setCurrentPage('register');

  // FUNÇÕES DO BOARD
  
  // Função para resetar o board
  const resetBoard = async () => {
    if (window.confirm('Tem certeza que deseja recarregar o board a partir do backend? Alterações locais não salvas serão descartadas.')) {
      if (user && (localStorage.getItem('boardsync_token') || localStorage.getItem('authToken'))) {
        console.log('🔄 Recarregando board e sincronizando usuários da API');
        setIsBoardLoading(true);
        await Promise.all([syncUsers(), loadBoardData()]);
        setIsBoardLoading(false);
      } else {
        setData(createEmptyBoardState(initialData));
      }
    }
  };

  // Funções de manipulação de cards
  const handleAddCard = (columnId) => {
    setSelectedColumn(columnId);
    setIsModalOpen(true);
  };

  const handleCreateCard = async (newCard) => {
    try {
      const createPayload = {
        title: newCard.title,
        priority: newCard.priority,
        category: newCard.category
      };

      if (newCard.description) {
        createPayload.description = newCard.description;
      }

      if (newCard.dueDate) {
        createPayload.due_date = newCard.dueDate;
      }

      if (newCard.parentId) {
        createPayload.parent_card_id = newCard.parentId;
      }

      const dataResp = await cardService.create(newCard.columnId, createPayload);
      const card = normalizeCardFromApi(dataResp.card, {
        labels: newCard.labels || [],
        assignedUsers: newCard.assignedUsers || [],
        attachments: newCard.attachments || [],
        completedAt: newCard.completedAt || null,
        columnId: newCard.columnId
      });

      setData(prevData => {
        const column = prevData.columns[newCard.columnId];
        if (!column) {
          alert('Coluna não encontrada ao criar o card. Por favor, selecione uma coluna válida.');
          return prevData;
        }
        return {
          ...prevData,
          cards: {
            ...prevData.cards,
            [card.id]: card
          },
          columns: {
            ...prevData.columns,
            [newCard.columnId]: {
              ...column,
              cardIds: Array.isArray(column.cardIds) ? [...column.cardIds, card.id] : [card.id]
            }
          }
        };
      });

      setIsModalOpen(false);
      // Registrar atividade
      addActivity(card.id, activityTypes.CARD_CREATED, `Card criado: ${newCard.title}`);
    } catch (err) {
      alert(`Erro ao criar card: ${err.message}`);
    }
  };

  const handleUpdateCard = async (updatedCard) => {
    try {
      const response = await cardService.update(updatedCard.id, {
        title: updatedCard.title,
        description: updatedCard.description,
        priority: updatedCard.priority,
        category: updatedCard.category,
        is_blocked: updatedCard.isBlocked,
        block_reason: updatedCard.blockReason || '',
        due_date: updatedCard.dueDate,
        start_date: updatedCard.startDate || null,
        estimated_hours: updatedCard.estimatedHours ?? null,
        actual_hours: updatedCard.actualHours ?? null,
        cover_image: updatedCard.coverImage || ''
      });

      const normalizedCard = normalizeCardFromApi(response.card || {}, {
        ...updatedCard,
        columnId: updatedCard.columnId || data.cards[updatedCard.id]?.columnId
      });

      setData(prevData => ({
        ...prevData,
        cards: {
          ...prevData.cards,
          [updatedCard.id]: {
            ...prevData.cards[updatedCard.id],
            ...updatedCard,
            ...normalizedCard
          }
        }
      }));
      
      addActivity(updatedCard.id, activityTypes.CARD_UPDATED, `Card atualizado: ${updatedCard.title}`);
    } catch (error) {
      alert(`Erro ao atualizar card: ${error.message}`);
    }
  };

  const handleOpenCardDetail = (card) => {
    setSelectedCardForDetail(card);
    setIsCardDetailOpen(true);
  };
  
  // Movimentação de cards
  const moveCard = async (cardId, sourceColumnId, destinationColumnId, newIndex) => {
    try {
      const safeIndex = Number.isInteger(newIndex) && newIndex >= 0
        ? newIndex
        : data.columns[destinationColumnId]?.cardIds.length || 0;

      await cardService.move(cardId, destinationColumnId, safeIndex + 1, sourceColumnId);

      setData(prevData => {
      // Se está movendo dentro da mesma coluna
        if (sourceColumnId === destinationColumnId) {
          const column = prevData.columns[sourceColumnId];
          const newCardIds = Array.from(column.cardIds);
          const currentIndex = newCardIds.indexOf(cardId);
        
          newCardIds.splice(currentIndex, 1);
          newCardIds.splice(safeIndex, 0, cardId);
        
          return {
            ...prevData,
            columns: {
              ...prevData.columns,
              [sourceColumnId]: {
                ...column,
                cardIds: newCardIds
              }
            }
          };
        }
      
        const sourceColumn = prevData.columns[sourceColumnId];
        const destinationColumn = prevData.columns[destinationColumnId];
      
        const sourceCardIds = Array.from(sourceColumn.cardIds);
        const destinationCardIds = Array.from(destinationColumn.cardIds);
      
        sourceCardIds.splice(sourceCardIds.indexOf(cardId), 1);
      
        destinationCardIds.splice(safeIndex, 0, cardId);
      
        return {
          ...prevData,
          columns: {
            ...prevData.columns,
            [sourceColumnId]: {
              ...sourceColumn,
              cardIds: sourceCardIds
            },
            [destinationColumnId]: {
              ...destinationColumn,
              cardIds: destinationCardIds
            }
          },
          cards: {
            ...prevData.cards,
            [cardId]: {
              ...prevData.cards[cardId],
              columnId: destinationColumnId
            }
          }
        };
      });
      
      const sourceName = data.columns[sourceColumnId].title;
      const destName = data.columns[destinationColumnId].title;
      const cardTitle = data.cards[cardId].title;
      
      addActivity(
        cardId, 
        activityTypes.CARD_MOVED, 
        `Card movido: ${cardTitle}`,
        null,
        { sourceColumn: sourceName, destinationColumn: destName }
      );
    } catch (error) {
      alert(`Erro ao mover card: ${error.message}`);
    }
  };

  const handleAddColumn = async (columnTitle = 'Nova Lista') => {
    if (!currentBoardId) {
      alert('Board atual não encontrado.');
      return;
    }

    try {
      const response = await listService.create(currentBoardId, { name: columnTitle });
      const newColumn = {
        id: response.list.id,
        title: response.list.name,
        color: response.list.color || null,
        cardIds: []
      };

      setData(prevData => ({
        ...prevData,
        columns: {
          ...prevData.columns,
          [newColumn.id]: newColumn,
        },
        columnOrder: [...prevData.columnOrder, newColumn.id],
      }));
    } catch (error) {
      alert(`Erro ao criar lista: ${error.message}`);
    }
  };

  // FUNÇÕES DE BLOQUEIO DE CARDS
  
  const handleBlockCard = (card) => {
    setSelectedCardForBlock(card);
    setIsBlockModalOpen(true);
  };

  const handleConfirmBlock = async (cardId, blockReason) => {
    try {
      const response = await cardService.block(cardId, blockReason);
      const updatedCard = normalizeCardFromApi(response.card || {}, {
        ...data.cards[cardId],
        blockReason,
        isBlocked: true
      });
      setData(prev => ({
        ...prev,
        cards: {
          ...prev.cards,
          [cardId]: {
            ...prev.cards[cardId],
            ...updatedCard
          }
        }
      }));
      // Registrar atividade de bloqueio
      addActivity(cardId, activityTypes.CARD_BLOCKED, `Card bloqueado: ${blockReason}`);
    } catch (err) {
      alert('Erro ao bloquear card.');
    }
    setIsBlockModalOpen(false);
    setSelectedCardForBlock(null);
  };

  const handleUnblock = async (cardId) => {
    try {
      const response = await cardService.unblock(cardId);
      const updatedCard = normalizeCardFromApi(response.card || {}, {
        ...data.cards[cardId],
        blockReason: '',
        isBlocked: false
      });
      setData(prev => ({
        ...prev,
        cards: {
          ...prev.cards,
          [cardId]: {
            ...prev.cards[cardId],
            ...updatedCard
          }
        }
      }));
      // Registrar atividade de desbloqueio
      addActivity(cardId, activityTypes.CARD_UNBLOCKED, 'Card desbloqueado');
    } catch (err) {
      alert('Erro ao desbloquear card.');
    }
    setIsBlockModalOpen(false);
    setSelectedCardForBlock(null);
  };

  // FUNÇÕES DE GERENCIAMENTO DE LABELS
  
  const handleManageLabels = () => {
    setIsLabelManagerOpen(true);
  };

  const handleSaveLabels = (updatedLabels) => {
    setData(prevData => ({
      ...prevData,
      labels: updatedLabels
    }));
    
    setIsLabelManagerOpen(false);
  };
  
  const createLabel = (newLabel) => {
    setData(prevData => ({
      ...prevData,
      labels: {
        ...prevData.labels,
        [newLabel.id]: newLabel
      }
    }));
  };

  const editLabel = (updatedLabel) => {
    setData(prevData => ({
      ...prevData,
      labels: {
        ...prevData.labels,
        [updatedLabel.id]: updatedLabel
      }
    }));
  };

  const deleteLabel = (labelId) => {
    if (window.confirm('Tem certeza que deseja excluir esta label? Ela será removida de todos os cards.')) {
      setData(prevData => {
        // Remover a label
        const newLabels = { ...prevData.labels };
        delete newLabels[labelId];

        // Remover a label de todos os cards
        const newCards = { ...prevData.cards };
        Object.keys(newCards).forEach(cardId => {
          if (newCards[cardId].labels) {
            newCards[cardId] = {
              ...newCards[cardId],
              labels: newCards[cardId].labels.filter(id => id !== labelId)
            };
          }
        });

        return {
          ...prevData,
          labels: newLabels,
          cards: newCards
        };
      });
    }
  };

  // FUNÇÕES DE GERENCIAMENTO DE USUÁRIOS
  
  const handleManageUsers = () => {
    setIsUserManagerOpen(true);
  };

  const handleSaveUsers = (updatedUsers) => {
    setData(prevData => ({
      ...prevData,
      users: updatedUsers
    }));
    
    setIsUserManagerOpen(false);
  };

  // FUNÇÕES DE GERENCIAMENTO DE TEMAS
  
  const handleManageThemes = () => {
    setIsThemeSelectorOpen(true);
  };

  // FUNÇÕES PARA HISTÓRICO DE ATIVIDADES
  
  const addActivity = (cardId, type, description, userId = null, metadata = null) => {
    const activityId = `activity-${Date.now()}`;
    
    const activity = {
      id: activityId,
      cardId,
      userId: userId || (user ? user.id : 'user-1'),
      type,
      description,
      timestamp: new Date().toISOString(),
      metadata
    };
    
    setData(prevData => ({
      ...prevData,
      activities: {
        ...prevData.activities,
        [activityId]: activity
      }
    }));
    
    return activityId;
  };
  
  const handleViewActivityLog = (cardId = null) => {
    setActivityLogCardId(cardId);
    setIsActivityLogOpen(true);
  };

  const handleViewAllActivities = () => {
    setActivityLogCardId(null);
    setIsActivityLogOpen(true);
  };

  // Função para toggle dos filtros
  const toggleFilters = () => {
    setIsFiltersMinimized(!isFiltersMinimized);
  };

  // FUNÇÕES PARA COMENTÁRIOS
  
  const findCardInAllColumns = (cardId) => {
    return data.cards[cardId];
  };

  // Carregar comentários ao abrir modal
  const handleViewComments = async (cardId) => {
    console.log('handleViewComments chamada com cardId:', cardId);
    const card = findCardInAllColumns(cardId);
    if (card) {
      setSelectedCardForComments(card);
      setIsCommentsModalOpen(true);
      try {
        const res = await commentService.list(cardId);
        setComments(res.comments || []);
      } catch (err) {
        setComments([]);
        alert('Erro ao carregar comentários do card.');
      }
    } else {
      setComments([]);
      console.log('Card não encontrado!');
    }
  };

  // Adicionar comentário via API
  const handleAddComment = async (comment) => {
    try {
      const res = await commentService.add(comment.cardId, comment.text);
      setComments(prev => [...prev, res.comment]);
      // Adicionar atividade de comentário
      const activity = createActivity(
        comment.cardId,
        user ? user.id : 'user-1',
        activityTypes.COMMENT_ADDED,
        'Comentário adicionado',
        null,
        { 
          cardTitle: selectedCardForComments?.title || 'Card',
          commentText: comment.text.length > 50 ? comment.text.substring(0, 50) + '...' : comment.text
        }
      );
      setData(prev => ({
        ...prev,
        activities: {
          ...prev.activities,
          [activity.id]: activity
        }
      }));
    } catch (err) {
      alert('Erro ao adicionar comentário.');
    }
  };

  // Remover comentário via API
  const handleDeleteComment = async (commentId) => {
    const comment = comments.find(c => c.id === commentId);
    if (comment) {
      try {
        await commentService.remove(commentId);
        setComments(prev => prev.filter(c => c.id !== commentId));
        // Adicionar atividade de remoção de comentário
        addActivity(
          comment.cardId,
          activityTypes.COMMENT_DELETED,
          'Comentário removido',
          null,
          { 
            cardTitle: selectedCardForComments?.title || 'Card',
            commentText: comment.text.length > 50 ? comment.text.substring(0, 50) + '...' : comment.text
          }
        );
      } catch (err) {
        alert('Erro ao remover comentário.');
      }
    }
  };

  // Editar comentário via API
  const handleEditComment = async (editedComment) => {
    try {
      await commentService.edit(editedComment.id, editedComment.text);
      setComments(prev => 
        prev.map(comment => 
          comment.id === editedComment.id ? { ...comment, text: editedComment.text } : comment
        )
      );
      // Adicionar atividade de edição de comentário
      addActivity(
        editedComment.cardId,
        activityTypes.COMMENT_EDITED || 'comment_edited',
        'Comentário editado',
        null,
        { 
          cardTitle: selectedCardForComments?.title || 'Card',
          commentText: editedComment.text.length > 50 ? editedComment.text.substring(0, 50) + '...' : editedComment.text
        }
      );
    } catch (err) {
      alert('Erro ao editar comentário.');
    }
  };

  // Funções para o Team Chat
  const handleOpenTeamChat = () => {
    setIsTeamChatOpen(true);
  };

  const handleCloseTeamChat = () => {
    setIsTeamChatOpen(false);
  };

  const handleSendChatMessage = (message) => {
    const newMessage = {
      id: `message-${Date.now()}`,
      userId: user ? user.id : 'user-1',
      message: message,
      timestamp: new Date().toISOString()
    };
    
    setChatMessages(prev => [...prev, newMessage]);
    
    // Adicionar atividade de mensagem no chat
    addActivity(
      'team-chat',
      'chat_message',
      'Nova mensagem no chat da equipe',
      null,
      {
        messageType: message.type || 'text',
        hasFile: !!message.file,
        preview: message.content ? (message.content.length > 50 ? 
          message.content.substring(0, 50) + '...' : message.content) : 
          `Enviou ${message.type === 'image' ? 'uma imagem' : 
                   message.type === 'video' ? 'um vídeo' : 
                   message.type === 'audio' ? 'um áudio' : 'um arquivo'}`
      }
    );
  };

  // FUNÇÕES DE GERENCIAMENTO DE COLUNAS

  const handleEditColumn = async (columnId, newTitle) => {
    try {
      await listService.update(columnId, { name: newTitle });
      setData(prevData => ({
        ...prevData,
        columns: {
          ...prevData.columns,
          [columnId]: {
            ...prevData.columns[columnId],
            title: newTitle
          }
        }
      }));
    } catch (error) {
      alert(`Erro ao atualizar lista: ${error.message}`);
    }
  };

  const handleDeleteColumn = async (columnId) => {
    // Impedir exclusão da última coluna
    if (data.columnOrder.length <= 1) {
      alert('Não é possível excluir a última lista. O board deve ter pelo menos uma lista.');
      return;
    }

    try {
      const columnToDelete = data.columns[columnId];
      const cardsInColumn = columnToDelete.cardIds;

      if (cardsInColumn.length > 0) {
        const remainingColumns = data.columnOrder.filter(id => id !== columnId);
        if (remainingColumns.length > 0) {
          const firstColumnId = remainingColumns[0];
          const basePosition = data.columns[firstColumnId].cardIds.length;

          for (let index = 0; index < cardsInColumn.length; index += 1) {
            await cardService.move(cardsInColumn[index], firstColumnId, basePosition + index + 1, columnId);
          };
        }
      }

      await listService.delete(columnId);

      setData(prevData => {
        const cardsToMove = prevData.columns[columnId].cardIds;
        const remainingColumns = prevData.columnOrder.filter(id => id !== columnId);
        const updatedColumns = { ...prevData.columns };

        if (cardsToMove.length > 0 && remainingColumns.length > 0) {
          const firstColumnId = remainingColumns[0];
          updatedColumns[firstColumnId] = {
            ...updatedColumns[firstColumnId],
            cardIds: [...updatedColumns[firstColumnId].cardIds, ...cardsToMove]
          };
        }

        delete updatedColumns[columnId];

        const updatedCards = { ...prevData.cards };
        if (cardsToMove.length > 0 && remainingColumns.length > 0) {
          const firstColumnId = remainingColumns[0];
          cardsToMove.forEach((cardId) => {
            updatedCards[cardId] = {
              ...updatedCards[cardId],
              columnId: firstColumnId
            };
          });
        }

        return {
          ...prevData,
          cards: updatedCards,
          columns: updatedColumns,
          columnOrder: remainingColumns
        };
      });
    } catch (error) {
      alert(`Erro ao excluir lista: ${error.message}`);
    }
  };
  
  // RENDERIZAÇÃO CONDICIONAL

  // Se não estiver autenticado, mostrar login ou registro
  if (!user || currentPage !== 'board') {
    console.log('🔍 App: Renderizando login/register', { user, currentPage });
    if (currentPage === 'login') {
      return (
        <Login 
          onLogin={handleLogin}
          onGoToRegister={goToRegister}
        />
      );
    } else if (currentPage === 'register') {
      return (
        <Register 
          onRegister={handleRegister}
          onGoToLogin={goToLogin}
        />
      );
    }
  }

  if (isBoardLoading) {
    return (
      <ThemeProvider>
        <div className="app">
          <div className="board" style={{ padding: '32px', justifyContent: 'center' }}>
            <p>Carregando board do backend...</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  console.log('🔍 App: Renderizando board', { 
    user, 
    currentPage, 
    resetBoard: typeof resetBoard,
    usuarios: Object.keys(data.users).length,
    usuariosDados: Object.values(data.users) 
  });

  return (
    <ThemeProvider>
      <div className="app">
        <Header 
          user={user}
          onManageLabels={handleManageLabels}
          onManageUsers={handleManageUsers}
          onManageThemes={handleManageThemes}
          onViewActivities={handleViewAllActivities}
          onOpenTeamChat={handleOpenTeamChat}
          onManageData={() => setIsDataManagerOpen(true)}
          onResetBoard={resetBoard}
          onLogout={handleLogout}
        />
        <div className="board">
          <div className={`filters-section ${isFiltersMinimized ? 'minimized' : ''} ${(selectedCategories.length > 0 || selectedDateFilters.length > 0) ? 'has-active-filters' : ''}`}>
            <div className="filters-header">
              <h3>Filtros</h3>
              <button 
                className="minimize-btn" 
                onClick={() => setIsFiltersMinimized(!isFiltersMinimized)}
                title={isFiltersMinimized ? 'Expandir filtros' : 'Minimizar filtros'}
              >
                {isFiltersMinimized ? '📖' : '📕'}
              </button>
            </div>
            {!isFiltersMinimized && (
              <div className="filters-content">
                <CategoryFilter 
                  selectedCategories={selectedCategories}
                  onCategoryToggle={setSelectedCategories}
                />
                <DueDateFilter 
                  selectedFilters={selectedDateFilters}
                  onFiltersChange={setSelectedDateFilters}
                  cardsStats={getCardStatusCounts()}
                />
              </div>
            )}
          </div>

          <div className="board-content">
            {data.columnOrder.map((columnId) => {
              const column = data.columns[columnId];
              const allCards = column.cardIds.map(cardId => data.cards[cardId]).filter(Boolean);
              
              // Aplicar filtros apenas nos cards desta coluna
              let filteredCards = allCards;
              
              // Aplicar filtros de categoria
              if (selectedCategories.length > 0) {
                filteredCards = filteredCards.filter(card => 
                  selectedCategories.includes(card.category)
                );
              }
              
              // Aplicar filtros de data
              filteredCards = filterCardsByDate(filteredCards);

              return (
                <Column
                  key={column.id}
                  column={column}
                  cards={filteredCards}
                  totalCards={allCards.length}
                  allCards={data.cards}
                  allLabels={data.labels}
                  allUsers={data.users}
                  totalColumns={data.columnOrder.length}
                  onAddCard={handleAddCard}
                  onMoveCard={moveCard}
                  onOpenCardDetail={handleOpenCardDetail}
                  onBlockCard={handleBlockCard}
                  onManageLabels={handleManageLabels}
                  onViewActivityLog={handleViewActivityLog}
                  onViewComments={handleViewComments}
                  onEditColumn={handleEditColumn}
                  onDeleteColumn={handleDeleteColumn}
                />
              );
            })}
            <AddListButton onAddColumn={handleAddColumn} />
          </div>
        </div>

        {/* Modais */}
        {isModalOpen && (
          <NewCardModal
            columnId={selectedColumn}
            onCreateCard={handleCreateCard}
            onClose={() => setIsModalOpen(false)}
            allCards={data.cards}
            allLabels={data.labels}
            allUsers={data.users}
          />
        )}

        {isBlockModalOpen && selectedCardForBlock && (
          <BlockCardModal
            card={selectedCardForBlock}
            onBlock={handleConfirmBlock}
            onUnblock={handleUnblock}
            onClose={() => {
              setIsBlockModalOpen(false);
              setSelectedCardForBlock(null);
            }}
          />
        )}

        {isLabelManagerOpen && (
          <LabelManager
            labels={data.labels}
            onCreateLabel={createLabel}
            onEditLabel={editLabel}
            onDeleteLabel={deleteLabel}
            onClose={() => setIsLabelManagerOpen(false)}
          />
        )}

        <UserManager
          isOpen={isUserManagerOpen}
          users={data.users}
          onSave={handleSaveUsers}
          onClose={() => setIsUserManagerOpen(false)}
          onSyncUsers={syncUsers}
        />

        <ThemeSelector
          isOpen={isThemeSelectorOpen}
          onClose={() => setIsThemeSelectorOpen(false)}
        />

        <ActivityLog
          isOpen={isActivityLogOpen}
          activities={Object.values(data.activities)}
          users={data.users}
          cards={data.cards}
          cardId={activityLogCardId}
          onClose={() => {
            setIsActivityLogOpen(false);
            setActivityLogCardId(null);
          }}
        />

        {isCommentsModalOpen && selectedCardForComments && (
          <CommentsModal
            card={selectedCardForComments}
            allCards={data.cards}
            allUsers={data.users}
            comments={comments.filter(c => c.cardId === selectedCardForComments.id)}
            currentUser={user}
            onAddComment={handleAddComment}
            onDeleteComment={handleDeleteComment}
            onEditComment={handleEditComment}
            onClose={() => {
              setIsCommentsModalOpen(false);
              setSelectedCardForComments(null);
            }}
          />
        )}

        {isCardDetailOpen && selectedCardForDetail && (
          <CardDetailView
            card={selectedCardForDetail}
            allCards={data.cards}
            allLabels={data.labels}
            allUsers={data.users}
            onSave={handleUpdateCard}
            onClose={() => {
              setIsCardDetailOpen(false);
              setSelectedCardForDetail(null);
            }}
            onCreateCard={handleCreateCard}
            onBlockCard={handleBlockCard}
            onViewActivityLog={handleViewActivityLog}
            onViewComments={handleViewComments}
          />
        )}

        <TeamChat
          isOpen={isTeamChatOpen}
          messages={chatMessages}
          currentUser={user}
          onSendMessage={handleSendChatMessage}
          onClose={handleCloseTeamChat}
          allUsers={data.users}
        />

        <DataManager
          isOpen={isDataManagerOpen}
          data={data}
          onImportData={setData}
          onClose={() => setIsDataManagerOpen(false)}
        />
      </div>
    </ThemeProvider>
  );
}

export default App;
