// Utilitário para gerenciar logos de labels no localStorage
export const labelImageManager = {
  // Salvar imagem no localStorage
  saveImage: (imageData, labelId) => {
    try {
      const key = `label-logo-${labelId}`;
      localStorage.setItem(key, imageData);
      return true;
    } catch (error) {
      console.error('Erro ao salvar imagem:', error);
      return false;
    }
  },

  // Recuperar imagem do localStorage
  getImage: (labelId) => {
    try {
      const key = `label-logo-${labelId}`;
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Erro ao recuperar imagem:', error);
      return null;
    }
  },

  // Remover imagem do localStorage
  removeImage: (labelId) => {
    try {
      const key = `label-logo-${labelId}`;
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Erro ao remover imagem:', error);
      return false;
    }
  },

  // Limpar todas as imagens (útil para reset)
  clearAllImages: () => {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('label-logo-')) {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch (error) {
      console.error('Erro ao limpar imagens:', error);
      return false;
    }
  },

  // Verificar se imagem existe
  hasImage: (labelId) => {
    const key = `label-logo-${labelId}`;
    return localStorage.getItem(key) !== null;
  },

  // Obter tamanho total das imagens armazenadas
  getTotalSize: () => {
    try {
      let totalSize = 0;
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('label-logo-')) {
          const value = localStorage.getItem(key);
          if (value) {
            totalSize += value.length;
          }
        }
      });
      return totalSize;
    } catch (error) {
      console.error('Erro ao calcular tamanho:', error);
      return 0;
    }
  }
};

// Função para redimensionar imagem antes de salvar (opcional)
export const resizeImage = (file, maxWidth = 200, maxHeight = 100, quality = 0.8) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calcular novas dimensões mantendo proporção
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      // Configurar canvas
      canvas.width = width;
      canvas.height = height;

      // Desenhar imagem redimensionada
      ctx.drawImage(img, 0, 0, width, height);

      // Converter para base64
      const resizedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(resizedDataUrl);
    };

    img.src = URL.createObjectURL(file);
  });
};