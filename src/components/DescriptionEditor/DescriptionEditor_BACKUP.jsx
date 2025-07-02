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

  // Função SIMPLIFICADA para renderizar preview
  const renderPreview = () => {
    if (!value) return null;

    console.log('🔍 PREVIEW - Conteúdo:', value.substring(0, 100));
    
    // Verificar se há imagens
    const hasImages = value.includes('![') && value.includes('data:image');
    console.log('🖼️ PREVIEW - Tem imagens?', hasImages);

    if (!hasImages) {
      // Apenas texto
      return (
        <div style={{ color: '#333', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
          {value}
        </div>
      );
    }

    // Tem imagens - renderizar linha por linha
    const lines = value.split('\n');
    const elements = [];

    lines.forEach((line, index) => {
      if (line.includes('![') && line.includes('data:image')) {
        console.log('🖼️ PREVIEW - Linha com imagem:', line.substring(0, 50));
        
        // Encontrar a imagem na linha
        const imageMatch = line.match(/!\[([^\]]*)\]\((data:image[^)]+)\)/);
        if (imageMatch) {
          const [, alt, src] = imageMatch;
          console.log('✅ PREVIEW - Renderizando imagem');
          
          elements.push(
            <div key={index} style={{ 
              margin: '20px 0', 
              textAlign: 'center',
              padding: '15px',
              backgroundColor: '#e8f5e8',
              borderRadius: '12px',
              border: '3px solid #28a745'
            }}>
              <div style={{ 
                color: '#28a745', 
                fontWeight: 'bold', 
                marginBottom: '15px',
                fontSize: '14px'
              }}>
                ✅ IMAGEM RENDERIZADA NO PREVIEW
              </div>
              <img 
                src={src}
                alt={alt || 'Imagem'}
                style={{
                  maxWidth: '100%',
                  maxHeight: '250px',
                  borderRadius: '12px',
                  border: '3px solid #007bff',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
                  transition: 'transform 0.2s ease'
                }}
                onLoad={() => console.log('✅ IMAGEM CARREGADA NO PREVIEW!')}
                onError={() => console.log('❌ ERRO AO CARREGAR IMAGEM NO PREVIEW')}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              />
              {alt && (
                <div style={{ 
                  marginTop: '10px', 
                  fontSize: '12px', 
                  color: '#666',
                  fontStyle: 'italic'
                }}>
                  {alt}
                </div>
              )}
            </div>
          );
        }
      } else if (line.trim()) {
        // Texto normal
        elements.push(
          <div key={index} style={{ marginBottom: '8px', color: '#333' }}>
            {line}
          </div>
        );
      } else {
        // Linha vazia
        elements.push(<br key={index} />);
      }
    });

    return <div>{elements}</div>;
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
          placeholder={`${placeholder}\n\nDica: Arraste imagens aqui, use Ctrl+V para colar, ou use o botão 🖼️ para inserir imagens diretamente no texto!`}
          rows="6"
          className="editor-textarea"
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
            <span>📖 Preview:</span>
          </div>
          <div className="preview-container" style={{ 
            backgroundColor: '#f8f9fa',
            border: '2px solid #007bff',
            borderRadius: '8px',
            padding: '15px'
          }}>
            <div style={{ 
              color: '#007bff', 
              fontWeight: 'bold', 
              marginBottom: '10px',
              fontSize: '13px'
            }}>
              🔍 PREVIEW DEBUG ATIVO - {value.includes('data:image') ? 'IMAGENS DETECTADAS' : 'APENAS TEXTO'}
            </div>
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
