import React, { useState } from 'react';
import './BlockCardModal.css';

const BlockCardModal = ({ card, onClose, onBlockCard, onUnblockCard }) => {
  const [blockReason, setBlockReason] = useState(card.blockReason || '');
  
  const handleBlock = (e) => {
    e.preventDefault();
    if (blockReason.trim()) {
      onBlockCard(card.id, blockReason.trim());
      onClose();
    }
  };

  const handleUnblock = () => {
    onUnblockCard(card.id);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content block-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            {card.isBlocked ? '🚫 Card Bloqueado' : '🚫 Bloquear Card'}
          </h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="card-info">
          <h3 className="card-title-preview">{card.title}</h3>
          <p className="card-desc-preview">{card.description}</p>
        </div>

        {card.isBlocked ? (
          <div className="block-status">
            <div className="current-block-reason">
              <label>Motivo atual do bloqueio:</label>
              <div className="reason-display">{card.blockReason}</div>
            </div>
            
            <div className="modal-actions">
              <button 
                type="button" 
                onClick={onClose} 
                className="btn-cancel"
              >
                Fechar
              </button>
              <button 
                type="button" 
                onClick={handleUnblock} 
                className="btn-unblock"
              >
                🔓 Desbloquear Card
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleBlock}>
            <div className="form-group">
              <label htmlFor="blockReason">
                Motivo do bloqueio <span className="required">*</span>
              </label>
              <textarea
                id="blockReason"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                rows="4"
                placeholder="Descreva o motivo do bloqueio (ex: aguardando aprovação, dependência externa, problemas técnicos...)"
                required
                autoFocus
              />
              <small className="help-text">
                Explique claramente o que está impedindo o progresso deste card
              </small>
            </div>
            
            <div className="modal-actions">
              <button 
                type="button" 
                onClick={onClose} 
                className="btn-cancel"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn-block"
                disabled={!blockReason.trim()}
              >
                🚫 Bloquear Card
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default BlockCardModal;
