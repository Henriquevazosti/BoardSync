import React, { useRef, useState, useCallback } from 'react';
import './SimpleEditor.css';

const SimpleEditor = ({ 
  value, 
  onChange, 
  onAddAttachment, 
  placeholder = "Escreva a descrição... (Cole imagens diretamente aqui com Ctrl+V)",
  readOnly = false
}) => {
  const [isEditing, setIsEditing] = useState(!readOnly);
  const editorRef = useRef(null);

  // Handler para colar imagens
  const handlePaste = useCallback((e) => {
    if (readOnly) return;

    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        
        const file = item.getAsFile();
        if (file) {
          // Criar nome único para imagem colada
          const timestamp = new Date().getTime();
          const extension = file.type.split('/')[1] || 'png';
          const uniqueName = `imagem_colada_${timestamp}.${extension}`;
          
          // Criar novo arquivo com nome único
          const renamedFile = new File([file], uniqueName, { type: file.type });
          
          // Converter para base64 e inserir
          const reader = new FileReader();
          reader.onload = (e) => {
            const imageHtml = `<img src="${e.target.result}" alt="${uniqueName}" style="max-width: 100%; height: auto; margin: 10px 0; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); display: block;" />`;
            
            // Inserir na posição do cursor ou no final
            if (editorRef.current) {
              const selection = window.getSelection();
              if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                range.deleteContents();
                const imgElement = document.createElement('div');
                imgElement.innerHTML = imageHtml;
                range.insertNode(imgElement.firstChild);
                range.collapse(false);
              } else {
                editorRef.current.innerHTML += imageHtml;
              }
              
              // Disparar evento de mudança
              if (onChange) {
                onChange(editorRef.current.innerHTML);
              }
            }
            
            // Adicionar ao array de anexos se callback fornecido
            if (onAddAttachment) {
              onAddAttachment(renamedFile);
            }
          };
          reader.readAsDataURL(file);
        }
        break;
      }
    }
  }, [readOnly, onChange, onAddAttachment]);

  // Handler para mudanças no conteúdo
  const handleInput = useCallback((e) => {
    if (onChange) {
      onChange(e.target.innerHTML);
    }
  }, [onChange]);

  // Handler para upload de imagem via botão
  const handleImageUpload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageHtml = `<img src="${e.target.result}" alt="${file.name}" style="max-width: 100%; height: auto; margin: 10px 0; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); display: block;" />`;
          
          if (editorRef.current) {
            editorRef.current.innerHTML += imageHtml;
            if (onChange) {
              onChange(editorRef.current.innerHTML);
            }
          }
          
          if (onAddAttachment) {
            onAddAttachment(file);
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }, [onChange, onAddAttachment]);

  // Formatação de texto
  const formatText = useCallback((command, value = null) => {
    document.execCommand(command, false, value);
    if (onChange && editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  if (readOnly) {
    return (
      <div className="simple-editor-viewer">
        <div 
          className="editor-content"
          dir="ltr"
          style={{
            direction: 'ltr',
            textAlign: 'left',
            unicodeBidi: 'embed'
          }}
          dangerouslySetInnerHTML={{ __html: value || '' }}
        />
      </div>
    );
  }

  return (
    <div className="simple-editor">
      {/* Toolbar */}
      <div className="editor-toolbar">
        <button 
          type="button"
          onClick={() => formatText('bold')}
          className="toolbar-btn"
          title="Negrito"
        >
          <strong>B</strong>
        </button>
        <button 
          type="button"
          onClick={() => formatText('italic')}
          className="toolbar-btn"
          title="Itálico"
        >
          <em>I</em>
        </button>
        <button 
          type="button"
          onClick={() => formatText('underline')}
          className="toolbar-btn"
          title="Sublinhado"
        >
          <u>U</u>
        </button>
        <div className="toolbar-separator"></div>
        <button 
          type="button"
          onClick={() => formatText('insertUnorderedList')}
          className="toolbar-btn"
          title="Lista"
        >
          • Lista
        </button>
        <button 
          type="button"
          onClick={handleImageUpload}
          className="toolbar-btn"
          title="Inserir imagem"
        >
          🖼️ Imagem
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        className="editor-content"
        contentEditable={!readOnly}
        onInput={handleInput}
        onPaste={handlePaste}
        dangerouslySetInnerHTML={{ __html: value || '' }}
        dir="ltr"
        style={{
          minHeight: '150px',
          padding: '12px',
          border: '1px solid #ddd',
          borderRadius: '0 0 6px 6px',
          outline: 'none',
          fontSize: '14px',
          lineHeight: '1.5',
          direction: 'ltr',
          textAlign: 'left',
          unicodeBidi: 'embed'
        }}
        data-placeholder={!value ? placeholder : ''}
      />
      
      <div className="editor-help">
        💡 <strong>Dica:</strong> Cole imagens diretamente com Ctrl+V ou use o botão de imagem na barra de ferramentas
      </div>
    </div>
  );
};

export default SimpleEditor;
