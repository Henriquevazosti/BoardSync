import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import './ThemeSelector.css';

const ThemeSelector = ({ isOpen, onClose }) => {
  const { currentTheme, themes, customSettings, changeTheme, updateSettings, resetToDefaults } = useTheme();
  const [activeTab, setActiveTab] = useState('themes');

  if (!isOpen) return null;

  const handleThemeChange = (themeId) => {
    changeTheme(themeId);
  };

  const handleSettingChange = (setting, value) => {
    updateSettings({ [setting]: value });
  };

  return (
    <div className="theme-selector-overlay">
      <div className="theme-selector-modal">
        <div className="theme-selector-header">
          <h2>🎨 Personalização Visual</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="theme-selector-tabs">
          <button
            className={`tab-btn ${activeTab === 'themes' ? 'active' : ''}`}
            onClick={() => setActiveTab('themes')}
          >
            🎨 Temas
          </button>
          <button
            className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            ⚙️ Configurações
          </button>
          <button
            className={`tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
            onClick={() => setActiveTab('preview')}
          >
            👁️ Preview
          </button>
        </div>

        <div className="theme-selector-content">
          {/* Aba de Temas */}
          {activeTab === 'themes' && (
            <div className="themes-section">
              <h3>Escolha um Tema</h3>
              <div className="themes-grid">
                {Object.values(themes).map((theme) => (
                  <div
                    key={theme.id}
                    className={`theme-card ${currentTheme === theme.id ? 'selected' : ''}`}
                    onClick={() => handleThemeChange(theme.id)}
                  >
                    <div className="theme-preview">
                      <div 
                        className="theme-preview-bg"
                        style={{ backgroundColor: theme.colors.background }}
                      >
                        <div 
                          className="theme-preview-card"
                          style={{ 
                            backgroundColor: theme.colors.cardBackground,
                            border: `1px solid ${theme.colors.border}`
                          }}
                        >
                          <div 
                            className="theme-preview-header"
                            style={{ backgroundColor: theme.colors.primary }}
                          ></div>
                          <div 
                            className="theme-preview-content"
                            style={{ color: theme.colors.textPrimary }}
                          >
                            <div className="theme-preview-line"></div>
                            <div className="theme-preview-line short"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="theme-info">
                      <span className="theme-icon">{theme.icon}</span>
                      <span className="theme-name">{theme.name}</span>
                    </div>
                    {currentTheme === theme.id && (
                      <div className="theme-selected-indicator">✓</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Aba de Configurações */}
          {activeTab === 'settings' && (
            <div className="settings-section">
              <h3>Configurações Avançadas</h3>
              
              <div className="setting-group">
                <label>Tamanho da Fonte</label>
                <div className="setting-options">
                  {['small', 'medium', 'large'].map((size) => (
                    <button
                      key={size}
                      className={`setting-option ${customSettings.fontSize === size ? 'active' : ''}`}
                      onClick={() => handleSettingChange('fontSize', size)}
                    >
                      {size === 'small' && 'Pequena'}
                      {size === 'medium' && 'Média'}
                      {size === 'large' && 'Grande'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="setting-group">
                <label>Bordas Arredondadas</label>
                <div className="setting-options">
                  {['none', 'small', 'medium', 'large'].map((radius) => (
                    <button
                      key={radius}
                      className={`setting-option ${customSettings.borderRadius === radius ? 'active' : ''}`}
                      onClick={() => handleSettingChange('borderRadius', radius)}
                    >
                      {radius === 'none' && 'Nenhuma'}
                      {radius === 'small' && 'Pequena'}
                      {radius === 'medium' && 'Média'}
                      {radius === 'large' && 'Grande'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="setting-group">
                <label className="setting-toggle">
                  <input
                    type="checkbox"
                    checked={customSettings.animations}
                    onChange={(e) => handleSettingChange('animations', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                  Animações
                </label>
                <p className="setting-description">
                  Ativa/desativa transições e animações na interface
                </p>
              </div>

              <div className="setting-group">
                <label className="setting-toggle">
                  <input
                    type="checkbox"
                    checked={customSettings.compactMode}
                    onChange={(e) => handleSettingChange('compactMode', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                  Modo Compacto
                </label>
                <p className="setting-description">
                  Reduz espaçamentos para mostrar mais conteúdo na tela
                </p>
              </div>

              <div className="settings-actions">
                <button 
                  className="btn-reset"
                  onClick={resetToDefaults}
                >
                  🔄 Restaurar Padrões
                </button>
              </div>
            </div>
          )}

          {/* Aba de Preview */}
          {activeTab === 'preview' && (
            <div className="preview-section">
              <h3>Visualização do Tema</h3>
              <div className="preview-board">
                <div className="preview-column">
                  <div className="preview-column-header">
                    <h4>A Fazer</h4>
                    <span className="preview-count">3</span>
                  </div>
                  <div className="preview-cards">
                    <div className="preview-card">
                      <div className="preview-card-header">
                        <span className="preview-badge">História</span>
                        <span className="preview-priority high">Alta</span>
                      </div>
                      <h5>Implementar autenticação</h5>
                      <p>Criar sistema de login e registro de usuários</p>
                      <div className="preview-labels">
                        <span className="preview-label">Frontend</span>
                        <span className="preview-label">Backend</span>
                      </div>
                      <div className="preview-users">
                        <div className="preview-avatar">👩‍💻</div>
                        <div className="preview-avatar">👨‍💼</div>
                      </div>
                    </div>
                    <div className="preview-card">
                      <div className="preview-card-header">
                        <span className="preview-badge">Bug</span>
                        <span className="preview-priority medium">Média</span>
                      </div>
                      <h5>Corrigir layout responsivo</h5>
                      <p>Cards não se ajustam corretamente em telas pequenas</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThemeSelector;
