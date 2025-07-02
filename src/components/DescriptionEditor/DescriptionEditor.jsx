import React, { useRef, useCallback, useMemo, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './DescriptionEditor.css';

const DescriptionEditor = ({ 
  value, 
  onChange, 
  onAddAttachment, 
  placeholder = "Escreva a descrição... (Cole imagens diretamente aqui com Ctrl+V)",
  readOnly = false
}) => {
  const quillRef = useRef(null);

  // Configuração simplificada do editor
  const modules = useMemo(() => ({
    toolbar: readOnly ? false : [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ]
  }), [readOnly]);

  const formats = [
    'header', 'bold', 'italic', 'underline',
    'list', 'bullet', 'link', 'image'
  ];

  // Handler simplificado para upload de imagens
  const imageHandler = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = () => {
      const file = input.files[0];
      if (file) {
        handleImageFile(file);
      }
    };
  }, []);

  // Processar arquivo de imagem de forma mais segura
  const handleImageFile = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const quill = quillRef.current?.getEditor();
        if (quill) {
          const range = quill.getSelection() || { index: quill.getLength() };
          const index = range.index || 0;
          
          // Inserir imagem no editor
          quill.insertEmbed(index, 'image', e.target.result);
          
          // Mover cursor para depois da imagem
          setTimeout(() => {
            quill.setSelection(index + 1);
          }, 100);
          
          // Adicionar ao array de anexos se callback fornecido
          if (onAddAttachment) {
            onAddAttachment(file);
          }
        }
      } catch (error) {
        console.error('Erro ao inserir imagem:', error);
      }
    };
    reader.readAsDataURL(file);
  }, [onAddAttachment]);

  // Handler para colar imagens - mais robusto
  const handleClipboardPaste = useCallback((e) => {
    if (!e.clipboardData) return;

    const items = Array.from(e.clipboardData.items);
    const imageItem = items.find(item => item.type.startsWith('image/'));

    if (imageItem) {
      e.preventDefault();
      const file = imageItem.getAsFile();
      if (file) {
        // Criar nome único para imagem colada
        const timestamp = new Date().getTime();
        const extension = file.type.split('/')[1] || 'png';
        const uniqueName = `imagem_colada_${timestamp}.${extension}`;
        
        // Criar novo arquivo com nome único
        const renamedFile = new File([file], uniqueName, { type: file.type });
        
        handleImageFile(renamedFile);
      }
    }
  }, [handleImageFile]);

  // Configurar handlers personalizados no módulo toolbar
  const modulesWithHandlers = useMemo(() => ({
    ...modules,
    toolbar: readOnly ? false : {
      container: modules.toolbar,
      handlers: {
        image: imageHandler
      }
    }
  }), [modules, imageHandler, readOnly]);

  // Renderizar versão somente leitura
  if (readOnly) {
    return (
      <div className="description-viewer">
        <ReactQuill
          value={value || ''}
          readOnly={true}
          theme="bubble"
          modules={{ toolbar: false }}
        />
      </div>
    );
  }

  return (
    <div className="description-editor">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value || ''}
        onChange={onChange}
        modules={modulesWithHandlers}
        formats={formats}
        placeholder={placeholder}
        onClipboard={handleClipboardPaste}
        style={{
          minHeight: '150px'
        }}
      />
      <div className="editor-help">
        💡 <strong>Dica:</strong> Cole imagens diretamente com Ctrl+V ou use o botão de imagem na barra de ferramentas
      </div>
    </div>
  );
};

export default DescriptionEditor;
