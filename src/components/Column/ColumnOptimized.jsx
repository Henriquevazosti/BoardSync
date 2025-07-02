import React, { memo, useMemo, useCallback } from 'react';
import Card from '../Card/Card';
import './ColumnVirtualized.css';

const Column = memo(({ 
  column, 
  cards, 
  onAddCard, 
  onEditCard, 
  onDeleteCard, 
  onMoveCard,
  onBlockCard,
  onUnblockCard,
  onViewComments,
  onViewActivityLog,
  currentUser,
  allLabels,
  allUsers
}) => {
  console.log(`🔄 Renderizando coluna: ${column.title}`);
  
  // Memoizar a verificação se pode adicionar cards
  const canAddCard = useMemo(() => {
    return currentUser && (
      currentUser.role === 'admin' || 
      currentUser.role === 'manager' || 
      !column.restricted
    );
  }, [currentUser, column.restricted]);

  // Memoizar os handlers com useCallback
  const handleAddCard = useCallback(() => {
    if (canAddCard) {
      onAddCard(column.id);
    }
  }, [canAddCard, onAddCard, column.id]);

  const handleCardEdit = useCallback((cardId, updates) => {
    onEditCard(cardId, updates);
  }, [onEditCard]);

  const handleCardDelete = useCallback((cardId) => {
    onDeleteCard(cardId);
  }, [onDeleteCard]);

  const handleCardMove = useCallback((cardId, sourceColumnId, destinationColumnId, destinationIndex) => {
    onMoveCard(cardId, sourceColumnId, destinationColumnId, destinationIndex);
  }, [onMoveCard]);

  const handleCardBlock = useCallback((card) => {
    onBlockCard(card);
  }, [onBlockCard]);

  const handleCardUnblock = useCallback((cardId) => {
    onUnblockCard(cardId);
  }, [onUnblockCard]);

  const handleViewComments = useCallback((card) => {
    onViewComments(card);
  }, [onViewComments]);

  const handleViewActivityLog = useCallback((cardId) => {
    onViewActivityLog(cardId);
  }, [onViewActivityLog]);

  // Memoizar estatísticas da coluna
  const columnStats = useMemo(() => {
    const total = cards.length;
    const completed = cards.filter(card => card.completed).length;
    const blocked = cards.filter(card => card.blocked).length;
    const overdue = cards.filter(card => 
      card.dueDate && new Date(card.dueDate) < new Date() && !card.completed
    ).length;

    return { total, completed, blocked, overdue };
  }, [cards]);

  // Memoizar a lista de cards renderizados
  const renderedCards = useMemo(() => {
    return cards.map((card, index) => (
      <Card
        key={card.id}
        card={card}
        index={index}
        onEdit={handleCardEdit}
        onDelete={handleCardDelete}
        onMove={handleCardMove}
        onBlock={handleCardBlock}
        onUnblock={handleCardUnblock}
        onViewComments={handleViewComments}
        onViewActivityLog={handleViewActivityLog}
        currentUser={currentUser}
        allLabels={allLabels}
        allUsers={allUsers}
      />
    ));
  }, [
    cards, 
    handleCardEdit, 
    handleCardDelete, 
    handleCardMove, 
    handleCardBlock, 
    handleCardUnblock,
    handleViewComments,
    handleViewActivityLog,
    currentUser, 
    allLabels, 
    allUsers
  ]);

  return (
    <div className={`column ${column.color}`}>
      <div className="column-header">
        <div className="column-title-section">
          <h3 className="column-title">{column.title}</h3>
          <div className="column-stats">
            <span className="card-count">{columnStats.total}</span>
            {columnStats.completed > 0 && (
              <span className="completed-count" title="Concluídos">
                ✅ {columnStats.completed}
              </span>
            )}
            {columnStats.blocked > 0 && (
              <span className="blocked-count" title="Bloqueados">
                🚫 {columnStats.blocked}
              </span>
            )}
            {columnStats.overdue > 0 && (
              <span className="overdue-count" title="Vencidos">
                ⚠️ {columnStats.overdue}
              </span>
            )}
          </div>
        </div>
        {canAddCard && (
          <button 
            className="add-card-btn" 
            onClick={handleAddCard}
            title="Adicionar novo card"
          >
            +
          </button>
        )}
      </div>
      
      <div className="cards-container">
        {renderedCards}
        
        {cards.length === 0 && (
          <div className="empty-column">
            <p>Nenhum card ainda</p>
            {canAddCard && (
              <button 
                className="add-first-card-btn" 
                onClick={handleAddCard}
              >
                + Adicionar primeiro card
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

Column.displayName = 'Column';

export default Column;
