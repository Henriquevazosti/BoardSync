import React, { useState, useEffect } from 'react';
import { 
  categoryConfig, 
  isSubtask, 
  getParentCard, 
  getSubtasks, 
  getCardLabels, 
  getCardAssignedUsers,
  formatDate,
  getDueDateStatus
} from '../../data/initialData';
import Comments from '../Comments/Comments';
import DescriptionEditor from '../DescriptionEditor/DescriptionEditor';
import './CardDetailView.css';

const CardDetailView = ({ 
  card, 
  allCards, 
  allLabels, 
  allUsers, 
  comments,
  currentUser,
  onSave, 
  onClose,
  onAddComment,
  onEditComment,
  onDeleteComment,
  onViewActivityLog,
  onManageLabels
}) => {
  const [editedCard, setEditedCard] = useState({
    title: card.title,
    description: card.description || '',
    priority: card.priority,
    category: card.category,
    labels: card.labels || [],
    assignedUsers: card.assignedUsers || [],
    dueDate: card.dueDate || null
  });

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);

  const getCategoryInfo = (category) => {
    return categoryConfig[category] || categoryConfig.atividade;
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'alta': return 'priority-high';
      case 'media': return 'priority-medium';
      case 'baixa': return 'priority-low';
      default: return '';
    }
  };

  const isCardSubtask = isSubtask(card.category);
  const parentCard = isCardSubtask ? getParentCard(card.id, allCards) : null;
  const subtasks = !isCardSubtask ? getSubtasks(card.id, allCards) : [];
  const cardLabels = getCardLabels(card, allLabels || {});
  const assignedUsers = getCardAssignedUsers(card, allUsers || {});
  const dueDateStatus = getDueDateStatus(card.dueDate);
  const cardComments = comments.filter(comment => comment.cardId === card.id);

  const handleSave = () => {
    const updatedCard = {
      ...card,
      ...editedCard,
      title: editedCard.title.trim(),
      description: editedCard.description.trim()
    };
    onSave(updatedCard);
  };

  const handleTitleSave = () => {
    if (editedCard.title.trim() !== card.title) {
      handleSave();
    }
    setIsEditingTitle(false);
  };

  // Função para renderizar descrição com imagens
  const renderDescription = (description) => {
    if (!description) return 'Adicione uma descrição mais detalhada...';

    // Limpar HTML que pode ter escapado do editor
    let cleanDescription = description;
    
    // Se contém HTML do editor, extrair apenas o conteúdo útil
    if (cleanDescription.includes('<div class="editor-image-container"')) {
      // Converter HTML do editor de volta para markdown temporariamente
      cleanDescription = cleanDescription.replace(
        /<div class="editor-image-container"[^>]*><img src="([^"]*)" alt="([^"]*)"[^>]*><button[^>]*>×<\/button><\/div>/g,
        '![$2]($1)'
      );
      // Limpar outras tags HTML
      cleanDescription = cleanDescription.replace(/<[^>]*>/g, '');
    }

    // Dividir o texto em partes usando regex para capturar imagens
    const imageRegex = /!\[([^\]]*)\]\((data:image[^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    // Encontrar todas as imagens e criar array de partes
    while ((match = imageRegex.exec(cleanDescription)) !== null) {
      // Adicionar texto antes da imagem
      if (match.index > lastIndex) {
        const textBefore = cleanDescription.substring(lastIndex, match.index);
        if (textBefore.trim()) {
          parts.push({
            type: 'text',
            content: textBefore
          });
        }
      }

      // Adicionar a imagem
      parts.push({
        type: 'image',
        alt: match[1] || 'Imagem',
        src: match[2]
      });

      lastIndex = match.index + match[0].length;
    }

    // Adicionar texto restante
    if (lastIndex < cleanDescription.length) {
      const textAfter = cleanDescription.substring(lastIndex);
      if (textAfter.trim()) {
        parts.push({
          type: 'text',
          content: textAfter
        });
      }
    }

    // Se não há imagens, mostrar apenas o texto
    if (parts.length === 0) {
      return (
        <div className="description-text">
          {cleanDescription.split('\n').map((line, i) => (
            <div key={i}>
              {line || <br />}
            </div>
          ))}
        </div>
      );
    }

    // Renderizar as partes
    return (
      <div className="description-content">
        {parts.map((part, index) => {
          if (part.type === 'text') {
            return (
              <div key={`text-${index}`} className="description-text">
                {part.content.split('\n').map((line, lineIndex) => (
                  <div key={lineIndex}>
                    {line || <br />}
                  </div>
                ))}
              </div>
            );
          } else if (part.type === 'image') {
            return (
              <div key={`img-${index}`} className="description-image">
                <img 
                  src={part.src} 
                  alt={part.alt}
                  className="description-img"
                />
                {part.alt && (
                  <div className="description-image-caption">
                    {part.alt}
                  </div>
                )}
              </div>
            );
          }
          return null;
        })}
      </div>
    );
  };

  const handleDescriptionSave = () => {
    if (editedCard.description.trim() !== (card.description || '')) {
      handleSave();
    }
    setIsEditingDescription(false);
  };

  // Auto-save quando outros campos mudarem
  useEffect(() => {
    if (editedCard.priority !== card.priority ||
        editedCard.category !== card.category ||
        JSON.stringify(editedCard.labels) !== JSON.stringify(card.labels || []) ||
        JSON.stringify(editedCard.assignedUsers) !== JSON.stringify(card.assignedUsers || []) ||
        editedCard.dueDate !== card.dueDate) {
      handleSave();
    }
  }, [editedCard.priority, editedCard.category, editedCard.labels, editedCard.assignedUsers, editedCard.dueDate]);

  return (
    <div className="card-detail-overlay" onClick={onClose}>
      <div className="card-detail-container" onClick={e => e.stopPropagation()}>
        
        {/* Header da página */}
        <div className="card-detail-header">
          <div className="card-detail-breadcrumb">
            <div className="category-info">
              <span className="category-icon">{getCategoryInfo(card.category).icon}</span>
              <span className="category-name">{getCategoryInfo(card.category).name}</span>
            </div>
            {isCardSubtask && parentCard && (
              <>
                <span className="breadcrumb-separator">{'>'}</span>
                <span className="parent-card-link">
                  {getCategoryInfo(parentCard.category).icon} {parentCard.title}
                </span>
              </>
            )}
          </div>
          <button className="close-detail-btn" onClick={onClose} title="Fechar (Esc)">
            ✕
          </button>
        </div>

        <div className="card-detail-content">
          {/* Coluna principal */}
          <div className="card-detail-main">
            
            {/* Título */}
            <div className="card-title-section">
              {isEditingTitle ? (
                <textarea
                  className="card-title-edit"
                  value={editedCard.title}
                  onChange={(e) => setEditedCard(prev => ({ ...prev, title: e.target.value }))}
                  onBlur={handleTitleSave}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleTitleSave();
                    }
                    if (e.key === 'Escape') {
                      setEditedCard(prev => ({ ...prev, title: card.title }));
                      setIsEditingTitle(false);
                    }
                  }}
                  autoFocus
                  rows="1"
                />
              ) : (
                <h1 
                  className="card-title-display"
                  onClick={() => setIsEditingTitle(true)}
                  title="Clique para editar"
                >
                  {editedCard.title}
                </h1>
              )}
            </div>

            {/* Informações do card */}
            <div className="card-info-grid">
              <div className="card-info-item">
                <span className="info-label">ID:</span>
                <span className="info-value">#{card.id}</span>
              </div>
              
              {card.createdAt && (
                <div className="card-info-item">
                  <span className="info-label">Criado em:</span>
                  <span className="info-value">{formatDate(card.createdAt)}</span>
                </div>
              )}

              {card.completedAt && (
                <div className="card-info-item">
                  <span className="info-label">Concluído em:</span>
                  <span className="info-value">{formatDate(card.completedAt)}</span>
                </div>
              )}
            </div>

            {/* Descrição */}
            <div className="card-description-section">
              <div className="section-header">
                <h3>📝 Descrição</h3>
                {!isEditingDescription && (
                  <button 
                    className="edit-btn-small"
                    onClick={() => setIsEditingDescription(true)}
                  >
                    Editar
                  </button>
                )}
              </div>
              
              {isEditingDescription ? (
                <div className="description-edit-container">
                  <DescriptionEditor
                    value={editedCard.description}
                    onChange={(newDescription) => setEditedCard(prev => ({ ...prev, description: newDescription }))}
                    placeholder="Adicione uma descrição mais detalhada..."
                  />
                  <div className="card-detail-edit-actions">
                    <button 
                      className="card-detail-save-btn"
                      onClick={handleDescriptionSave}
                    >
                      Salvar
                    </button>
                    <button 
                      className="card-detail-cancel-btn"
                      onClick={() => {
                        setEditedCard(prev => ({ ...prev, description: card.description || '' }));
                        setIsEditingDescription(false);
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  className={`card-description-display ${!editedCard.description ? 'empty' : ''}`}
                  onClick={() => setIsEditingDescription(true)}
                >
                  {renderDescription(editedCard.description)}
                </div>
              )}
            </div>

            {/* Subtarefas */}
            {subtasks.length > 0 && (
              <div className="card-subtasks-section">
                <div className="section-header">
                  <h3>📎 Subtarefas ({subtasks.length})</h3>
                </div>
                <div className="subtasks-list">
                  {subtasks.map(subtask => (
                    <div key={subtask.id} className="subtask-item">
                      <div className="subtask-category">
                        <span className="category-icon">{getCategoryInfo(subtask.category).icon}</span>
                        <span className="category-name">{getCategoryInfo(subtask.category).name}</span>
                      </div>
                      <span className="subtask-title">{subtask.title}</span>
                      <span className={`priority-badge ${getPriorityClass(subtask.priority)}`}>
                        {subtask.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comentários */}
            <div className="card-comments-section">
              <div className="section-header">
                <h3>💬 Comentários ({cardComments.length})</h3>
              </div>
              <Comments
                cardId={card.id}
                comments={cardComments}
                currentUser={currentUser}
                onAddComment={onAddComment}
                onEditComment={onEditComment}
                onDeleteComment={onDeleteComment}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="card-detail-sidebar">
            <div className="sidebar-section">
              <h4>Ações</h4>
              <div className="action-buttons">
                <button 
                  className="action-btn"
                  onClick={() => onViewActivityLog(card.id)}
                >
                  📋 Atividades
                </button>
                <button className="action-btn">
                  📎 Anexos
                </button>
                <button className="action-btn">
                  🔗 Copiar link
                </button>
              </div>
            </div>

            {/* Prioridade */}
            <div className="sidebar-section">
              <h4>Prioridade</h4>
              <div className="priority-selector">
                {['baixa', 'media', 'alta'].map(priority => (
                  <button
                    key={priority}
                    className={`priority-option ${editedCard.priority === priority ? 'active' : ''} priority-${priority}`}
                    onClick={() => setEditedCard(prev => ({ ...prev, priority }))}
                  >
                    {priority === 'baixa' && '🟢 Baixa'}
                    {priority === 'media' && '🟡 Média'}
                    {priority === 'alta' && '🔴 Alta'}
                  </button>
                ))}
              </div>
            </div>

            {/* Labels */}
            {cardLabels.length > 0 && (
              <div className="sidebar-section">
                <h4>Labels</h4>
                <div className="card-labels-display">
                  {cardLabels.map((label) => (
                    <span
                      key={label.id}
                      className="card-label-detailed"
                      style={{
                        backgroundColor: label.bgColor,
                        color: label.color,
                        borderColor: label.color
                      }}
                    >
                      {label.name}
                    </span>
                  ))}
                </div>
                <button 
                  className="manage-btn"
                  onClick={onManageLabels}
                >
                  Gerenciar labels
                </button>
              </div>
            )}

            {/* Usuários atribuídos */}
            {assignedUsers.length > 0 && (
              <div className="sidebar-section">
                <h4>Atribuído a</h4>
                <div className="assigned-users-detailed">
                  {assignedUsers.map((user) => (
                    <div key={user.id} className="user-item-detailed">
                      <div
                        className="user-avatar-detailed"
                        style={{
                          backgroundColor: user.bgColor,
                          color: user.color,
                          border: `2px solid ${user.color}`
                        }}
                      >
                        {user.avatar}
                      </div>
                      <div className="user-info">
                        <span className="user-name">{user.name}</span>
                        <span className="user-email">{user.email}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Data de vencimento */}
            {card.dueDate && (
              <div className="sidebar-section">
                <h4>Data de vencimento</h4>
                <div className={`due-date-detailed ${dueDateStatus}`}>
                  <span className="due-date-icon">📅</span>
                  <span className="due-date-text">{formatDate(card.dueDate)}</span>
                  {dueDateStatus === 'overdue' && <span className="status-indicator">Atrasado</span>}
                  {dueDateStatus === 'due-today' && <span className="status-indicator">Hoje</span>}
                  {dueDateStatus === 'due-soon' && <span className="status-indicator">Em breve</span>}
                </div>
              </div>
            )}

            {/* Bloqueio */}
            {card.isBlocked && (
              <div className="sidebar-section">
                <h4>Status</h4>
                <div className="block-status">
                  <div className="block-indicator">
                    <span className="block-icon">🚫</span>
                    <span className="block-text">Bloqueado</span>
                  </div>
                  {card.blockReason && (
                    <div className="block-reason">
                      <strong>Motivo:</strong> {card.blockReason}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardDetailView;
