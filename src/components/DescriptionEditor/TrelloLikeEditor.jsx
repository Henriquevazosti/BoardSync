import React, { useRef, useCallback, useState, useEffect } from 'react';
import './TrelloLikeEditor.css';

const TrelloLikeEditor = ({ 
  value, 
  onChange, 
  onAddAttachment, 
  placeholder = "Escreva aqui...",
  readOnly = false,
  attachments = []
}) => {
  const editorRef = useRef(null);
  const [content, setContent] = useState([]);

  // Converter string em elementos de conteúdo
  useEffect(() => {
    if (!value) {
      setContent([{ type: 'text', content: '' }]);
      return;
    }

    const parts = [];
    const lines = value.split('\n');
    let currentText = '';

    lines.forEach((line, index) => {
      const imageMatch = line.match(/^\[IMAGEM: ([^\]]+)\]$/);
      
      if (imageMatch) {
        // Se há texto acumulado, adicionar como texto
        if (currentText.trim() || currentText.includes('\n')) {
          parts.push({ type: 'text', content: currentText });
          currentText = '';
        }
        
        // Adicionar imagem
        const imageName = imageMatch[1];
        const imageFile = attachments.find(file => file.name === imageName);
        
        parts.push({ 
          type: 'image', 
          fileName: imageName,
          file: imageFile
        });
      } else {
        currentText += line;
        if (index < lines.length - 1) currentText += '\n';
      }
    });

    // Adicionar texto final se houver
    if (currentText || parts.length === 0) {
      parts.push({ type: 'text', content: currentText });
    }

    setContent(parts);
  }, [value, attachments]);

  // Converter elementos de conteúdo de volta para string
  const updateValue = (newContent) => {
    const newValue = newContent.map(item => {
      if (item.type === 'text') {
        return item.content;
      } else if (item.type === 'image') {
        return `[IMAGEM: ${item.fileName}]`;
      }
      return '';
    }).join('\n').replace(/\n\n+/g, '\n');

    if (onChange) {
      onChange(newValue);
    }
  };

  // Handler para mudanças no texto
  const handleTextChange = (index, newText) => {
    const newContent = [...content];
    newContent[index] = { ...newContent[index], content: newText };
    setContent(newContent);
    updateValue(newContent);
  };

  // Handler para colar imagens
  const handlePaste = useCallback((e, textIndex) => {
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
          
          // Inserir imagem na posição atual
          const newContent = [...content];
          
          // Dividir o texto na posição do cursor se necessário
          const currentItem = newContent[textIndex];
          if (currentItem && currentItem.type === 'text') {
            const textarea = e.target;
            const cursorPos = textarea.selectionStart;
            const text = currentItem.content;
            
            const beforeCursor = text.slice(0, cursorPos);
            const afterCursor = text.slice(cursorPos);
            
            // Substituir o item atual pelos novos itens
            newContent.splice(textIndex, 1,
              { type: 'text', content: beforeCursor },
              { type: 'image', fileName: uniqueName, file: renamedFile },
              { type: 'text', content: afterCursor }
            );
          } else {
            // Inserir no final
            newContent.push({ type: 'image', fileName: uniqueName, file: renamedFile });
            newContent.push({ type: 'text', content: '' });
          }
          
          setContent(newContent);
          updateValue(newContent);
          
          // Adicionar ao array de anexos se callback fornecido
          if (onAddAttachment) {
            onAddAttachment(renamedFile);
          }
          
          console.log('✅ Imagem colada inline:', uniqueName);
        }
        break;
      }
    }
  }, [readOnly, content, onChange, onAddAttachment]);

  // Handler para upload de imagem via botão
  const handleImageUpload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        // Adicionar imagem no final
        const newContent = [...content];
        newContent.push({ type: 'image', fileName: file.name, file: file });
        newContent.push({ type: 'text', content: '' });
        
        setContent(newContent);
        updateValue(newContent);
        
        if (onAddAttachment) {
          onAddAttachment(file);
        }
      }
    };
    input.click();
  }, [content, onChange, onAddAttachment]);

  // Renderizar modo somente leitura
  if (readOnly) {
    return (
      <div className="trello-editor-viewer">
        {content.map((item, index) => {
          if (item.type === 'text') {
            return (
              <div key={index} className="text-content">
                {item.content.split('\n').map((line, lineIndex) => (
                  <div key={lineIndex}>{line || '\u00A0'}</div>
                ))}
              </div>
            );
          } else if (item.type === 'image') {
            if (item.file) {
              const imageUrl = URL.createObjectURL(item.file);
              return (
                <div key={index} className="image-content">
                  <img 
                    src={imageUrl} 
                    alt={item.fileName}
                    onLoad={() => {
                      // Limpar URL após carregar
                      setTimeout(() => URL.revokeObjectURL(imageUrl), 1000);
                    }}
                  />
                </div>
              );
            } else {
              return (
                <div key={index} className="image-placeholder">
                  🖼️ {item.fileName}
                </div>
              );
            }
          }
          return null;
        })}
      </div>
    );
  }

  // Renderizar modo editável
  return (
    <div className="trello-editor">
      {/* Toolbar */}
      <div className="editor-toolbar">
        <span className="toolbar-info">📝 Editor estilo Trello</span>
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

      {/* Conteúdo editável */}
      <div ref={editorRef} className="editor-content">
        {content.map((item, index) => {
          if (item.type === 'text') {
            return (
              <textarea
                key={`text-${index}`}
                className="text-input"
                value={item.content}
                onChange={(e) => handleTextChange(index, e.target.value)}
                onPaste={(e) => handlePaste(e, index)}
                placeholder={index === 0 ? placeholder : 'Continue escrevendo...'}
                rows={Math.max(1, item.content.split('\n').length)}
                dir="ltr"
              />
            );
          } else if (item.type === 'image') {
            if (item.file) {
              const imageUrl = URL.createObjectURL(item.file);
              return (
                <div key={`image-${index}`} className="image-content editable">
                  <img 
                    src={imageUrl} 
                    alt={item.fileName}
                    onLoad={() => {
                      // Limpar URL após carregar
                      setTimeout(() => URL.revokeObjectURL(imageUrl), 1000);
                    }}
                  />
                  <div className="image-caption">{item.fileName}</div>
                </div>
              );
            } else {
              return (
                <div key={`image-${index}`} className="image-placeholder">
                  🖼️ {item.fileName}
                </div>
              );
            }
          }
          return null;
        })}
      </div>
      
      <div className="editor-help">
        💡 <strong>Dica:</strong> Cole imagens diretamente com Ctrl+V - elas aparecerão inline no texto!
      </div>
    </div>
  );
};

export default TrelloLikeEditor;
