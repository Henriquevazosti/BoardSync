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
import { syncUsersWithAPI } from './services/userService';
import { initialData } from './data/productionInitialData';
import { activityTypes, createActivity } from './utils/activityUtils';
import { isOverdue, isDueToday, isDueSoon } from './utils/dateUtils';
import './App.css';
import './styles/themes.css';
import './App.css';

function App() {
  // Estados de autenticação
  const [user, setUser] = useState(null);
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
  
  // Estados para dados dinâmicos
  const [comments, setComments] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  
  // Efeito para verificar se há token de autenticação salvo no localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('boardsync_token') || localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('boardsync_user') || localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setCurrentPage('board');
        
        // Sincronizar usuários com a API após restaurar sessão
        syncUsers();
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

  // Login
  const handleLogin = async (userData) => {
    console.log('🔐 handleLogin chamado com:', userData);
    
    // Se os dados já vêm do Login.jsx (que já fez a autenticação)
    if (userData && userData.token) {
      setUser(userData);
      setCurrentPage('board');
      
      // Sincronizar usuários com a API
      await syncUsers();
      
      return true;
    }
    
    // Fallback para login direto (se necessário)
    try {
      const response = await fetch('http://localhost:3001/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        throw new Error('Credenciais inválidas');
      }
      
      const data = await response.json();
      
      if (data.success && data.token) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setUser(data.user);
        setCurrentPage('board');
        
        await syncUsers();
        
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
      setUser(userData);
      setCurrentPage('board');
      
      // Sincronizar usuários com a API
      await syncUsers();
      
      return true;
    }
    
    // Fallback caso necessário
    try {
      const response = await fetch('http://localhost:3001/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro no registro');
      }
      
      const data = await response.json();
      
      if (data.success) {
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
  };

  // Navegação
  const goToLogin = () => setCurrentPage('login');
  const goToRegister = () => setCurrentPage('register');

  // FUNÇÕES DO BOARD
  
  // Função para resetar o board
  const resetBoard = async () => {
    if (window.confirm('Tem certeza que deseja resetar o board para o estado inicial? Todas as alterações serão perdidas.')) {
      // Restaurar dados iniciais
      setData(initialData);
      
      // Se estiver logado, sincronizar usuários para manter usuários reais
      if (user && localStorage.getItem('authToken')) {
        console.log('🔄 Resetando board e sincronizando usuários da API');
        await syncUsers();
      }
    }
  };

  // Funções de manipulação de cards
  const handleAddCard = (columnId) => {
    setSelectedColumn(columnId);
    setIsModalOpen(true);
  };

  const handleCreateCard = (newCard) => {
    const cardId = `card-${Date.now()}`;

    const finalCard = {
      ...newCard,
      id: cardId,
      createdAt: new Date().toISOString(),
      createdBy: user ? user.id : 'user-1', // Usar ID do usuário logado ou padrão
      comments: []
    };

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
          [cardId]: finalCard
        },
        columns: {
          ...prevData.columns,
          [newCard.columnId]: {
            ...column,
            cardIds: Array.isArray(column.cardIds) ? [...column.cardIds, cardId] : [cardId]
          }
        }
      };
    });

    setIsModalOpen(false);

    // Registrar atividade
    addActivity(cardId, activityTypes.CARD_CREATED, `Card criado: ${newCard.title}`);
  };

  const handleUpdateCard = (updatedCard) => {
    setData(prevData => ({
      ...prevData,
      cards: {
        ...prevData.cards,
        [updatedCard.id]: updatedCard
      }
    }));
    
    // Registrar atividade de edição
    addActivity(updatedCard.id, activityTypes.CARD_UPDATED, `Card atualizado: ${updatedCard.title}`);
  };

  const handleOpenCardDetail = (card) => {
    setSelectedCardForDetail(card);
    setIsCardDetailOpen(true);
  };
  
  // Movimentação de cards
  const moveCard = (cardId, sourceColumnId, destinationColumnId, newIndex) => {
    setData(prevData => {
      // Se está movendo dentro da mesma coluna
      if (sourceColumnId === destinationColumnId) {
        const column = prevData.columns[sourceColumnId];
        const newCardIds = Array.from(column.cardIds);
        const currentIndex = newCardIds.indexOf(cardId);
        
        // Remover da posição atual e inserir na nova posição
        newCardIds.splice(currentIndex, 1);
        newCardIds.splice(newIndex, 0, cardId);
        
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
      
      // Se está movendo para outra coluna
      const sourceColumn = prevData.columns[sourceColumnId];
      const destinationColumn = prevData.columns[destinationColumnId];
      
      const sourceCardIds = Array.from(sourceColumn.cardIds);
      const destinationCardIds = Array.from(destinationColumn.cardIds);
      
      // Remover da coluna de origem
      sourceCardIds.splice(sourceCardIds.indexOf(cardId), 1);
      
      // Adicionar à coluna de destino na posição correta
      destinationCardIds.splice(newIndex, 0, cardId);
      
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
        }
      };
    });
    
    // Registrar atividade de movimentação
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
  };

  const handleAddColumn = (columnTitle = 'Nova Lista') => {
    const newColumnId = `column-${Date.now()}`;
    const newColumn = {
      id: newColumnId,
      title: columnTitle,
      cardIds: [],
    };

    setData(prevData => ({
      ...prevData,
      columns: {
        ...prevData.columns,
        [newColumnId]: newColumn,
      },
      columnOrder: [...prevData.columnOrder, newColumnId],
    }));
  };

  // FUNÇÕES DE BLOQUEIO DE CARDS
  
  const handleBlockCard = (card) => {
    setSelectedCardForBlock(card);
    setIsBlockModalOpen(true);
  };

  const handleConfirmBlock = (cardId, blockReason) => {
    setData(prevData => ({
      ...prevData,
      cards: {
        ...prevData.cards,
        [cardId]: {
          ...prevData.cards[cardId],
          isBlocked: true,
          blockReason: blockReason
        }
      }
    }));

    // Registrar atividade de bloqueio
    addActivity(cardId, activityTypes.CARD_BLOCKED, `Card bloqueado: ${blockReason}`);
    
    setIsBlockModalOpen(false);
    setSelectedCardForBlock(null);
  };

  const handleUnblock = (cardId) => {
    setData(prevData => ({
      ...prevData,
      cards: {
        ...prevData.cards,
        [cardId]: {
          ...prevData.cards[cardId],
          isBlocked: false,
          blockReason: ''
        }
      }
    }));

    // Registrar atividade de desbloqueio
    addActivity(cardId, activityTypes.CARD_UNBLOCKED, 'Card desbloqueado');
    
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
  
  const handleViewComments = (cardId) => {
    console.log('handleViewComments chamada com cardId:', cardId);
    const card = findCardInAllColumns(cardId);
    console.log('Card encontrado:', card);
    
    if (card) {
      setSelectedCardForComments(card);
      setIsCommentsModalOpen(true);
      console.log('Modal de comentários aberto');
    } else {
      console.log('Card não encontrado!');
    }
  };

  const handleAddComment = (comment) => {
    setComments(prev => [...prev, comment]);
    
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
  };

  const handleDeleteComment = (commentId) => {
    const comment = comments.find(c => c.id === commentId);
    if (comment) {
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
    }
  };

  // Função para editar comentário
  const handleEditComment = (editedComment) => {
    setComments(prev => 
      prev.map(comment => 
        comment.id === editedComment.id ? editedComment : comment
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

  const handleEditColumn = (columnId, newTitle) => {
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
  };

  const handleDeleteColumn = (columnId) => {
    // Impedir exclusão da última coluna
    if (data.columnOrder.length <= 1) {
      alert('Não é possível excluir a última lista. O board deve ter pelo menos uma lista.');
      return;
    }

    setData(prevData => {
      const columnToDelete = prevData.columns[columnId];
      const cardsInColumn = columnToDelete.cardIds;
      
      // Se há cards na coluna, mover para a primeira coluna disponível
      if (cardsInColumn.length > 0) {
        const remainingColumns = prevData.columnOrder.filter(id => id !== columnId);
        if (remainingColumns.length > 0) {
          const firstColumnId = remainingColumns[0];
          
          // Mover todos os cards da coluna deletada para a primeira coluna
          const updatedColumns = {
            ...prevData.columns,
            [firstColumnId]: {
              ...prevData.columns[firstColumnId],
              cardIds: [...prevData.columns[firstColumnId].cardIds, ...cardsInColumn]
            }
          };
          
          // Remover a coluna deletada
          delete updatedColumns[columnId];
          
          return {
            ...prevData,
            columns: updatedColumns,
            columnOrder: prevData.columnOrder.filter(id => id !== columnId)
          };
        }
      }
      
      // Se não há cards, apenas remover a coluna
      const updatedColumns = { ...prevData.columns };
      delete updatedColumns[columnId];
      
      return {
        ...prevData,
        columns: updatedColumns,
        columnOrder: prevData.columnOrder.filter(id => id !== columnId)
      };
    });
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
