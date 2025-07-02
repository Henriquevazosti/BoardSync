/**
 * Utilitários para renderização de markdown com suporte a imagens
 */
import React from 'react';

/**
 * Renderiza texto com markdown e imagens em base64
 * @param {string} text - O texto com markdown para renderizar
 * @param {object} options - Opções de renderização
 * @param {boolean} options.allowRemove - Se deve permitir remoção de imagens
 * @param {function} options.onRemoveImage - Callback para remoção de imagem
 * @param {string} options.imageClassName - Classe CSS para as imagens
 * @param {string} options.containerClassName - Classe CSS para o container
 * @returns {JSX.Element|null} O elemento JSX renderizado
 */
export const renderMarkdownWithImages = (text, options = {}) => {
  if (!text) return null;

  const {
    allowRemove = false,
    onRemoveImage = () => {},
    imageClassName = 'markdown-img',
    containerClassName = 'markdown-content',
    textClassName = 'markdown-text',
    imageContainerClassName = 'markdown-image-container'
  } = options;

  // Dividir o texto em partes usando regex para capturar imagens
  const imageRegex = /!\[([^\]]*)\]\((data:image[^)]+)\)/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  // Encontrar todas as imagens e criar array de partes
  while ((match = imageRegex.exec(text)) !== null) {
    // Adicionar texto antes da imagem
    if (match.index > lastIndex) {
      const textBefore = text.substring(lastIndex, match.index);
      if (textBefore.trim()) {
        parts.push({
          type: 'text',
          content: textBefore
        });
      }
    }

    // Adicionar a imagem
    parts.push({
      type: 'image',
      alt: match[1] || 'Imagem',
      src: match[2],
      markdown: match[0] // Guardar o markdown original para poder remover
    });

    lastIndex = match.index + match[0].length;
  }

  // Adicionar texto restante
  if (lastIndex < text.length) {
    const textAfter = text.substring(lastIndex);
    if (textAfter.trim()) {
      parts.push({
        type: 'text',
        content: textAfter
      });
    }
  }

  // Se não há imagens, mostrar apenas o texto
  if (parts.length === 0) {
    return React.createElement('div', 
      { className: textClassName },
      text.split('\n').map((line, i) => 
        React.createElement('div', { key: i }, line || React.createElement('br'))
      )
    );
  }

  // Renderizar as partes
  return React.createElement('div', 
    { className: containerClassName },
    parts.map((part, index) => {
      if (part.type === 'text') {
        return React.createElement('div', 
          { key: `text-${index}`, className: textClassName },
          part.content.split('\n').map((line, lineIndex) =>
            React.createElement('div', { key: lineIndex }, line || React.createElement('br'))
          )
        );
      } else if (part.type === 'image') {
        const imageWrapper = React.createElement('div',
          { style: { position: 'relative', display: 'inline-block' } },
          React.createElement('img', {
            src: part.src,
            alt: part.alt,
            className: imageClassName
          }),
          allowRemove ? React.createElement('button', {
            className: 'remove-image-btn',
            onClick: () => onRemoveImage(part.markdown),
            title: 'Remover imagem',
            type: 'button',
            style: {
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: 'rgba(220, 53, 69, 0.9)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              opacity: 0
            }
          }, '×') : null
        );

        const elements = [imageWrapper];
        
        if (part.alt) {
          elements.push(
            React.createElement('div', {
              className: 'image-caption',
              style: {
                marginTop: '8px',
                fontSize: '12px',
                color: 'var(--color-textSecondary)',
                fontStyle: 'italic',
                textAlign: 'center'
              }
            }, part.alt)
          );
        }

        return React.createElement('div',
          { key: `img-${index}`, className: imageContainerClassName },
          ...elements
        );
      }
      return null;
    })
  );
};

/**
 * Verifica se um texto contém imagens em markdown
 * @param {string} text - O texto para verificar
 * @returns {boolean} True se contém imagens
 */
export const hasMarkdownImages = (text) => {
  if (!text) return false;
  const imageRegex = /!\[([^\]]*)\]\((data:image[^)]+)\)/g;
  return imageRegex.test(text);
};

/**
 * Extrai todas as imagens de um texto markdown
 * @param {string} text - O texto para extrair imagens
 * @returns {Array} Array com informações das imagens
 */
export const extractMarkdownImages = (text) => {
  if (!text) return [];
  
  const imageRegex = /!\[([^\]]*)\]\((data:image[^)]+)\)/g;
  const images = [];
  let match;

  while ((match = imageRegex.exec(text)) !== null) {
    images.push({
      alt: match[1] || 'Imagem',
      src: match[2],
      markdown: match[0]
    });
  }

  return images;
};
