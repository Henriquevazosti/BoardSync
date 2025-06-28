import React, { useState } from 'react';
import Header from './components/Header/Header';
import Column from './components/Column/Column';
import NewCardModal from './components/NewCardModal/NewCardModal';
import { columns as initialColumns } from './data/initialCards';
import './App.css';

function App() {
  const [columns, setColumns] = useState(initialColumns);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState(null);

  const handleAddCard = (columnId) => {
    setSelectedColumnId(columnId);
    setIsModalOpen(true);
  };

  const handleSaveCard = (cardData) => {
    const newCard = {
      id: Date.now(),
      title: cardData.title,
      description: cardData.description,
      priority: cardData.priority,
      status: cardData.columnId
    };

    setColumns(prevColumns => 
      prevColumns.map(column => 
        column.id === cardData.columnId
          ? { ...column, cards: [...column.cards, newCard] }
          : column
      )
    );
  };

  return (
    <div className="App">
      <Header />
      <main className="main-content">
        <div className="board-container">
          {columns.map(column => (
            <Column
              key={column.id}
              title={column.title}
              cards={column.cards}
              onAddCard={() => handleAddCard(column.id)}
            />
          ))}
          <div className="add-list-container">
            <button className="add-list-button">
              + Adicionar outra lista
            </button>
          </div>
        </div>
      </main>
      <NewCardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCard}
        columnId={selectedColumnId}
      />
    </div>
  );
}

export default App;
