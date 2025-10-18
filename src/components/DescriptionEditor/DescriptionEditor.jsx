import React, { useState, useRef, useEffect } from 'react';
import './DescriptionEditor.css';

const DescriptionEditor = ({ value, onChange, placeholder = "Descreva os detalhes..." }) => {
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);

  // Handler para colar imagens (Ctrl+V) - versão simplificada para textarea
  const handlePaste = (e) => {
    const items = Array.from(e.clipboardData?.items || []);
    
    items.forEach(item => {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const imageMarkdown = `![${file.name}](${event.target.result})`;
            const currentValue = value || '';
            const newValue = currentValue + (currentValue ? '\n' : '') + imageMarkdown;
            onChange(newValue);
          };
          reader.readAsDataURL(file);
        }
      }
    });
  };

  // Handler para seleção de arquivo - versão simplificada
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const imageMarkdown = `![${file.name}](${event.target.result})`;
          const currentValue = value || '';
          const newValue = currentValue + (currentValue ? '\n' : '') + imageMarkdown;
          onChange(newValue);
        };
        reader.readAsDataURL(file);
      }
    });
    e.target.value = ''; // Limpar input
  };

  // Handler para foco - garantir direção correta
  const handleFocus = (e) => {
    const editor = e.target;
    editor.style.direction = 'ltr';
    editor.style.textAlign = 'left';
  };

  // Função para inserir imagem via botão
  const insertImage = () => {
    fileInputRef.current?.click();
  };

  // Effect simplificado - não precisa mais de configurações complexas para textarea
  useEffect(() => {
    const editor = editorRef.current;
    if (editor) {
      // Garantir direção correta
      editor.style.direction = 'ltr';
      editor.style.textAlign = 'left';
    }
  }, []);

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
        <div className="toolbar-tip">
          <span className="tip-icon">💡</span>
          <span className="tip-text">Use Ctrl+V para colar imagens!</span>
        </div>
      </div>

      <div className="editor-container">
        <textarea
          ref={editorRef}
          dir="ltr"
          lang="pt-BR"
          spellCheck="true"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          onPaste={handlePaste}
          onFocus={handleFocus}
          className="visual-editor"
          placeholder={placeholder}
          style={{
            minHeight: '150px',
            padding: '12px',
            border: '1px solid var(--color-border)',
            borderRadius: '4px',
            backgroundColor: 'var(--color-background)',
            color: 'var(--color-textPrimary)',
            fontSize: '14px',
            lineHeight: '1.5',
            outline: 'none',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            textAlign: 'left',
            direction: 'ltr',
            resize: 'vertical',
            width: '100%',
            fontFamily: 'inherit'
          }}
        />
      </div>

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
