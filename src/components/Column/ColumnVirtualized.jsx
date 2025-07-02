import React, { memo, useCallback, useMemo } from 'react';
import Card from '../Card/Card';
import VirtualList from '../VirtualList/VirtualList';
import './ColumnVirtualized.css';

const VIRTUAL_THRESHOLD = 20; // Usar virtualização quando há mais de 20 cards

const ColumnVirtualized = memo(({ 
  column, 
  cards, 
  totalCards, 
  allCards, 
  allLabels, 
  allUsers, 
  onAddCard, 
  onMoveCard, 
  onOpenCardDetail, 
  onBlockCard, 
  onManageLabels, 
  onViewActivityLog, 
  onViewComments 
}) => {
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    console.log('📍 Arrastando sobre a coluna:', column.title);
    e.dataTransfer.dropEffect = 'move';
    
    // Adicionar classe visual
    const columnContent = e.currentTarget.querySelector('.column-content');
    if (columnContent) {
      columnContent.classList.add('drag-over');
    }
  }, [column.title]);

  const handleDragLeave = useCallback((e) => {
    console.log('🚪 Saindo da coluna:', column.title);
    
    // Remover classe visual
    const columnContent = e.currentTarget.querySelector('.column-content');
    if (columnContent) {
      columnContent.classList.remove('drag-over');
    }
  }, [column.title]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    console.log('🎯 Soltando card na coluna:', column.title);
    
    // Obter dados do card
    const cardId = e.dataTransfer.getData('cardId');
    const sourceColumn = e.dataTransfer.getData('sourceColumn');
    
    console.log('📦 Dados recebidos:', { cardId, sourceColumn, targetColumn: column.id });
    
    // Remover classe visual
    const columnContent = e.currentTarget.querySelector('.column-content');
    if (columnContent) {
      columnContent.classList.remove('drag-over');
    }
    
    // Mover o card se for de colunas diferentes
    if (sourceColumn && cardId && sourceColumn !== column.id) {
      console.log('✨ Movendo card de', sourceColumn, 'para', column.id);
      onMoveCard(cardId, sourceColumn, column.id);
    } else {
      console.log('❌ Movimento cancelado - mesma coluna ou dados inválidos');
    }
  }, [column.id, column.title, onMoveCard]);

  const handleAddCard = useCallback(() => {
    onAddCard(column.id);
  }, [column.id, onAddCard]);

  // Renderizar um card individual
  const renderCard = useCallback((card, index) => (
    <Card
      key={card.id}
      card={card}
      columnId={column.id}
      allCards={allCards}
      allLabels={allLabels}
      allUsers={allUsers}
      onOpenCardDetail={onOpenCardDetail}
      onBlockCard={onBlockCard}
      onManageLabels={onManageLabels}
      onViewActivityLog={onViewActivityLog}
      onViewComments={onViewComments}
    />
  ), [
    column.id,
    allCards,
    allLabels,
    allUsers,
    onOpenCardDetail,
    onBlockCard,
    onManageLabels,
    onViewActivityLog,
    onViewComments
  ]);

  // Memoizar contadores
  const { filteredCount, hasFilter, shouldUseVirtual } = useMemo(() => {
    const filtered = cards.length;
    const hasFilterActive = filtered !== totalCards;
    const useVirtual = filtered > VIRTUAL_THRESHOLD;
    
    return {
      filteredCount: filtered,
      hasFilter: hasFilterActive,
      shouldUseVirtual: useVirtual
    };
  }, [cards.length, totalCards]);

  // Renderizar conteúdo dos cards
  const renderCardsContent = useCallback(() => {
    if (cards.length === 0) {
      return (
        <div className="empty-column">
          <p>{hasFilter ? 'Nenhum card corresponde ao filtro' : 'Solte cards aqui'}</p>
        </div>
      );
    }

    if (shouldUseVirtual) {
      return (
        <VirtualList
          items={cards}
          itemHeight={120} // Altura estimada de um card
          containerHeight={400} // Altura máxima da área de cards
          renderItem={renderCard}
          className="virtual-cards-list"
          overscan={5} // Renderizar 5 itens extras para scroll suave
        />
      );
    }

    return cards.map(renderCard);
  }, [cards, hasFilter, shouldUseVirtual, renderCard]);

  return (
    <div 
      className="column"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="column-header">
        <h3 className="column-title">{column.title}</h3>
        <div className="column-counts">
          {hasFilter && (
            <>
              <span className="filtered-count">{filteredCount}</span>
              <span className="count-separator">/</span>
            </>
          )}
          <span className="total-count">{totalCards}</span>
          {shouldUseVirtual && (
            <span className="virtual-indicator" title="Lista virtualizada para melhor performance">⚡</span>
          )}
        </div>
      </div>

      <div className={`column-content ${shouldUseVirtual ? 'virtualized' : ''}`}>
        {renderCardsContent()}
      </div>

      <button
        className="add-card-button"
        onClick={handleAddCard}
      >
        + Adicionar um cartão
      </button>
    </div>
  );
});

ColumnVirtualized.displayName = 'ColumnVirtualized';

export default ColumnVirtualized;
