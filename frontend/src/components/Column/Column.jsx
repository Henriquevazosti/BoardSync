import React, { useState, useRef, useEffect } from 'react';
import Card from '../Card/Card';
import './Column.css';

const Column = ({ column, cards, totalCards, allCards, allLabels, allUsers, totalColumns, onAddCard, onMoveCard, onOpenCardDetail, onBlockCard, onManageLabels, onViewActivityLog, onViewComments, onEditColumn, onDeleteColumn }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(column.title);
  const [showActions, setShowActions] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Fechar menu de ações quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showActions && !event.target.closest('.column-title-section')) {
        setShowActions(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showActions]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditValue(column.title);
  };

  const handleSave = () => {
    const trimmedValue = editValue.trim();
    if (trimmedValue && trimmedValue !== column.title) {
      onEditColumn(column.id, trimmedValue);
    }
    setIsEditing(false);
    setShowActions(false);
  };

  const handleCancel = () => {
    setEditValue(column.title);
    setIsEditing(false);
    setShowActions(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleDelete = () => {
    if (totalColumns <= 1) {
      alert('Não é possível excluir a última lista. O board deve ter pelo menos uma lista.');
      return;
    }

    if (cards.length > 0) {
      if (confirm(`A lista "${column.title}" contém ${cards.length} card(s). Tem certeza que deseja excluí-la? Os cards serão movidos para a primeira lista.`)) {
        onDeleteColumn(column.id);
      }
    } else {
      if (confirm(`Tem certeza que deseja excluir a lista "${column.title}"?`)) {
        onDeleteColumn(column.id);
      }
    }
    setShowActions(false);
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    console.log('📍 Column.handleDragOver: Arrastando sobre a coluna:', column.title);
    e.dataTransfer.dropEffect = 'move';
    
    // Adicionar classe visual de forma segura
    const columnContent = e.currentTarget.querySelector('.column-content');
    if (columnContent) {
      columnContent.classList.add('drag-over');
    }
  };

  const handleDragLeave = (e) => {
    console.log('🚪 Column.handleDragLeave: Saindo da coluna:', column.title);
    
    // Verificar se realmente saiu da coluna (não apenas de um filho)
    if (!e.currentTarget.contains(e.relatedTarget)) {
      const columnContent = e.currentTarget.querySelector('.column-content');
      if (columnContent) {
        columnContent.classList.remove('drag-over');
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    console.log('🎯 Column.handleDrop: Tentando soltar card na coluna:', column.title);
    
    // Remover classe visual
    const columnContent = e.currentTarget.querySelector('.column-content');
    if (columnContent) {
      columnContent.classList.remove('drag-over');
    }
    
    try {
      // Obter dados do card de múltiplas formas (compatibilidade)
      let cardId = e.dataTransfer.getData('cardId') || e.dataTransfer.getData('text/plain');
      let sourceColumn = e.dataTransfer.getData('sourceColumn');
      
      console.log('📦 Column.handleDrop: Dados brutos recebidos:', {
        cardId,
        sourceColumn,
        targetColumn: column.id,
        dataTransferTypes: Array.from(e.dataTransfer.types)
      });
      
      // Validações
      if (!cardId) {
        console.error('❌ Column.handleDrop: cardId não encontrado');
        return;
      }
      
      if (!sourceColumn) {
        console.error('❌ Column.handleDrop: sourceColumn não encontrado');
        return;
      }
      
      if (!column.id) {
        console.error('❌ Column.handleDrop: targetColumn inválido');
        return;
      }
      
      // Verificar se é movimento válido
      if (sourceColumn === column.id) {
        console.log('ℹ️ Column.handleDrop: Movimento na mesma coluna, cancelado');
        return;
      }
      
      console.log('✨ Column.handleDrop: Iniciando movimento do card', {
        cardId,
        from: sourceColumn,
        to: column.id
      });
      
      // Executar movimento
      if (onMoveCard && typeof onMoveCard === 'function') {
        const destinationIndex = cards.length;
        onMoveCard(cardId, sourceColumn, column.id, destinationIndex);
        console.log('✅ Column.handleDrop: Movimento executado com sucesso');
      } else {
        console.error('❌ Column.handleDrop: onMoveCard não é uma função válida');
      }
      
    } catch (error) {
      console.error('❌ Column.handleDrop: Erro durante o drop', error);
    }
  };

  const filteredCount = cards.length;
  const hasFilter = filteredCount !== totalCards;

  return (
    <div 
      className="column"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      data-column-id={column.id}
      data-column-title={column.title}
    >
      <div className="column-header">
        <div className="column-title-section">
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              className="column-title-input"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSave}
              maxLength={50}
            />
          ) : (
            <>
              <h3 className="column-title">{column.title}</h3>
              <button
                className="column-actions-toggle"
                onClick={() => setShowActions(!showActions)}
                title="Opções da lista"
              >
                ⋯
              </button>
              {showActions && (
                <div className="column-actions-menu">
                  <button 
                    className="column-action-btn edit-btn"
                    onClick={handleEdit}
                  >
                    ✏️ Editar
                  </button>
                  {totalColumns > 1 && (
                    <button 
                      className="column-action-btn delete-btn"
                      onClick={handleDelete}
                    >
                      🗑️ Excluir
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
        <div className="column-counts">
          {hasFilter && (
            <>
              <span className="filtered-count">{filteredCount}</span>
              <span className="count-separator">/</span>
            </>
          )}
          <span className="total-count">{totalCards}</span>
        </div>
      </div>

      <div className="column-content">
        {cards.map((card) => (
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
        ))}
        
        {cards.length === 0 && (
          <div className="empty-column">
            <p>{hasFilter ? 'Nenhum card corresponde ao filtro' : 'Solte cards aqui'}</p>
          </div>
        )}
      </div>

      <button
        className="add-card-button"
        onClick={() => onAddCard(column.id)}
      >
        + Adicionar um cartão
      </button>
    </div>
  );
};

export default Column;
