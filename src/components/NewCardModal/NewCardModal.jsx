import React, { useState } from 'react';
import { categoryConfig, getMainCategories, getSubtaskCategories, isSubtask } from '../../data/initialData';
import LabelSelector from '../LabelSelector/LabelSelector';
import UserSelector from '../UserSelector/UserSelector';
import DatePicker from '../DatePicker/DatePicker';
import MediaUpload from '../MediaUpload/MediaUpload';
import TrelloLikeEditor from '../DescriptionEditor/TrelloLikeEditor';
import './NewCardModal.css';

const NewCardModal = ({ onClose, onCreateCard, allCards, allLabels, allUsers, onManageLabels }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('media');
  const [category, setCategory] = useState('historia');
  const [parentId, setParentId] = useState('');
  const [selectedLabels, setSelectedLabels] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [dueDate, setDueDate] = useState(null);
  const [attachedFiles, setAttachedFiles] = useState([]);

  const mainCategories = getMainCategories();
  const subtaskCategories = getSubtaskCategories();
  const isCurrentSubtask = isSubtask(category);
  
  // Obter cards principais disponíveis
  const mainCards = allCards ? Object.values(allCards).filter(card => !isSubtask(card.category)) : [];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim()) {
      const cardData = {
        title: title.trim(),
        description: description.trim(),
        priority,
        category,
        labels: selectedLabels,
        assignedUsers: selectedUsers,
        dueDate,
        attachments: attachedFiles, // Adicionar arquivos anexados
        createdAt: new Date().toISOString(),
        completedAt: null
      };
      
      // Adicionar parentId se for subtarefa
      if (isCurrentSubtask && parentId) {
        cardData.parentId = parentId;
      }
      
      onCreateCard(cardData);
      setTitle('');
      setDescription('');
      setPriority('media');
      setCategory('historia');
      setParentId('');
      setSelectedLabels([]);
      setSelectedUsers([]);
      setDueDate(null);
      setAttachedFiles([]);
    }
  };

  // Funções para gerenciar arquivos anexados
  const handleFilesSelected = (files) => {
    setAttachedFiles(prev => [...prev, ...files]);
  };

  const handleRemoveFile = (fileIndex) => {
    setAttachedFiles(prev => prev.filter((_, index) => index !== fileIndex));
  };

  // Função para adicionar arquivo ao anexo quando colado na descrição
  const handleAddAttachment = (file) => {
    setAttachedFiles(prev => [...prev, file]);
  };

  // Função para inserir arquivo na descrição (para arquivos já anexados)
  const insertFileInDescription = (file) => {
    const isImage = file.type?.startsWith('image/');
    
    if (isImage) {
      // Para imagens, inserir inline no editor WYSIWYG
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageHtml = `<p><img src="${e.target.result}" alt="${file.name}" style="max-width: 100%; height: auto; margin: 10px 0; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" /></p>`;
        const currentDescription = description || '';
        
        setDescription(currentDescription + imageHtml);
      };
      reader.readAsDataURL(file);
    } else {
      // Para outros arquivos, inserir como link de referência
      const fileReference = `<p><a href="#" data-file-name="${file.name}">📎 ${file.name}</a></p>`;
      const currentDescription = description || '';
      
      setDescription(currentDescription + fileReference);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Novo Card</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="category">Tipo</label>
            <select
              id="category"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                // Limpar parentId se mudou para categoria principal
                if (!isSubtask(e.target.value)) {
                  setParentId('');
                }
              }}
            >
              <optgroup label="Tarefas Principais">
                {mainCategories.map((key) => (
                  <option key={key} value={key}>
                    {categoryConfig[key].icon} {categoryConfig[key].name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Subtarefas">
                {subtaskCategories.map((key) => (
                  <option key={key} value={key}>
                    {categoryConfig[key].icon} {categoryConfig[key].name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {isCurrentSubtask && (
            <div className="form-group">
              <label htmlFor="parentId">Tarefa Principal</label>
              <select
                id="parentId"
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                required
              >
                <option value="">Selecione uma tarefa principal...</option>
                {mainCards.map((card) => (
                  <option key={card.id} value={card.id}>
                    {categoryConfig[card.category].icon} {card.title}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="title">Título</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
              placeholder="Digite o título do card..."
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Descrição</label>
            <TrelloLikeEditor
              value={description}
              onChange={setDescription}
              onAddAttachment={handleAddAttachment}
              attachments={attachedFiles}
              placeholder="Descreva os detalhes do card... (Cole imagens diretamente aqui com Ctrl+V)"
            />
            
            {/* Seção de anexos */}
            <div className="attachments-section">
              <label>📎 Anexos (Imagens, Documentos)</label>
              <MediaUpload
                onFilesSelected={handleFilesSelected}
                selectedFiles={attachedFiles}
                onRemoveFile={handleRemoveFile}
              />
              
              {/* Lista de arquivos anexados com opção de inserir na descrição */}
              {attachedFiles.length > 0 && (
                <div className="attached-files-list">
                  <h4>Arquivos Anexados:</h4>
                  {attachedFiles.map((file, index) => (
                    <div key={index} className="attached-file-item">
                      <span className="file-info">
                        {file.type.startsWith('image/') ? '🖼️' : 
                         file.type.includes('pdf') ? '📄' : 
                         file.type.includes('document') || file.type.includes('text') ? '📝' : '📎'} 
                        {file.name}
                      </span>
                      <button
                        type="button"
                        className="insert-file-btn"
                        onClick={() => insertFileInDescription(file)}
                        title="Inserir na descrição"
                      >
                        ➕ Inserir
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
            <div className="form-group">
            <label htmlFor="priority">Prioridade</label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="baixa">🟢 Baixa</option>
              <option value="media">🟡 Média</option>
              <option value="alta">🔴 Alta</option>
            </select>
          </div>

          <div className="form-group">
            <LabelSelector
              availableLabels={allLabels || {}}
              selectedLabels={selectedLabels}
              onLabelsChange={setSelectedLabels}
              onManageLabels={onManageLabels}
            />
          </div>

          <div className="form-group">
            <label htmlFor="users">Usuários</label>
            <UserSelector
              allUsers={allUsers || {}}
              selectedUserIds={selectedUsers}
              onUsersChange={setSelectedUsers}
              placeholder="Atribuir usuários..."
              isEditing={true}
            />
          </div>

          <div className="form-group">
            <DatePicker
              value={dueDate}
              onChange={setDueDate}
              label="Data de Vencimento"
              placeholder="Selecionar data de vencimento..."
              clearable={true}
            />
          </div>
          
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancelar
            </button>
            <button type="submit" className="btn-save">
              Criar Card
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewCardModal;
