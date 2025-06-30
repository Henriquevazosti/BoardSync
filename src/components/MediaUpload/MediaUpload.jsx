import React, { useState, useRef } from 'react';
import './MediaUpload.css';

const MediaUpload = ({ onFilesSelected, selectedFiles = [], onRemoveFile, disabled = false }) => {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Tipos de arquivo aceitos
  const acceptedTypes = {
    image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    video: ['video/mp4', 'video/webm', 'video/avi', 'video/mov'],
    document: ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  };

  const isValidFileType = (file) => {
    const allAcceptedTypes = [
      ...acceptedTypes.image,
      ...acceptedTypes.video,
      ...acceptedTypes.document
    ];
    return allAcceptedTypes.includes(file.type);
  };

  const getFileType = (file) => {
    if (acceptedTypes.image.includes(file.type)) return 'image';
    if (acceptedTypes.video.includes(file.type)) return 'video';
    if (acceptedTypes.document.includes(file.type)) return 'document';
    return 'unknown';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const processFiles = (files) => {
    const fileArray = Array.from(files);
    const validFiles = [];
    const errors = [];

    fileArray.forEach(file => {
      // Verificar tamanho (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        errors.push(`${file.name}: Arquivo muito grande (máximo 10MB)`);
        return;
      }

      // Verificar tipo
      if (!isValidFileType(file)) {
        errors.push(`${file.name}: Tipo de arquivo não suportado`);
        return;
      }

      // Criar preview URL
      const fileData = {
        id: Date.now() + Math.random(),
        file: file,
        name: file.name,
        size: file.size,
        type: getFileType(file),
        mimeType: file.type,
        url: URL.createObjectURL(file),
        uploadProgress: 0
      };

      validFiles.push(fileData);
    });

    if (errors.length > 0) {
      alert('Alguns arquivos não puderam ser adicionados:\n' + errors.join('\n'));
    }

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  };

  const handleFileSelect = (e) => {
    if (disabled) return;
    const files = e.target.files;
    if (files.length > 0) {
      processFiles(files);
    }
    // Limpar input para permitir selecionar o mesmo arquivo novamente
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) {
      setDragOver(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const openFileDialog = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const removeFile = (fileId) => {
    const fileToRemove = selectedFiles.find(f => f.id === fileId);
    if (fileToRemove && fileToRemove.url) {
      URL.revokeObjectURL(fileToRemove.url);
    }
    onRemoveFile(fileId);
  };

  return (
    <div className="media-upload">
      {/* Área de upload */}
      <div
        className={`upload-area ${dragOver ? 'drag-over' : ''} ${disabled ? 'disabled' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,.pdf,.txt,.doc,.docx"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          disabled={disabled}
        />
        
        <div className="upload-content">
          <div className="upload-icon">📎</div>
          <div className="upload-text">
            <p>Clique para selecionar arquivos ou arraste aqui</p>
            <small>Imagens, vídeos, PDFs (máx. 10MB cada)</small>
          </div>
        </div>
      </div>

      {/* Preview dos arquivos selecionados */}
      {selectedFiles.length > 0 && (
        <div className="selected-files">
          <h5>Arquivos anexados ({selectedFiles.length})</h5>
          <div className="files-list">
            {selectedFiles.map(file => (
              <div key={file.id} className="file-preview">
                <div className="file-info">
                  {file.type === 'image' && (
                    <div className="image-preview">
                      <img src={file.url} alt={file.name} />
                    </div>
                  )}
                  {file.type === 'video' && (
                    <div className="video-preview">
                      <video src={file.url} controls={false} muted>
                        Seu navegador não suporta vídeo.
                      </video>
                      <div className="video-overlay">▶️</div>
                    </div>
                  )}
                  {file.type === 'document' && (
                    <div className="document-preview">
                      <div className="document-icon">📄</div>
                    </div>
                  )}
                  
                  <div className="file-details">
                    <span className="file-name" title={file.name}>
                      {file.name.length > 20 ? file.name.substring(0, 20) + '...' : file.name}
                    </span>
                    <span className="file-size">{formatFileSize(file.size)}</span>
                  </div>
                </div>
                
                <button
                  className="remove-file-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(file.id);
                  }}
                  title="Remover arquivo"
                  disabled={disabled}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaUpload;
