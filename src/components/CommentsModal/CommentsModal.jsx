import React from 'react';
import Comments from '../Comments/Comments';
import './CommentsModal.css';

const CommentsModal = ({ 
  isOpen, 
  onClose, 
  card, 
  comments, 
  currentUser, 
  onAddComment, 
  onDeleteComment 
}) => {
  if (!isOpen || !card) return null;

  const cardComments = comments.filter(comment => comment.cardId === card.id);

  return (
    <div className="comments-modal-overlay" onClick={onClose}>
      <div className="comments-modal" onClick={e => e.stopPropagation()}>
        <div className="comments-modal-header">
          <div className="modal-title-section">
            <h3 className="modal-title">Comentários do Card</h3>
            <div className="card-info">
              <span className="card-title-preview">{card.title}</span>
              <span className="card-id-preview">#{card.id}</span>
            </div>
          </div>
          <button className="close-modal-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="comments-modal-content">
          <Comments
            cardId={card.id}
            comments={cardComments}
            currentUser={currentUser}
            onAddComment={onAddComment}
            onDeleteComment={onDeleteComment}
          />
        </div>
      </div>
    </div>
  );
};

export default CommentsModal;
