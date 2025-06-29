import React, { useState } from 'react';
import './Comments.css';

const Comments = ({ cardId, comments = [], onAddComment, currentUser, onDeleteComment }) => {
  const [newComment, setNewComment] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newComment.trim() && currentUser) {
      const comment = {
        id: Date.now().toString(),
        text: newComment.trim(),
        author: currentUser,
        timestamp: new Date().toISOString(),
        cardId: cardId
      };
      onAddComment(comment);
      setNewComment('');
      setIsAddingComment(false);
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
              <div className="comment-text">
                {comment.text}
              </div>
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
            <textarea
              className="comment-input"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Escreva seu comentário..."
              rows="3"
              autoFocus
            />
          </div>
          <div className="comment-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => {
                setNewComment('');
                setIsAddingComment(false);
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={!newComment.trim()}
            >
              Comentar
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Comments;
