import React, { useState, useRef } from 'react';
import './DescriptionEditor.css';

const DescriptionEditor = ({ value, onChange, placeholder = "Descreva os detalhes..." }) => {
  const [dragOver, setDragOver] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Função para inserir texto na posição do cursor
  const insertAtCursor = (text) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newValue = value.substring(0, start) + text + value.substring(end);
    
    onChange(newValue);
    
    // Restaurar foco e posição do cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  // Função para processar imagens
  const processImage = (file) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target.result;
      const imageMarkdown = `\n![${file.name}](${imageData})\n`;
      insertAtCursor(imageMarkdown);
    };
    reader.readAsDataURL(file);
  };

  // Handlers para drag and drop
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        processImage(file);
      }
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  // Handler para seleção de arquivo
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(processImage);
    e.target.value = ''; // Limpar input
  };

  // Handler para colar imagens (Ctrl+V)
  const handlePaste = (e) => {
    const items = Array.from(e.clipboardData?.items || []);
    
    items.forEach(item => {
      if (item.type.startsWith('image/')) {
        e.preventDefault(); // Prevenir o comportamento padrão
        const file = item.getAsFile();
        if (file) {
          processImage(file);
        }
      }
    });
  };

  // Função para inserir imagem via botão
  const insertImage = () => {
    fileInputRef.current?.click();
  };

  // Função para renderizar preview - VERSÃO LIMPA E PROFISSIONAL
  const renderPreview = () => {
    if (!value) return null;

    // Verificar se há imagens
    const hasImages = value.includes('![') && value.includes('data:image');

    if (!hasImages) {
      // Apenas texto - renderização simples
      return (
        <div style={{ 
          color: 'var(--color-textPrimary)', 
          lineHeight: '1.6', 
          whiteSpace: 'pre-wrap',
          fontSize: '14px'
        }}>
          {value}
        </div>
      );
    }

    // Tem imagens - processar e renderizar de forma limpa
    const lines = value.split('\n');
    const elements = [];

    lines.forEach((line, index) => {
      if (line.includes('![') && line.includes('data:image')) {
        // Esta linha contém uma imagem - renderizar apenas a imagem
        const imageMatch = line.match(/!\[([^\]]*)\]\((data:image[^)]+)\)/);
        if (imageMatch) {
          const [, alt, src] = imageMatch;
          
          elements.push(
            <div key={index} style={{ 
              margin: '16px 0', 
              textAlign: 'center'
            }}>
              <img 
                src={src}
                alt={alt || 'Imagem'}
                style={{
                  maxWidth: '100%',
                  maxHeight: '300px',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              />
              {alt && (
                <div style={{ 
                  marginTop: '8px', 
                  fontSize: '12px', 
                  color: 'var(--color-textSecondary)',
                  fontStyle: 'italic'
                }}>
                  {alt}
                </div>
              )}
            </div>
          );
        }
      } else if (line.trim()) {
        // Texto normal - renderizar sem destaque
        elements.push(
          <div key={index} style={{ 
            marginBottom: '8px', 
            color: 'var(--color-textPrimary)',
            lineHeight: '1.6'
          }}>
            {line}
          </div>
        );
      } else {
        // Linha vazia
        elements.push(<br key={index} />);
      }
    });

    return <div style={{ fontSize: '14px' }}>{elements}</div>;
  };

  return (
    <div className="description-editor">
      <div className="editor-toolbar">
        <button
          type="button"
          className="toolbar-btn"
          onClick={insertImage}
          title="Inserir imagem"
        >
          🖼️ Imagem
        </button>
        <span className="toolbar-divider">|</span>
        <button
          type="button"
          className="toolbar-btn"
          onClick={() => insertAtCursor('**Texto em negrito**')}
          title="Negrito"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          className="toolbar-btn"
          onClick={() => insertAtCursor('*Texto em itálico*')}
          title="Itálico"
        >
          <em>I</em>
        </button>
        <span className="toolbar-divider">|</span>
        <div className="toolbar-tip">
          <span className="tip-icon">💡</span>
          <span className="tip-text">Ctrl+V para colar imagens</span>
        </div>
      </div>

      <div
        className={`editor-container ${dragOver ? 'drag-over' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onPaste={handlePaste}
          placeholder={`${placeholder}\n\nDica: Arraste imagens aqui, use Ctrl+V para colar, ou use o botão 🖼️ para inserir imagens!\nNo preview, as imagens serão renderizadas visualmente.`}
          rows="6"
          className="editor-textarea"
          style={{
            fontFamily: 'Monaco, Consolas, "Courier New", monospace',
            fontSize: '13px'
          }}
        />
        
        {dragOver && (
          <div className="drop-overlay">
            <div className="drop-message">
              📷 Solte as imagens aqui para inserir na descrição
            </div>
          </div>
        )}
      </div>

      {value && (
        <div className="preview-section">
          <div className="preview-header">
            <span>�️ Preview Visual:</span>
          </div>
          <div className="preview-container">
            {renderPreview()}
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default DescriptionEditor;
