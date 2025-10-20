import React, { useState } from 'react';
import './MediaViewer.css';

const MediaViewer = ({ attachments = [], compact = false }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentMedia, setCurrentMedia] = useState(null);

  if (!attachments || attachments.length === 0) {
    return null;
  }

  const openLightbox = (attachment) => {
    setCurrentMedia(attachment);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setCurrentMedia(null);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const downloadFile = (attachment) => {
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className={`media-viewer ${compact ? 'compact' : ''}`}>
        <div className="attachments-grid">
          {attachments.map((attachment, index) => (
            <div key={attachment.id || index} className="attachment-item">
              {attachment.type === 'image' && (
                <div 
                  className="image-attachment"
                  onClick={() => openLightbox(attachment)}
                >
                  <img 
                    src={attachment.url} 
                    alt={attachment.name}
                    loading="lazy"
                  />
                  <div className="attachment-overlay">
                    <span className="view-icon">🔍</span>
                  </div>
                </div>
              )}

              {attachment.type === 'video' && (
                <div className="video-attachment">
                  <video 
                    src={attachment.url}
                    controls
                    preload="metadata"
                    className="video-player"
                  >
                    Seu navegador não suporta vídeo.
                  </video>
                  <div className="attachment-info">
                    <span className="attachment-name" title={attachment.name}>
                      {attachment.name}
                    </span>
                    <span className="attachment-size">
                      {formatFileSize(attachment.size)}
                    </span>
                  </div>
                </div>
              )}

              {attachment.type === 'document' && (
                <div className="document-attachment">
                  <div className="document-preview">
                    <div className="document-icon">📄</div>
                    <div className="document-info">
                      <span className="attachment-name" title={attachment.name}>
                        {attachment.name}
                      </span>
                      <span className="attachment-size">
                        {formatFileSize(attachment.size)}
                      </span>
                    </div>
                  </div>
                  <div className="document-actions">
                    <button
                      className="download-btn"
                      onClick={() => downloadFile(attachment)}
                      title="Baixar arquivo"
                    >
                      ⬇️
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox para visualização de imagens */}
      {lightboxOpen && currentMedia && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="lightbox-close"
              onClick={closeLightbox}
              title="Fechar"
            >
              ×
            </button>
            
            {currentMedia.type === 'image' && (
              <>
                <img 
                  src={currentMedia.url} 
                  alt={currentMedia.name}
                  className="lightbox-image"
                />
                <div className="lightbox-info">
                  <span className="lightbox-name">{currentMedia.name}</span>
                  <span className="lightbox-size">{formatFileSize(currentMedia.size)}</span>
                </div>
              </>
            )}
            
            <div className="lightbox-actions">
              <button
                className="download-btn-lightbox"
                onClick={() => downloadFile(currentMedia)}
                title="Baixar arquivo"
              >
                ⬇️ Baixar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MediaViewer;
