import React, { useState } from 'react';
import MediaUpload from '../MediaUpload/MediaUpload';
import MediaViewer from '../MediaViewer/MediaViewer';
import CommentHistory from '../CommentHistory/CommentHistory';
import './Comments.css';

const Comments = ({ cardId, comments = [], onAddComment, currentUser, onDeleteComment, onEditComment }) => {
  // Log para depuração do usuário recebido
  React.useEffect(() => {
    console.log('Comments.jsx: Usuário recebido:', currentUser);
  }, [currentUser]);
  const [newComment, setNewComment] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedText, setEditedText] = useState('');
  const [editedFiles, setEditedFiles] = useState([]);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedCommentForHistory, setSelectedCommentForHistory] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Validação básica
    if (!currentUser) {
      alert('Usuário não identificado. Faça login novamente.');
      return;
    }
    if (!newComment.trim() && selectedFiles.length === 0) {
      alert('Digite um comentário ou envie um arquivo.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Simula upload de arquivos (mock)
      const attachments = selectedFiles.map(file => ({
        id: file.id || Date.now().toString(),
        name: file.name,
        size: file.size,
        type: file.type,
        mimeType: file.mimeType,
        url: file.url,
        uploadDate: new Date().toISOString()
      }));

      const comment = {
        id: Date.now().toString(),
        text: newComment.trim(),
        author: currentUser,
        timestamp: new Date().toISOString(),
        cardId,
        attachments: attachments.length > 0 ? attachments : undefined
      };

      console.log('Enviando comentário:', comment);
      if (typeof onAddComment === 'function') {
        onAddComment(comment);
        alert('Comentário enviado com sucesso!');
      } else {
        alert('Função de adicionar comentário não está disponível.');
      }
      setNewComment('');
      setSelectedFiles([]);
      setIsAddingComment(false);
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      alert('Erro ao adicionar comentário. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`;
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canDeleteComment = (comment) => {
    return currentUser && (currentUser.id === comment.author.id || currentUser.role === 'admin');
  };

  const canEditComment = (comment) => {
    return currentUser && currentUser.id === comment.author.id;
  };

  const startEditingComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditedText(comment.text || '');
    // Converter URLs dos anexos existentes para o formato esperado pelo MediaUpload
    if (comment.attachments && comment.attachments.length > 0) {
      const existingFiles = comment.attachments.map(attachment => ({
        ...attachment,
        isExisting: true // Flag para identificar arquivos já existentes
      }));
      setEditedFiles(existingFiles);
    } else {
      setEditedFiles([]);
    }
  };

  const cancelEditingComment = () => {
    setEditingCommentId(null);
    setEditedText('');
    setEditedFiles([]);
  };

  const saveEditedComment = async () => {
    const commentToEdit = comments.find(c => c.id === editingCommentId);
    if (!commentToEdit || isSubmitting) return;

    if (!editedText.trim() && editedFiles.length === 0) {
      alert('Comentário não pode ficar vazio');
      return;
    }

    setIsSubmitting(true);

    try {
      // Processar anexos (separar existentes dos novos)
      const existingAttachments = editedFiles.filter(file => file.isExisting);
      const newAttachments = editedFiles
        .filter(file => !file.isExisting)
        .map(file => ({
          id: file.id,
          name: file.name,
          size: file.size,
          type: file.type,
          mimeType: file.mimeType,
          url: file.url,
          uploadDate: new Date().toISOString()
        }));

      const allAttachments = [...existingAttachments, ...newAttachments];

      const editedComment = {
        ...commentToEdit,
        text: editedText.trim(),
        attachments: allAttachments.length > 0 ? allAttachments : undefined,
        editedAt: new Date().toISOString(),
        editHistory: [
          ...(commentToEdit.editHistory || []),
          {
            id: Date.now().toString(),
            previousText: commentToEdit.text,
            previousAttachments: commentToEdit.attachments,
            editedAt: new Date().toISOString(),
            editedBy: currentUser
          }
        ]
      };

      if (onEditComment) {
        onEditComment(editedComment);
      }

      cancelEditingComment();
    } catch (error) {
      console.error('Erro ao editar comentário:', error);
      alert('Erro ao editar comentário. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditFilesSelected = (files) => {
    setEditedFiles(prev => [...prev, ...files]);
  };

  const handleEditRemoveFile = (fileId) => {
    setEditedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const openHistoryModal = (comment) => {
    setSelectedCommentForHistory(comment);
    setHistoryModalOpen(true);
  };

  const closeHistoryModal = () => {
    setHistoryModalOpen(false);
    setSelectedCommentForHistory(null);
  };

  const handleFilesSelected = (files) => {
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleRemoveFile = (fileId) => {
    setSelectedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const handleCancelComment = () => {
    setNewComment('');
    setSelectedFiles([]);
    setIsAddingComment(false);
  };

  return (
    <div className="comments-section">
      <div className="comments-header">
        <h4 className="comments-title">
          💬 Comentários ({comments.length})
        </h4>
        {!isAddingComment && (
          <button
            className="add-comment-btn"
            onClick={() => setIsAddingComment(true)}
            title="Adicionar comentário"
          >
            + Comentar
          </button>
        )}
      </div>

      <div className="comments-list">
        {comments.length === 0 ? (
          <div className="no-comments">
            <p>Nenhum comentário ainda.</p>
            <p>Seja o primeiro a comentar!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="comment-item">
              <div className="comment-header">
                <div className="comment-author">
                  <div
                    className="author-avatar"
                    style={{
                      backgroundColor: comment.author.bgColor,
                      color: comment.author.color
                    }}
                  >
                    {comment.author.avatar}
                  </div>
                  <div className="author-info">
                    <span className="author-name">{comment.author.name}</span>
                    <span className="comment-timestamp">
                      {formatTimestamp(comment.timestamp)}
                    </span>
                  </div>
                </div>
                <div className="comment-actions-buttons">
                  {canEditComment(comment) && editingCommentId !== comment.id && (
                    <button
                      className="edit-comment-btn"
                      onClick={() => startEditingComment(comment)}
                      title="Editar comentário"
                    >
                      ✏️
                    </button>
                  )}
                  {canDeleteComment(comment) && (
                    <button
                      className="delete-comment-btn"
                      onClick={() => onDeleteComment(comment.id)}
                      title="Excluir comentário"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
              
              {editingCommentId === comment.id ? (
                // Formulário de edição
                <div className="edit-comment-form">
                  <div className="edit-input-container">
                    <textarea
                      className="edit-comment-input"
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                      placeholder="Edite seu comentário..."
                      rows="3"
                      disabled={isSubmitting}
                    />
                    
                    {/* Upload de mídia para edição */}
                    <MediaUpload
                      onFilesSelected={handleEditFilesSelected}
                      selectedFiles={editedFiles}
                      onRemoveFile={handleEditRemoveFile}
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div className="edit-comment-actions">
                    <button
                      type="button"
                      className="btn-cancel-edit"
                      onClick={cancelEditingComment}
                      disabled={isSubmitting}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="btn-save-edit"
                      onClick={saveEditedComment}
                      disabled={(!editedText.trim() && editedFiles.length === 0) || isSubmitting}
                    >
                      {isSubmitting ? 'Salvando...' : 'Salvar'}
                    </button>
                  </div>
                </div>
              ) : (
                // Exibição normal do comentário
                <>
                  <div className="comment-text">
                    {comment.text}
                    {comment.editedAt && (
                      <span className="edited-indicator-wrapper">
                        <span 
                          className="edited-indicator clickable" 
                          title={`Editado em ${formatTimestamp(comment.editedAt)}`}
                          onClick={() => openHistoryModal(comment)}
                        >
                          (editado)
                        </span>
                      </span>
                    )}
                  </div>
                  
                  {/* Exibir anexos de mídia */}
                  {comment.attachments && comment.attachments.length > 0 && (
                    <MediaViewer 
                      attachments={comment.attachments} 
                      compact={true}
                    />
                  )}
                </>
              )}
            </div>
          ))
        )}
      </div>

      {isAddingComment && (
        <form className="add-comment-form" onSubmit={handleSubmit}>
          <div className="comment-input-wrapper">
            <div
              className="current-user-avatar"
              style={{
                backgroundColor: currentUser?.bgColor,
                color: currentUser?.color
              }}
            >
              {currentUser?.avatar}
            </div>
            <div className="comment-input-container">
              <textarea
                className="comment-input"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escreva seu comentário..."
                rows="3"
                autoFocus
                disabled={isSubmitting}
              />
              
              {/* Upload de mídia */}
              <MediaUpload
                onFilesSelected={handleFilesSelected}
                selectedFiles={selectedFiles}
                onRemoveFile={handleRemoveFile}
                disabled={isSubmitting}
              />
            </div>
          </div>
          
          <div className="comment-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={handleCancelComment}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={(!newComment.trim() && selectedFiles.length === 0) || isSubmitting}
            >
              {isSubmitting ? 'Enviando...' : 'Comentar'}
            </button>
          </div>
        </form>
      )}
      
      {/* Modal de histórico de edições */}
      <CommentHistory
        isOpen={historyModalOpen}
        onClose={closeHistoryModal}
        comment={selectedCommentForHistory}
        currentUser={currentUser}
      />
    </div>
  );
};

export default Comments;
