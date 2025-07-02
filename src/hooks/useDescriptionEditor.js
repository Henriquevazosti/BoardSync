import { useCallback } from 'react';

/**
 * Hook para gerenciar funcionalidades do editor de descrição
 * Facilita a integração de imagens inline e arquivos
 */
export const useDescriptionEditor = (onAttachmentAdd) => {
  
  // Processar arquivo e convertê-lo para Data URL
  const processFileToDataURL = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  }, []);

  // Inserir imagem inline na descrição
  const insertImageInline = useCallback(async (file, currentDescription = '') => {
    try {
      const dataURL = await processFileToDataURL(file);
      const imageHtml = `<p><img src="${dataURL}" alt="${file.name}" style="max-width: 100%; height: auto; margin: 10px 0; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" /></p>`;
      
      // Adicionar aos anexos se callback fornecido
      if (onAttachmentAdd) {
        onAttachmentAdd(file);
      }
      
      return currentDescription + imageHtml;
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      return currentDescription;
    }
  }, [processFileToDataURL, onAttachmentAdd]);

  // Inserir referência de arquivo na descrição
  const insertFileReference = useCallback((file, currentDescription = '') => {
    const fileIcon = getFileIcon(file.type);
    const fileReference = `<p><a href="#" data-file-name="${file.name}">${fileIcon} ${file.name}</a></p>`;
    
    // Adicionar aos anexos se callback fornecido
    if (onAttachmentAdd) {
      onAttachmentAdd(file);
    }
    
    return currentDescription + fileReference;
  }, [onAttachmentAdd]);

  // Processar qualquer tipo de arquivo
  const insertFile = useCallback(async (file, currentDescription = '') => {
    const isImage = file.type?.startsWith('image/');
    
    if (isImage) {
      return await insertImageInline(file, currentDescription);
    } else {
      return insertFileReference(file, currentDescription);
    }
  }, [insertImageInline, insertFileReference]);

  // Limpar HTML de descrição (para fallback em texto simples)
  const stripHtmlFromDescription = useCallback((htmlContent) => {
    const doc = new DOMParser().parseFromString(htmlContent, 'text/html');
    return doc.body.textContent || '';
  }, []);

  // Extrair URLs de imagens da descrição HTML
  const extractImageUrls = useCallback((htmlContent) => {
    const doc = new DOMParser().parseFromString(htmlContent, 'text/html');
    const images = doc.querySelectorAll('img');
    return Array.from(images).map(img => ({
      src: img.src,
      alt: img.alt || '',
      fileName: img.getAttribute('data-file-name') || img.alt
    }));
  }, []);

  // Extrair referências de arquivos da descrição HTML
  const extractFileReferences = useCallback((htmlContent) => {
    const doc = new DOMParser().parseFromString(htmlContent, 'text/html');
    const fileLinks = doc.querySelectorAll('a[data-file-name]');
    return Array.from(fileLinks).map(link => ({
      fileName: link.getAttribute('data-file-name'),
      text: link.textContent
    }));
  }, []);

  return {
    insertImageInline,
    insertFileReference,
    insertFile,
    stripHtmlFromDescription,
    extractImageUrls,
    extractFileReferences,
    processFileToDataURL
  };
};

// Função auxiliar para obter ícone do arquivo
function getFileIcon(mimeType) {
  if (mimeType?.startsWith('image/')) return '🖼️';
  if (mimeType?.includes('pdf')) return '📄';
  if (mimeType?.includes('document') || mimeType?.includes('text')) return '📝';
  if (mimeType?.includes('video')) return '🎥';
  if (mimeType?.includes('audio')) return '🎵';
  if (mimeType?.includes('zip') || mimeType?.includes('archive')) return '📦';
  return '📎';
}

export default useDescriptionEditor;
