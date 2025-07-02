import React, { useRef, useCallback } from 'react';
import './TextEditor.css';

const TextEditor = ({ 
  value, 
  onChange, 
  onAddAttachment, 
  placeholder = "Escreva aqui...",
  readOnly = false,
  attachments = [] // Adicionar anexos como prop
}) => {
  const textareaRef = useRef(null);

  // Handler para mudanças no textarea
  const handleTextChange = useCallback((e) => {
    if (onChange) {
      onChange(e.target.value);
    }
  }, [onChange]);

  // Handler para colar imagens
  const handlePaste = useCallback((e) => {
    if (readOnly) return;
    
    const items = e.clipboardData.items;
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      if (item.type.indexOf('image') !== -1) {
        e.preventDefault();
        
        const file = item.getAsFile();
        if (file) {
          // Criar nome único para imagem colada
          const timestamp = new Date().getTime();
          const extension = file.type.split('/')[1] || 'png';
          const uniqueName = `imagem_colada_${timestamp}.${extension}`;
          
          // Criar novo arquivo com nome único
          const renamedFile = new File([file], uniqueName, { type: file.type });
          
          // Inserir marcação de imagem no texto
          const imageMarkup = `\n[IMAGEM: ${uniqueName}]\n`;
          
          if (textareaRef.current) {
            const start = textareaRef.current.selectionStart;
            const end = textareaRef.current.selectionEnd;
            const currentValue = textareaRef.current.value;
            
            const newValue = currentValue.slice(0, start) + imageMarkup + currentValue.slice(end);
            
            if (onChange) {
              onChange(newValue);
            }
            
            // Mover cursor para depois da imagem
            setTimeout(() => {
              const newCursorPosition = start + imageMarkup.length;
              textareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
              textareaRef.current.focus();
            }, 0);
          }
          
          // Adicionar ao array de anexos se callback fornecido
          if (onAddAttachment) {
            onAddAttachment(renamedFile);
          }
          
          console.log('✅ Imagem colada e anexada:', uniqueName);
        }
        break;
      }
    }
  }, [readOnly, onChange, onAddAttachment]);

  // Handler para upload de imagem via botão
  const handleImageUpload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        // Inserir marcação de imagem no texto
        const imageMarkup = `\n[IMAGEM: ${file.name}]\n`;
        const currentValue = value || '';
        
        if (onChange) {
          onChange(currentValue + imageMarkup);
        }
        
        if (onAddAttachment) {
          onAddAttachment(file);
        }
      }
    };
    input.click();
  }, [value, onChange, onAddAttachment]);

  // Função para renderizar texto com imagens (para visualização)
  const renderContent = (text, attachments = []) => {
    if (!text) return null;
    
    return text.split('\n').map((line, index) => {
      // Verificar se a linha é uma marcação de imagem
      const imageMatch = line.match(/^\[IMAGEM: ([^\]]+)\]$/);
      if (imageMatch) {
        const imageName = imageMatch[1];
        
        // Procurar o arquivo correspondente nos anexos
        const imageFile = attachments.find(file => file.name === imageName);
        
        if (imageFile) {
          // Se temos o arquivo, criar URL e mostrar imagem real
          const imageUrl = URL.createObjectURL(imageFile);
          return (
            <div key={index} className="image-display">
              <img 
                src={imageUrl} 
                alt={imageName}
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  margin: '10px 0',
                  borderRadius: '6px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.1)'
                }}
                onLoad={() => {
                  // Limpar URL após carregar para evitar memory leaks
                  setTimeout(() => URL.revokeObjectURL(imageUrl), 1000);
                }}
              />
              <div className="image-caption">{imageName}</div>
            </div>
          );
        } else {
          // Se não temos o arquivo, mostrar placeholder
          return (
            <div key={index} className="image-placeholder">
              🖼️ {imageName}
            </div>
          );
        }
      }
      return <div key={index}>{line || '\u00A0'}</div>;
    });
  };

  if (readOnly) {
    return (
      <div className="text-editor-viewer">
        <div className="editor-content readonly">
          {renderContent(value, attachments)}
        </div>
      </div>
    );
  }

  return (
    <div className="text-editor">
      {/* Toolbar */}
      <div className="editor-toolbar">
        <span className="toolbar-info">📝 Editor de texto</span>
        <div className="toolbar-separator"></div>
        <button 
          type="button"
          onClick={handleImageUpload}
          className="toolbar-btn"
          title="Inserir imagem"
        >
          🖼️ Imagem
        </button>
      </div>

      {/* Textarea simples */}
      <textarea
        ref={textareaRef}
        className="editor-textarea"
        value={value || ''}
        onChange={handleTextChange}
        onPaste={handlePaste}
        placeholder={placeholder}
        rows={6}
        dir="ltr"
      />
      
      {/* Preview das imagens */}
      {value && value.includes('[IMAGEM:') && (
        <div className="image-preview">
          <strong>Preview:</strong>
          <div className="preview-content">
            {renderContent(value, attachments)}
          </div>
        </div>
      )}
      
      <div className="editor-help">
        💡 <strong>Dica:</strong> Cole imagens diretamente com Ctrl+V - elas aparecerão como marcações no texto
      </div>
    </div>
  );
};

export default TextEditor;
