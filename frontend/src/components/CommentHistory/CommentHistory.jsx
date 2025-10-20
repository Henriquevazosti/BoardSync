import React from 'react';
import './CommentHistory.css';

const CommentHistory = ({ isOpen, onClose, comment, currentUser }) => {
  if (!isOpen || !comment) return null;

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="comment-history-overlay" onClick={onClose}>
      <div className="comment-history-modal" onClick={e => e.stopPropagation()}>
        <div className="comment-history-header">
          <h3 className="history-title">Histórico de Edições</h3>
          <button className="close-history-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="comment-history-content">
          {/* Versão atual */}
          <div className="history-item current">
            <div className="history-header">
              <span className="history-version">Versão Atual</span>
              <span className="history-timestamp">
                {comment.editedAt ? 
                  `Editado em ${formatTimestamp(comment.editedAt)}` : 
                  `Criado em ${formatTimestamp(comment.timestamp)}`
                }
              </span>
            </div>
            <div className="history-content">
              <div className="history-text">
                {comment.text || <em>Sem texto</em>}
              </div>
              {comment.attachments && comment.attachments.length > 0 && (
                <div className="history-attachments">
                  <strong>Anexos ({comment.attachments.length}):</strong>
                  <ul>
                    {comment.attachments.map((attachment, index) => (
                      <li key={attachment.id || index}>
                        {attachment.name} ({attachment.type})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Histórico de versões anteriores */}
          {comment.editHistory && comment.editHistory.length > 0 && (
            <>
              <div className="history-divider">
                <span>Versões Anteriores</span>
              </div>
              
              {comment.editHistory
                .sort((a, b) => new Date(b.editedAt) - new Date(a.editedAt))
                .map((edit, index) => (
                  <div key={edit.id} className="history-item">
                    <div className="history-header">
                      <span className="history-version">
                        Versão #{comment.editHistory.length - index}
                      </span>
                      <span className="history-timestamp">
                        Editado por {edit.editedBy.name} em {formatTimestamp(edit.editedAt)}
                      </span>
                    </div>
                    <div className="history-content">
                      <div className="history-text">
                        {edit.previousText || <em>Sem texto</em>}
                      </div>
                      {edit.previousAttachments && edit.previousAttachments.length > 0 && (
                        <div className="history-attachments">
                          <strong>Anexos ({edit.previousAttachments.length}):</strong>
                          <ul>
                            {edit.previousAttachments.map((attachment, attachIndex) => (
                              <li key={attachment.id || attachIndex}>
                                {attachment.name} ({attachment.type})
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </>
          )}

          {/* Versão original (se não há histórico) */}
          {(!comment.editHistory || comment.editHistory.length === 0) && comment.editedAt && (
            <>
              <div className="history-divider">
                <span>Versão Original</span>
              </div>
              
              <div className="history-item">
                <div className="history-header">
                  <span className="history-version">Versão Original</span>
                  <span className="history-timestamp">
                    Criado em {formatTimestamp(comment.timestamp)}
                  </span>
                </div>
                <div className="history-content">
                  <div className="history-text">
                    <em>Não há registro da versão original</em>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Se não há histórico e não foi editado */}
          {(!comment.editHistory || comment.editHistory.length === 0) && !comment.editedAt && (
            <div className="no-history">
              <p>Este comentário não foi editado ainda.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentHistory;
