import React, { useState } from 'react';
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
import { 
  initialData, 
  getSubtasks, 
  isSubtask, 
  isOverdue, 
  isDueToday, 
  isDueSoon,
  createActivity,
  activityTypes
} from './data/initialData';
import './styles/themes.css';
import './App.css';

function App() {
  // Estados de autenticação
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('login'); // 'login', 'register', 'board'
  
  // Estados do board (existentes)
  const [data, setData] = useState(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedDateFilters, setSelectedDateFilters] = useState([]);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [selectedCardForBlock, setSelectedCardForBlock] = useState(null);
  const [isLabelManagerOpen, setIsLabelManagerOpen] = useState(false);
  const [isUserManagerOpen, setIsUserManagerOpen] = useState(false);
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState(false);
  const [isActivityLogOpen, setIsActivityLogOpen] = useState(false);
  const [activityLogCardId, setActivityLogCardId] = useState(null);
  const [isFiltersMinimized, setIsFiltersMinimized] = useState(false);
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const [selectedCardForComments, setSelectedCardForComments] = useState(null);
  const [comments, setComments] = useState([]);
  const [isCardDetailOpen, setIsCardDetailOpen] = useState(false);
  const [selectedCardForDetail, setSelectedCardForDetail] = useState(null);
  const [isTeamChatOpen, setIsTeamChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [isDataManagerOpen, setIsDataManagerOpen] = useState(false);

  // Funções de autenticação
  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentPage('board');
  };

  const handleRegister = (userData) => {
    setUser(userData);
    setCurrentPage('board');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('login');
    // Reset board state
    setData(initialData);
    setIsModalOpen(false);
    setSelectedColumn(null);
    setSelectedCategories([]);
    setSelectedDateFilters([]); // Bug corrigido: resetar filtros de data
    setIsBlockModalOpen(false);
    setSelectedCardForBlock(null);
    setIsLabelManagerOpen(false);
    setIsUserManagerOpen(false);
    setIsThemeSelectorOpen(false);
    setIsActivityLogOpen(false);
    setActivityLogCardId(null);
    setIsDataManagerOpen(false);
    setIsFiltersMinimized(false); // Bug corrigido: resetar estado dos filtros
    setIsCommentsModalOpen(false); // Bug corrigido: fechar modal de comentários
    setSelectedCardForComments(null);
    setComments([]); // Bug corrigido: limpar comentários
    setIsCardDetailOpen(false); // Bug corrigido: fechar detalhes do card
    setSelectedCardForDetail(null);
    setIsTeamChatOpen(false); // Bug corrigido: fechar chat
    setChatMessages([]); // Bug corrigido: limpar mensagens do chat
  };

  const goToLogin = () => {
    setCurrentPage('login');
  };

  const goToRegister = () => {
    setCurrentPage('register');
  };

  // Se não estiver autenticado, mostrar login ou registro
  if (!user || currentPage !== 'board') {
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

  // Função para adicionar atividade
  const addActivity = (cardId, type, description, oldValue = null, newValue = null) => {
    if (!user || !user.id) return;
    
    const activity = createActivity(cardId, user.id, type, description, oldValue, newValue);
    
    setData(prevData => ({
      ...prevData,
      activities: {
        ...prevData.activities,
        [activity.id]: activity
      }
    }));
  };

  // Função para importar dados
  const handleImportData = (importedData) => {
    try {
      // Validar se os dados importados são válidos
      if (!importedData || typeof importedData !== 'object') {
        throw new Error('Dados importados são inválidos');
      }

      // Aplicar os dados importados
      setData(importedData);

      // Registrar atividade de importação
      if (user && user.id) {
        const activity = createActivity(
          'system',
          user.id,
          'data_imported',
          'Dados importados do arquivo JSON',
          null,
          { timestamp: new Date().toISOString() }
        );
        
        // Adicionar a atividade aos dados importados
        setData(prevData => ({
          ...prevData,
          activities: {
            ...prevData.activities,
            [activity.id]: activity
          }
        }));
      }

      // Fechar o modal após importação bem-sucedida
      setIsDataManagerOpen(false);
      
    } catch (error) {
      console.error('Erro ao processar dados importados:', error);
      throw error; // Re-throw para que o componente DataManager possa lidar com o erro
    }
  };

  const moveCard = (cardId, sourceColumnId, targetColumnId) => {
    if (sourceColumnId === targetColumnId) return;

    console.log(`Moving card ${cardId} from ${sourceColumnId} to ${targetColumnId}`);

    setData(prevData => {
      const newData = { ...prevData };
      const movedCard = newData.cards[cardId];
      
      // Verificar se é um card principal (não é subtarefa) ou uma subtarefa
      const isMainCard = !isSubtask(movedCard.category);
      const isSubtaskCard = isSubtask(movedCard.category);
      
      let cardsToMove = [];
      
      if (isMainCard) {
        // Se for um card principal, mover ele e todas as suas subtarefas
        cardsToMove.push(cardId);
        const subtasks = getSubtasks(cardId, newData.cards);
        const subtaskIds = subtasks.map(subtask => subtask.id);
        cardsToMove.push(...subtaskIds);
        
        if (subtaskIds.length > 0) {
          console.log(`Moving parent card with ${subtaskIds.length} subtasks:`, subtaskIds);
        }
      } else if (isSubtaskCard && movedCard.parentId) {
        // Para subtarefas, mover apenas a subtarefa individual
        // Não é necessário mover o card pai junto
        cardsToMove.push(cardId);
        
        console.log(`Moving individual subtask ${cardId} independently from parent`);
      } else {
        // Card sem relações, mover apenas ele
        cardsToMove.push(cardId);
      }
      
      // Remover duplicatas
      cardsToMove = [...new Set(cardsToMove)];
      
      // Atualizar todas as colunas que podem ser afetadas
      const updatedColumns = { ...newData.columns };
      
      // Remover todos os cards (principal + subtarefas) de suas colunas atuais
      Object.keys(updatedColumns).forEach(columnId => {
        const column = updatedColumns[columnId];
        const newCardIds = column.cardIds.filter(id => !cardsToMove.includes(id));
        
        // Só atualizar se houve mudança
        if (newCardIds.length !== column.cardIds.length) {
          updatedColumns[columnId] = {
            ...column,
            cardIds: newCardIds
          };
        }
      });
      
      // Adicionar todos os cards na coluna de destino
      const targetColumn = updatedColumns[targetColumnId];
      updatedColumns[targetColumnId] = {
        ...targetColumn,
        cardIds: [...targetColumn.cardIds, ...cardsToMove]
      };

      return {
        ...newData,
        columns: updatedColumns
      };
    });

    // Registrar atividade de movimentação
    const sourceColumn = data.columns[sourceColumnId];
    const targetColumn = data.columns[targetColumnId];
    addActivity(
      cardId, 
      activityTypes.CARD_MOVED, 
      `Card movido de "${sourceColumn.title}" para "${targetColumn.title}"`,
      { column: sourceColumn.title },
      { column: targetColumn.title }
    );
  };

  const handleAddCard = (columnId) => {
    setSelectedColumn(columnId);
    setIsModalOpen(true);
  };

  const handleCreateCard = (cardData) => {
    const newCardId = `card-${Date.now()}`;
    const newCard = {
      id: newCardId,
      title: cardData.title,
      description: cardData.description,
      priority: cardData.priority,
      category: cardData.category,
      labels: cardData.labels || [],
      assignedUsers: cardData.assignedUsers || [],
      dueDate: cardData.dueDate || null,
      createdAt: cardData.createdAt || new Date().toISOString(),
      completedAt: null,
      isBlocked: false,
      blockReason: ''
    };

    // Adicionar parentId se for subtarefa
    if (cardData.parentId) {
      newCard.parentId = cardData.parentId;
    }

    setData(prevData => ({
      ...prevData,
      cards: {
        ...prevData.cards,
        [newCardId]: newCard,
      },
      columns: {
        ...prevData.columns,
        [selectedColumn]: {
          ...prevData.columns[selectedColumn],
          cardIds: [...prevData.columns[selectedColumn].cardIds, newCardId],
        },
      },
    }));

    setIsModalOpen(false);
    setSelectedColumn(null);

    // Registrar atividade de criação
    addActivity(newCardId, activityTypes.CARD_CREATED, 'Card criado');
  };

  // Função para abrir visualização detalhada do card
  const handleOpenCardDetail = (card) => {
    setSelectedCardForDetail(card);
    setIsCardDetailOpen(true);
  };

  // Função para fechar visualização detalhada do card
  const handleCloseCardDetail = () => {
    setIsCardDetailOpen(false);
    setSelectedCardForDetail(null);
  };

  const handleEditCard = (updatedCard) => {
    const originalCard = data.cards[updatedCard.id];
    
    // Detectar mudanças específicas e registrar atividades
    if (originalCard.title !== updatedCard.title) {
      addActivity(
        updatedCard.id, 
        activityTypes.TITLE_CHANGED, 
        'Título alterado',
        originalCard.title,
        updatedCard.title
      );
    }
    
    if (originalCard.description !== updatedCard.description) {
      addActivity(
        updatedCard.id, 
        activityTypes.DESCRIPTION_CHANGED, 
        'Descrição atualizada'
      );
    }
    
    if (originalCard.priority !== updatedCard.priority) {
      addActivity(
        updatedCard.id, 
        activityTypes.PRIORITY_CHANGED, 
        'Prioridade alterada',
        originalCard.priority,
        updatedCard.priority
      );
    }
    
    if (originalCard.category !== updatedCard.category) {
      addActivity(
        updatedCard.id, 
        activityTypes.CATEGORY_CHANGED, 
        'Categoria alterada',
        originalCard.category,
        updatedCard.category
      );
    }
    
    if (originalCard.dueDate !== updatedCard.dueDate) {
      addActivity(
        updatedCard.id, 
        activityTypes.DUE_DATE_CHANGED, 
        'Data de vencimento alterada',
        originalCard.dueDate,
        updatedCard.dueDate
      );
    }
    
    // Verificar mudanças em labels
    const originalLabels = originalCard.labels || [];
    const newLabels = updatedCard.labels || [];
    if (JSON.stringify(originalLabels.sort()) !== JSON.stringify(newLabels.sort())) {
      addActivity(
        updatedCard.id, 
        activityTypes.LABELS_CHANGED, 
        'Labels atualizadas'
      );
    }
    
    // Verificar mudanças em usuários atribuídos
    const originalUsers = originalCard.assignedUsers || [];
    const newUsers = updatedCard.assignedUsers || [];
    if (JSON.stringify(originalUsers.sort()) !== JSON.stringify(newUsers.sort())) {
      if (newUsers.length > originalUsers.length) {
        addActivity(
          updatedCard.id, 
          activityTypes.USERS_ASSIGNED, 
          'Usuários atribuídos'
        );
      } else if (newUsers.length < originalUsers.length) {
        addActivity(
          updatedCard.id, 
          activityTypes.USERS_UNASSIGNED, 
          'Usuários removidos'
        );
      } else {
        addActivity(
          updatedCard.id, 
          activityTypes.USERS_ASSIGNED, 
          'Atribuição de usuários alterada'
        );
      }
    }
    
    setData(prevData => ({
      ...prevData,
      cards: {
        ...prevData.cards,
        [updatedCard.id]: updatedCard
      }
    }));
  };

  const handleCategoryToggle = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(cat => cat !== category)
        : [...prev, category]
    );
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
  };

  const filterCardsByCategory = (cards) => {
    if (selectedCategories.length === 0) return cards;
    return cards.filter(card => selectedCategories.includes(card.category));
  };

  // Funções para filtros de data
  const getCardsStats = () => {
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

  const handleAddColumn = () => {
    const newColumnId = `column-${Date.now()}`;
    const newColumn = {
      id: newColumnId,
      title: 'Nova Lista',
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

  const handleBlockCard = (card) => {
    setSelectedCardForBlock(card);
    setIsBlockModalOpen(true);
  };

  const blockCard = (cardId, blockReason) => {
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
  };

  const unblockCard = (cardId) => {
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
  };

  const handleManageLabels = () => {
    setIsLabelManagerOpen(true);
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

  // Funções para gerenciar usuários
  const handleManageUsers = () => {
    setIsUserManagerOpen(true);
  };

  const handleUsersChange = (updatedUsers) => {
    setData(prevData => ({
      ...prevData,
      users: updatedUsers
    }));
  };

  // Funções de gerenciamento de temas
  const handleManageThemes = () => {
    setIsThemeSelectorOpen(true);
  };

  // Funções para histórico de atividades
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

  // Funções para comentários
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
      user.id,
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
      const activity = createActivity(
        comment.cardId,
        user.id,
        activityTypes.COMMENT_DELETED,
        'Comentário removido',
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
    const activity = createActivity(
      editedComment.cardId,
      user.id,
      activityTypes.COMMENT_EDITED || 'comment_edited',
      'Comentário editado',
      null,
      { 
        cardTitle: selectedCardForComments?.title || 'Card',
        commentText: editedComment.text.length > 50 ? editedComment.text.substring(0, 50) + '...' : editedComment.text
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

  // Funções para o Team Chat
  const handleOpenTeamChat = () => {
    setIsTeamChatOpen(true);
  };

  const handleCloseTeamChat = () => {
    setIsTeamChatOpen(false);
  };

  const handleSendChatMessage = (message) => {
    setChatMessages(prev => [...prev, message]);
    
    // Adicionar atividade de mensagem no chat
    addActivity(
      'team-chat',
      'chat_message',
      'Nova mensagem no chat da equipe',
      null,
      {
        messageType: message.type,
        hasFile: !!message.file,
        preview: message.content ? (message.content.length > 50 ? 
          message.content.substring(0, 50) + '...' : message.content) : 
          `Enviou ${message.type === 'image' ? 'uma imagem' : 
                   message.type === 'video' ? 'um vídeo' : 
                   message.type === 'audio' ? 'um áudio' : 'um arquivo'}`
      }
    );
  };

  // Função auxiliar para encontrar card em todas as colunas
  const findCardInAllColumns = (cardId) => {
    console.log('Procurando card com ID:', cardId);
    console.log('Dados disponíveis:', data.cards);
    // Buscar diretamente no objeto de cards
    const card = data.cards[cardId];
    if (card) {
      console.log('Card encontrado:', card);
      return card;
    }
    console.log('Card não encontrado');
    return null;
  };

  return (
    <div className="app">
      <Header 
        user={user}
        onManageLabels={handleManageLabels}
        onManageUsers={handleManageUsers}
        onManageThemes={handleManageThemes}
        onViewActivities={handleViewAllActivities}
        onOpenTeamChat={handleOpenTeamChat}
        onManageData={() => setIsDataManagerOpen(true)}
        onLogout={handleLogout}
      />
      <div className="board">
        <div className={`filters-section ${isFiltersMinimized ? 'minimized' : ''} ${(selectedCategories.length > 0 || selectedDateFilters.length > 0) ? 'has-active-filters' : ''}`}>
          <div className="filters-header">
            <h3 className="filters-title">
              {isFiltersMinimized ? 'Filtros' : 'Filtros do Board'}
            </h3>
            <button 
              className="toggle-filters-btn"
              onClick={toggleFilters}
              title={isFiltersMinimized ? 'Expandir filtros' : 'Minimizar filtros'}
            >
              {isFiltersMinimized ? '🔽' : '🔼'}
            </button>
          </div>
          {!isFiltersMinimized && (
            <div className="filters-content">
              <CategoryFilter 
                selectedCategories={selectedCategories}
                onCategoryToggle={handleCategoryToggle}
                onClearAll={handleClearFilters}
              />
              <DueDateFilter
                selectedFilters={selectedDateFilters}
                onFiltersChange={setSelectedDateFilters}
                cardsStats={getCardsStats()}
              />
            </div>
          )}
        </div>
        <div className="board-content">
          {data.columnOrder.map((columnId) => {
            const column = data.columns[columnId];
            const allCards = column.cardIds.map(cardId => data.cards[cardId]);
            
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
                onAddCard={handleAddCard}
                onMoveCard={moveCard}
                onOpenCardDetail={handleOpenCardDetail}
                onBlockCard={handleBlockCard}
                onManageLabels={handleManageLabels}
                onViewActivityLog={handleViewActivityLog}
                onViewComments={handleViewComments}
              />
            );
          })}
          <button className="add-list-button" onClick={handleAddColumn}>
            + Adicionar outra lista
          </button>
        </div>
      </div>

      {isModalOpen && (
        <NewCardModal
          onClose={() => setIsModalOpen(false)}
          onCreateCard={handleCreateCard}
          allCards={data.cards}
          allLabels={data.labels}
          allUsers={data.users}
          onManageLabels={handleManageLabels}
        />
      )}

      {isBlockModalOpen && selectedCardForBlock && (
        <BlockCardModal
          card={selectedCardForBlock}
          onClose={() => {
            setIsBlockModalOpen(false);
            setSelectedCardForBlock(null);
          }}
          onBlockCard={blockCard}
          onUnblockCard={unblockCard}
        />
      )}

      {isLabelManagerOpen && (
        <LabelManager
          labels={data.labels}
          onClose={() => setIsLabelManagerOpen(false)}
          onCreateLabel={createLabel}
          onEditLabel={editLabel}
          onDeleteLabel={deleteLabel}
        />
      )}

      {isUserManagerOpen && (
        <UserManager
          isOpen={isUserManagerOpen}
          users={data.users}
          onClose={() => setIsUserManagerOpen(false)}
          onUsersChange={handleUsersChange}
        />
      )}

      {isThemeSelectorOpen && (
        <ThemeSelector
          isOpen={isThemeSelectorOpen}
          onClose={() => setIsThemeSelectorOpen(false)}
        />
      )}

      {isActivityLogOpen && (
        <ActivityLog
          isOpen={isActivityLogOpen}
          onClose={() => {
            setIsActivityLogOpen(false);
            setActivityLogCardId(null);
          }}
          activities={data.activities}
          users={data.users}
          cards={data.cards}
          cardId={activityLogCardId}
        />
      )}

      {isCommentsModalOpen && selectedCardForComments && (
        <CommentsModal
          isOpen={isCommentsModalOpen}
          onClose={() => {
            console.log('Fechando modal de comentários');
            setIsCommentsModalOpen(false);
            setSelectedCardForComments(null);
          }}
          card={selectedCardForComments}
          comments={comments}
          currentUser={user}
          onAddComment={handleAddComment}
          onDeleteComment={handleDeleteComment}
          onEditComment={handleEditComment}
        />
      )}

      {isCardDetailOpen && selectedCardForDetail && (
        <CardDetailView
          card={selectedCardForDetail}
          allCards={data.cards}
          allLabels={data.labels}
          allUsers={data.users}
          comments={comments}
          currentUser={user}
          onSave={handleEditCard}
          onClose={handleCloseCardDetail}
          onAddComment={handleAddComment}
          onEditComment={handleEditComment}
          onDeleteComment={handleDeleteComment}
          onViewActivityLog={handleViewActivityLog}
          onManageLabels={handleManageLabels}
        />
      )}

      {isTeamChatOpen && (
        <TeamChat
          isOpen={isTeamChatOpen}
          onClose={handleCloseTeamChat}
          currentUser={user}
          allUsers={data.users}
          messages={chatMessages}
          onSendMessage={handleSendChatMessage}
        />
      )}

      {isDataManagerOpen && (
        <DataManager
          isOpen={isDataManagerOpen}
          onClose={() => setIsDataManagerOpen(false)}
          data={data}
          onImportData={handleImportData}
          user={user}
        />
      )}
    </div>
  );
}

const AppWithTheme = () => {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
};

export default AppWithTheme;
