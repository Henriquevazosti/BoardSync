import React, { useState } from 'react';
import Header from './components/Header/Header';
import Column from './components/Column/Column';
import NewCardModal from './components/NewCardModal/NewCardModal';
import CategoryFilter from './components/CategoryFilter/CategoryFilter';
import { initialData, getSubtasks, isSubtask } from './data/initialData';
import './App.css';

function App() {
  const [data, setData] = useState(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);

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
    };

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

  return (
    <div className="app">
      <Header />
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
                onAddCard={handleAddCard}
                onMoveCard={moveCard}
                onEditCard={handleEditCard}
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
        />
      )}
    </div>
  );
}

export default App;
