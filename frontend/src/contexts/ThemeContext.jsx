import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Temas predefinidos
export const themes = {
  light: {
    id: 'light',
    name: 'Claro',
    icon: '☀️',
    colors: {
      // Cores principais
      primary: '#0052cc',
      primaryHover: '#0747a6',
      primaryLight: '#e6f3ff',
      
      // Backgrounds
      background: '#fafbfc',
      cardBackground: '#ffffff',
      columnBackground: '#f4f5f7',
      modalBackground: '#ffffff',
      
      // Textos
      textPrimary: '#1f2937',
      textSecondary: '#6b7280',
      textMuted: '#9ca3af',
      
      // Bordas
      border: '#e5e7eb',
      borderLight: '#f3f4f6',
      borderDark: '#d1d5db',
      
      // Estados
      success: '#00875a',
      successLight: '#e3fcef',
      warning: '#ff8b00',
      warningLight: '#fff4e6',
      error: '#de350b',
      errorLight: '#ffebe6',
      
      // Sombras
      shadow: 'rgba(9, 30, 66, 0.25)',
      shadowHover: 'rgba(9, 30, 66, 0.15)',
      shadowDrop: 'rgba(0, 0, 0, 0.1)',
    }
  },
  dark: {
    id: 'dark',
    name: 'Escuro',
    icon: '🌙',
    colors: {
      // Cores principais
      primary: '#4c9aff',
      primaryHover: '#2684ff',
      primaryLight: '#0d1929',
      
      // Backgrounds
      background: '#0d1117',
      cardBackground: '#161b22',
      columnBackground: '#21262d',
      modalBackground: '#1c2128',
      
      // Textos
      textPrimary: '#f0f6fc',
      textSecondary: '#8b949e',
      textMuted: '#6e7681',
      
      // Bordas
      border: '#30363d',
      borderLight: '#21262d',
      borderDark: '#484f58',
      
      // Estados
      success: '#3fb950',
      successLight: '#0d1117',
      warning: '#d29922',
      warningLight: '#1a1611',
      error: '#f85149',
      errorLight: '#1a1216',
      
      // Sombras
      shadow: 'rgba(1, 4, 9, 0.8)',
      shadowHover: 'rgba(1, 4, 9, 0.6)',
      shadowDrop: 'rgba(0, 0, 0, 0.3)',
    }
  },
  blue: {
    id: 'blue',
    name: 'Azul Oceano',
    icon: '🌊',
    colors: {
      primary: '#1e40af',
      primaryHover: '#1d4ed8',
      primaryLight: '#dbeafe',
      
      background: '#f0f9ff',
      cardBackground: '#ffffff',
      columnBackground: '#e0f2fe',
      modalBackground: '#ffffff',
      
      textPrimary: '#0f172a',
      textSecondary: '#475569',
      textMuted: '#64748b',
      
      border: '#bae6fd',
      borderLight: '#e0f2fe',
      borderDark: '#7dd3fc',
      
      success: '#059669',
      successLight: '#ecfdf5',
      warning: '#d97706',
      warningLight: '#fffbeb',
      error: '#dc2626',
      errorLight: '#fef2f2',
      
      shadow: 'rgba(59, 130, 246, 0.25)',
      shadowHover: 'rgba(59, 130, 246, 0.15)',
      shadowDrop: 'rgba(59, 130, 246, 0.1)',
    }
  },
  purple: {
    id: 'purple',
    name: 'Roxo Místico',
    icon: '🔮',
    colors: {
      primary: '#7c3aed',
      primaryHover: '#8b5cf6',
      primaryLight: '#ede9fe',
      
      background: '#faf5ff',
      cardBackground: '#ffffff',
      columnBackground: '#f3e8ff',
      modalBackground: '#ffffff',
      
      textPrimary: '#1f2937',
      textSecondary: '#6b7280',
      textMuted: '#9ca3af',
      
      border: '#d8b4fe',
      borderLight: '#f3e8ff',
      borderDark: '#c4b5fd',
      
      success: '#059669',
      successLight: '#ecfdf5',
      warning: '#d97706',
      warningLight: '#fffbeb',
      error: '#dc2626',
      errorLight: '#fef2f2',
      
      shadow: 'rgba(139, 92, 246, 0.25)',
      shadowHover: 'rgba(139, 92, 246, 0.15)',
      shadowDrop: 'rgba(139, 92, 246, 0.1)',
    }
  },
  green: {
    id: 'green',
    name: 'Verde Natureza',
    icon: '🌿',
    colors: {
      primary: '#059669',
      primaryHover: '#047857',
      primaryLight: '#d1fae5',
      
      background: '#f0fdf4',
      cardBackground: '#ffffff',
      columnBackground: '#dcfce7',
      modalBackground: '#ffffff',
      
      textPrimary: '#1f2937',
      textSecondary: '#6b7280',
      textMuted: '#9ca3af',
      
      border: '#bbf7d0',
      borderLight: '#dcfce7',
      borderDark: '#86efac',
      
      success: '#059669',
      successLight: '#ecfdf5',
      warning: '#d97706',
      warningLight: '#fffbeb',
      error: '#dc2626',
      errorLight: '#fef2f2',
      
      shadow: 'rgba(5, 150, 105, 0.25)',
      shadowHover: 'rgba(5, 150, 105, 0.15)',
      shadowDrop: 'rgba(5, 150, 105, 0.1)',
    }
  }
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('light');
  const [customSettings, setCustomSettings] = useState({
    fontSize: 'medium',
    borderRadius: 'medium',
    animations: true,
    compactMode: false
  });

  // Carregar tema salvo
  useEffect(() => {
    const savedTheme = localStorage.getItem('boardsync-theme');
    const savedSettings = localStorage.getItem('boardsync-theme-settings');
    
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
    
    if (savedSettings) {
      try {
        setCustomSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Erro ao carregar configurações de tema:', error);
      }
    }
  }, []);

  // Aplicar tema no document
  useEffect(() => {
    const theme = themes[currentTheme];
    if (!theme) return;

    const root = document.documentElement;
    
    // Aplicar variáveis CSS
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    // Aplicar configurações personalizadas
    root.style.setProperty('--font-size-base', getFontSize(customSettings.fontSize));
    root.style.setProperty('--border-radius-base', getBorderRadius(customSettings.borderRadius));
    root.style.setProperty('--animation-duration', customSettings.animations ? '0.2s' : '0s');
    root.style.setProperty('--spacing-compact', customSettings.compactMode ? '0.5' : '1');

    // Adicionar classe de tema ao body
    document.body.className = `theme-${currentTheme} ${customSettings.compactMode ? 'compact-mode' : ''}`;
  }, [currentTheme, customSettings]);

  const getFontSize = (size) => {
    switch (size) {
      case 'small': return '13px';
      case 'large': return '16px';
      default: return '14px';
    }
  };

  const getBorderRadius = (radius) => {
    switch (radius) {
      case 'none': return '0px';
      case 'small': return '4px';
      case 'large': return '12px';
      default: return '8px';
    }
  };

  const changeTheme = (themeId) => {
    if (themes[themeId]) {
      setCurrentTheme(themeId);
      localStorage.setItem('boardsync-theme', themeId);
    }
  };

  const updateSettings = (newSettings) => {
    const updatedSettings = { ...customSettings, ...newSettings };
    setCustomSettings(updatedSettings);
    localStorage.setItem('boardsync-theme-settings', JSON.stringify(updatedSettings));
  };

  const resetToDefaults = () => {
    setCurrentTheme('light');
    setCustomSettings({
      fontSize: 'medium',
      borderRadius: 'medium',
      animations: true,
      compactMode: false
    });
    localStorage.removeItem('boardsync-theme');
    localStorage.removeItem('boardsync-theme-settings');
  };

  const value = {
    currentTheme,
    theme: themes[currentTheme],
    themes,
    customSettings,
    changeTheme,
    updateSettings,
    resetToDefaults
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
