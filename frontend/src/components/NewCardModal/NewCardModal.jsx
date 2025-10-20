import React, { useState } from 'react';
import { categoryConfig, getMainCategories, getSubtaskCategories, isSubtask } from '../../data/initialData';
import LabelSelector from '../LabelSelector/LabelSelector';
import UserSelector from '../UserSelector/UserSelector';
import DatePicker from '../DatePicker/DatePicker';
import MediaUpload from '../MediaUpload/MediaUpload';
import DescriptionEditor from '../DescriptionEditor/DescriptionEditor';
import './NewCardModal.css';

const NewCardModal = ({ columnId, onClose, onCreateCard, allCards, allLabels, allUsers, onManageLabels }) => {
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

  // Funções para gerenciar arquivos
  const handleFilesSelected = (newFiles) => {
    setAttachedFiles(prev => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (fileId) => {
    setAttachedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim()) {
      const cardData = {
        columnId: columnId, // Adicionar o ID da coluna
        title: title.trim(),
        description: description.trim(),
        priority,
        category,
        labels: selectedLabels,
        assignedUsers: selectedUsers,
        dueDate,
        attachments: attachedFiles.map(file => ({
          id: file.id,
          name: file.name,
          size: file.size,
          type: file.type,
          mimeType: file.mimeType,
          url: file.url
        })),
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
            <DescriptionEditor
              value={description}
              onChange={setDescription}
              placeholder="Descreva os detalhes do card..."
            />
          </div>

          <div className="form-group">
            <label>📎 Anexos (Imagens, Documentos)</label>
            <MediaUpload
              onFilesSelected={handleFilesSelected}
              selectedFiles={attachedFiles}
              onRemoveFile={handleRemoveFile}
            />
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
