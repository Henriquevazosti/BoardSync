import React, { useState } from 'react';
import Header from './components/Header/Header';
import Column from './components/Column/Column';
import NewCardModal from './components/NewCardModal/NewCardModal';
import CategoryFilter from './components/CategoryFilter/CategoryFilter';
import { initialData } from './data/initialData';
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
      
      // Remover card da coluna de origem
      const sourceColumn = newData.columns[sourceColumnId];
      const newSourceCardIds = sourceColumn.cardIds.filter(id => id !== cardId);
      
      // Adicionar card à coluna de destino
      const targetColumn = newData.columns[targetColumnId];
      const newTargetCardIds = [...targetColumn.cardIds, cardId];

      return {
        ...newData,
        columns: {
          ...newData.columns,
          [sourceColumnId]: {
            ...sourceColumn,
            cardIds: newSourceCardIds
          },
          [targetColumnId]: {
            ...targetColumn,
            cardIds: newTargetCardIds
          }
        }
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
                onAddCard={handleAddCard}
                onMoveCard={moveCard}
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
        />
      )}
    </div>
  );
}

export default App;
