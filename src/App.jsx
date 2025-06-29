import React, { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/Header/Header';
import Column from './components/Column/Column';
import NewCardModal from './components/NewCardModal/NewCardModal';
import CategoryFilter from './components/CategoryFilter/CategoryFilter';
import BlockCardModal from './components/BlockCardModal/BlockCardModal';
import LabelManager from './components/LabelManager/LabelManager';
import UserManager from './components/UserManager/UserManager';
import ThemeSelector from './components/ThemeSelector/ThemeSelector';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import { initialData, getSubtasks, isSubtask } from './data/initialData';
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
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [selectedCardForBlock, setSelectedCardForBlock] = useState(null);
  const [isLabelManagerOpen, setIsLabelManagerOpen] = useState(false);
  const [isUserManagerOpen, setIsUserManagerOpen] = useState(false);
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState(false);

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
    setIsBlockModalOpen(false);
    setSelectedCardForBlock(null);
    setIsLabelManagerOpen(false);
    setIsUserManagerOpen(false);
    setIsThemeSelectorOpen(false);
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
        // Se for uma subtarefa, mover o card pai e todas as subtarefas relacionadas
        const parentId = movedCard.parentId;
        cardsToMove.push(parentId);
        
        // Obter todas as subtarefas do mesmo pai
        const allSubtasks = getSubtasks(parentId, newData.cards);
        const allSubtaskIds = allSubtasks.map(subtask => subtask.id);
        cardsToMove.push(...allSubtaskIds);
        
        console.log(`Moving subtask triggered parent move. Moving parent ${parentId} with all ${allSubtaskIds.length} subtasks`);
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
  };

  const handleEditCard = (updatedCard) => {
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

  return (
    <div className="app">
      <Header 
        user={user}
        onManageLabels={handleManageLabels}
        onManageUsers={handleManageUsers}
        onManageThemes={handleManageThemes}
        onLogout={handleLogout}
      />
      <div className="board">
        <CategoryFilter 
          selectedCategories={selectedCategories}
          onCategoryToggle={handleCategoryToggle}
          onClearAll={handleClearFilters}
        />
        <div className="board-content">
          {data.columnOrder.map((columnId) => {
            const column = data.columns[columnId];
            const allCards = column.cardIds.map(cardId => data.cards[cardId]);
            const filteredCards = filterCardsByCategory(allCards);

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
                onEditCard={handleEditCard}
                onBlockCard={handleBlockCard}
                onManageLabels={handleManageLabels}
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
