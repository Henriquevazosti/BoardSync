import React, { useState, useRef, useEffect } from 'react';
import { labelColors, generateLabelId } from '../../data/initialData';
// import { labelImageManager, resizeImage } from '../../utils/labelImageManager';
import './LabelManager.css';

const LabelManager = ({ labels, onClose, onCreateLabel, onEditLabel, onDeleteLabel }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingLabel, setEditingLabel] = useState(null);
  const [newLabelName, setNewLabelName] = useState('');
  const [selectedColor, setSelectedColor] = useState(labelColors[0]);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleCreateLabel = async (e) => {
    e.preventDefault();
    console.log('🚀 Tentando criar label:', { newLabelName, selectedColor });
    if (newLabelName.trim()) {
      const labelId = generateLabelId();
      let logoUrl = null;

      // Se há uma imagem, usar diretamente o preview
      if (logoPreview) {
        logoUrl = logoPreview;
      }

      const newLabel = {
        id: labelId,
        name: newLabelName.trim(),
        color: selectedColor.color,
        bgColor: selectedColor.bgColor,
        logo: logoUrl
      };
      
      console.log('✅ Label criada:', newLabel);
      onCreateLabel(newLabel);
      resetForm();
    }
  };

  const handleEditLabel = async (e) => {
    e.preventDefault();
    console.log('🔄 Tentando editar label:', { newLabelName, selectedColor });
    if (newLabelName.trim() && editingLabel) {
      let logoUrl = editingLabel.logo; // Manter logo existente por padrão

      // Se há um novo preview, usar ele
      if (logoPreview !== null) {
        logoUrl = logoPreview;
      }

      const updatedLabel = {
        ...editingLabel,
        name: newLabelName.trim(),
        color: selectedColor.color,
        bgColor: selectedColor.bgColor,
        logo: logoUrl
      };
      
      console.log('✅ Label editada:', updatedLabel);
      onEditLabel(updatedLabel);
      resetForm();
    }
  };

  const resetForm = () => {
    setEditingLabel(null);
    setIsCreating(false);
    setNewLabelName('');
    setSelectedColor(labelColors[0]);
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    console.log('📷 Arquivo selecionado:', file);
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione apenas arquivos de imagem.');
        return;
      }

      // Validar tamanho (máx 5MB para o arquivo original)
      if (file.size > 5 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 5MB.');
        return;
      }

      setLogoFile(file);
      
      // Criar preview da imagem simples
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log('✅ Preview criado');
        setLogoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const startEdit = (label) => {
    setEditingLabel(label);
    setNewLabelName(label.name);
    const colorMatch = labelColors.find(c => c.color === label.color) || labelColors[0];
    setSelectedColor(colorMatch);
    
    // Carregar logo da label (do localStorage ou URL)
    if (label.logo) {
      // Se o logo começar com 'data:', é uma imagem base64 salva
      // Se começar com '/', é uma URL de imagem estática
      setLogoPreview(label.logo);
    } else {
      setLogoPreview(null);
    }
    
    setLogoFile(null);
    setIsCreating(false);
  };

  const cancelEdit = () => {
    resetForm();
  };

  const startCreate = () => {
    console.log('📝 Iniciando criação de nova label...');
    setIsCreating(true);
    setEditingLabel(null);
    setNewLabelName('');
    setSelectedColor(labelColors[0]);
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content label-manager" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🏷️ Gerenciar Labels</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {/* DEBUG */}
        {console.log('🔍 Estado atual:', { isCreating, editingLabel })}

        <div className="labels-list">
          <h3>Labels Existentes</h3>
          {Object.values(labels).length === 0 ? (
            <p className="no-labels">Nenhuma label criada ainda</p>
          ) : (
            <div className="existing-labels">
              {Object.values(labels).map((label) => (
                <div key={label.id} className="label-item">
                  <div 
                    className="label-preview label-content"
                    style={{
                      backgroundColor: label.bgColor,
                      color: label.color,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '8px 0'
                    }}
                  >
                    {label.logo && (
                      <img
                        src={label.logo}
                        alt={label.name}
                        style={{ width: 80, height: 40, objectFit: 'contain', marginBottom: 4, display: 'block' }}
                      />
                    )}
                    <span style={{ fontWeight: 500 }}>{label.name}</span>
                  </div>
                  <div className="label-actions">
                    <button 
                      className="edit-label-btn"
                      onClick={() => startEdit(label)}
                      title="Editar label"
                    >
                      ✏️
                    </button>
                    <button 
                      className="delete-label-btn"
                      onClick={() => onDeleteLabel(label.id)}
                      title="Excluir label"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {(isCreating || editingLabel) && (
          <div className="label-form">
            <h3>{editingLabel ? 'Editar Label' : 'Nova Label'}</h3>
            <form onSubmit={editingLabel ? handleEditLabel : handleCreateLabel}>
              <div className="form-group">
                <label htmlFor="labelName">Nome da Label</label>
                <input
                  type="text"
                  id="labelName"
                  value={newLabelName}
                  onChange={(e) => setNewLabelName(e.target.value)}
                  placeholder="Digite o nome da label..."
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label>Logo/Imagem da Label</label>
                <div className="logo-upload-section">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleLogoChange}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                  
                  {logoPreview ? (
                    <div className="logo-preview">
                      <img 
                        src={logoPreview} 
                        alt="Preview do logo" 
                        style={{ 
                          width: 80, 
                          height: 40, 
                          objectFit: 'contain',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          padding: '4px'
                        }}
                      />
                      <div className="logo-actions">
                        <button 
                          type="button" 
                          onClick={() => fileInputRef.current?.click()}
                          className="btn-change-logo"
                        >
                          📷 Trocar
                        </button>
                        <button 
                          type="button" 
                          onClick={removeLogo}
                          className="btn-remove-logo"
                        >
                          🗑️ Remover
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="logo-upload-area">
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="btn-upload-logo"
                      >
                        📷 Adicionar Logo/Imagem
                      </button>
                      <small style={{ marginTop: '8px', color: '#666', display: 'block' }}>
                        Formatos aceitos: JPG, PNG, GIF, SVG (máx. 5MB)<br/>
                        Recomendado: 200x100px para melhor qualidade
                      </small>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Cor da Label</label>
                <div className="color-selector">
                  {labelColors.map((colorOption, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`color-option ${selectedColor.color === colorOption.color ? 'selected' : ''}`}
                      style={{
                        backgroundColor: colorOption.bgColor,
                        borderColor: colorOption.color
                      }}
                      onClick={() => setSelectedColor(colorOption)}
                      title={colorOption.name}
                    >
                      <span style={{ color: colorOption.color }}>●</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="label-preview-section">
                <label>Prévia:</label>
                <div 
                  className="label-preview large"
                  style={{
                    backgroundColor: selectedColor.bgColor,
                    color: selectedColor.color,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '12px',
                    minHeight: '80px'
                  }}
                >
                  {logoPreview && (
                    <img 
                      src={logoPreview} 
                      alt="Preview" 
                      style={{ 
                        width: 60, 
                        height: 30, 
                        objectFit: 'contain',
                        marginBottom: '6px' 
                      }}
                    />
                  )}
                  <span style={{ fontWeight: 500 }}>
                    {newLabelName || 'Nome da label'}
                  </span>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={cancelEdit} className="btn-cancel">
                  Cancelar
                </button>
                <button type="submit" className="btn-save">
                  {editingLabel ? 'Salvar Alterações' : 'Criar Label'}
                </button>
              </div>
            </form>
          </div>
        )}

        {!isCreating && !editingLabel && (
          <div className="add-label-section">
            <button 
              className="btn-add-label" 
              onClick={(e) => {
                e.preventDefault();
                console.log('🖱️ Botão + Nova Label clicado!');
                startCreate();
              }}
            >
              + Nova Label
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LabelManager;
