import React, { useState, useRef, useEffect } from 'react';
import './DescriptionEditor.css';

const DescriptionEditor = ({ value, onChange, placeholder = "Descreva os detalhes..." }) => {
  const [dragOver, setDragOver] = useState(false);
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);

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
      
      // Inserir a imagem diretamente no editor
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      
      // Criar elemento de imagem
      const imgContainer = document.createElement('div');
      imgContainer.className = 'editor-image-container';
      imgContainer.style.cssText = `
        margin: 12px 0;
        text-align: center;
        position: relative;
        display: block;
      `;
      
      const img = document.createElement('img');
      img.src = imageData;
      img.alt = file.name;
      img.style.cssText = `
        max-width: 100%;
        max-height: 300px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        cursor: pointer;
        transition: transform 0.2s ease;
      `;
      
      // Botão de remoção
      const removeBtn = document.createElement('button');
      removeBtn.innerHTML = '×';
      removeBtn.className = 'remove-image-btn';
      removeBtn.style.cssText = `
        position: absolute;
        top: 8px;
        right: 8px;
        background: rgba(220, 53, 69, 0.9);
        color: white;
        border: none;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        display: none;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
      `;
      
      // Mostrar botão no hover
      imgContainer.addEventListener('mouseenter', () => {
        removeBtn.style.display = 'flex';
      });
      imgContainer.addEventListener('mouseleave', () => {
        removeBtn.style.display = 'none';
      });
      
      // Remover imagem ao clicar no botão
      removeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        imgContainer.remove();
        updateContent();
      });
      
      imgContainer.appendChild(img);
      imgContainer.appendChild(removeBtn);
      
      // Inserir no range atual
      range.insertNode(imgContainer);
      range.collapse(false);
      
      // Atualizar o conteúdo
      updateContent();
    };
    reader.readAsDataURL(file);
  };

  // Função para atualizar o conteúdo
  const updateContent = () => {
    const editor = editorRef.current;
    if (editor) {
      // Converter o HTML do editor para markdown-like para o value
      const content = editor.innerHTML;
      onChange(content);
    }
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

  // Renderizar o conteúdo no editor
  const renderEditorContent = () => {
    if (!value) return '';
    
    // Se o value contém imagens em markdown, converter para HTML
    if (value.includes('![') && value.includes('data:image')) {
      return value.replace(
        /!\[([^\]]*)\]\((data:image[^)]+)\)/g,
        (match, alt, src) => `
          <div class="editor-image-container" style="margin: 12px 0; text-align: center; position: relative; display: block;">
            <img src="${src}" alt="${alt}" style="max-width: 100%; max-height: 300px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); cursor: pointer; transition: transform 0.2s ease;" />
            <button class="remove-image-btn" style="position: absolute; top: 8px; right: 8px; background: rgba(220, 53, 69, 0.9); color: white; border: none; border-radius: 50%; width: 24px; height: 24px; font-size: 16px; font-weight: bold; cursor: pointer; display: none; align-items: center; justify-content: center;">×</button>
          </div>
        `
      );
    }
    
    return value;
  };

  // Effect para sincronizar o conteúdo do editor
  useEffect(() => {
    const editor = editorRef.current;
    if (editor && editor.innerHTML !== renderEditorContent()) {
      editor.innerHTML = renderEditorContent();
    }
  }, [value]);

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
          onClick={() => {
            const selection = window.getSelection();
            const range = selection.getRangeAt(0);
            const strong = document.createElement('strong');
            strong.textContent = 'Texto em negrito';
            range.insertNode(strong);
            updateContent();
          }}
          title="Negrito"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          className="toolbar-btn"
          onClick={() => {
            const selection = window.getSelection();
            const range = selection.getRangeAt(0);
            const em = document.createElement('em');
            em.textContent = 'Texto em itálico';
            range.insertNode(em);
            updateContent();
          }}
          title="Itálico"
        >
          <em>I</em>
        </button>
        <span className="toolbar-divider">|</span>
        <div className="toolbar-tip">
          <span className="tip-icon">💡</span>
          <span className="tip-text">Ctrl+V para colar imagens - aparecerão visualmente!</span>
        </div>
      </div>

      <div
        className={`editor-container ${dragOver ? 'drag-over' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div
          ref={editorRef}
          contentEditable
          onInput={updateContent}
          onPaste={handlePaste}
          className="visual-editor"
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
            wordWrap: 'break-word'
          }}
          suppressContentEditableWarning={true}
          dangerouslySetInnerHTML={{ __html: renderEditorContent() }}
        />
        
        {!value && (
          <div 
            className="editor-placeholder"
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              color: 'var(--color-textSecondary)',
              pointerEvents: 'none',
              fontSize: '14px'
            }}
          >
            {placeholder}
            <br />
            <small>Dica: Arraste imagens aqui, use Ctrl+V para colar, ou clique no botão 🖼️!</small>
          </div>
        )}
        
        {dragOver && (
          <div className="drop-overlay">
            <div className="drop-message">
              📷 Solte as imagens aqui - elas aparecerão visualmente!
            </div>
          </div>
        )}
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
