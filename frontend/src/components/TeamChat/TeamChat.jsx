import React, { useState, useRef, useEffect } from 'react';
import './TeamChat.css';

const TeamChat = ({ 
  isOpen, 
  onClose, 
  currentUser, 
  allUsers, 
  onSendMessage,
  messages = []
}) => {
  const [messageText, setMessageText] = useState('');
  const [searchUser, setSearchUser] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordingIntervalRef = useRef(null);

  // Auto scroll para última mensagem
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Filtrar usuários para busca
  const filteredUsers = Object.values(allUsers).filter(user =>
    user.name.toLowerCase().includes(searchUser.toLowerCase()) ||
    user.email.toLowerCase().includes(searchUser.toLowerCase())
  );

  // Enviar mensagem de texto
  const handleSendMessage = () => {
    if (!messageText.trim() && !selectedFile) return;

    const message = {
      id: `msg-${Date.now()}`,
      userId: currentUser.id,
      type: selectedFile ? getFileType(selectedFile) : 'text',
      content: messageText.trim(),
      file: selectedFile ? {
        name: selectedFile.name,
        url: previewUrl,
        type: selectedFile.type,
        size: selectedFile.size
      } : null,
      timestamp: new Date().toISOString(),
      reactions: {}
    };

    onSendMessage(message);
    setMessageText('');
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  // Determinar tipo de arquivo
  const getFileType = (file) => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    return 'file';
  };

  // Tratar upload de arquivo
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Verificar tamanho do arquivo (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Arquivo muito grande! Máximo 10MB permitido.');
      return;
    }

    setSelectedFile(file);
    
    // Criar preview para imagens e vídeos
    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  // Iniciar gravação de áudio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      const audioChunks = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const audioFile = new File([audioBlob], `audio-${Date.now()}.wav`, {
          type: 'audio/wav'
        });
        
        setSelectedFile(audioFile);
        setPreviewUrl(audioUrl);
        
        // Parar todas as tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Contador de tempo
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Erro ao acessar microfone:', error);
      alert('Não foi possível acessar o microfone. Verifique as permissões.');
    }
  };

  // Parar gravação de áudio
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingIntervalRef.current);
    }
  };

  // Cancelar gravação
  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingIntervalRef.current);
      setRecordingTime(0);
    }
  };

  // Remover arquivo selecionado
  const removeSelectedFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (audioInputRef.current) audioInputRef.current.value = '';
  };

  // Formatar tempo
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Formatar tamanho do arquivo
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Tratar teclas
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="team-chat-overlay" onClick={onClose}>
      <div className="team-chat-container" onClick={e => e.stopPropagation()}>
        
        {/* Header do Chat */}
        <div className="chat-header">
          <div className="chat-header-info">
            <div className="chat-title">
              <span className="chat-icon">💬</span>
              <h3>Chat da Equipe</h3>
            </div>
            <div className="chat-subtitle">
              {Object.keys(allUsers).length} membros online
            </div>
          </div>
          
          <div className="chat-header-actions">
            <button 
              className="search-toggle-btn"
              onClick={() => setShowUserSearch(!showUserSearch)}
              title="Buscar usuários"
            >
              🔍
            </button>
            <button 
              className="close-chat-btn" 
              onClick={onClose}
              title="Fechar chat"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Busca de usuários */}
        {showUserSearch && (
          <div className="user-search-section">
            <div className="search-input-container">
              <input
                type="text"
                placeholder="Buscar por nome ou email..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="user-search-input"
              />
            </div>
            
            {searchUser && (
              <div className="search-results">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(user => (
                    <div key={user.id} className="search-result-item">
                      <div 
                        className="user-avatar-search"
                        style={{
                          backgroundColor: user.bgColor,
                          color: user.color,
                          border: `2px solid ${user.color}`
                        }}
                      >
                        {user.avatar}
                      </div>
                      <div className="user-search-info">
                        <span className="user-search-name">{user.name}</span>
                        <span className="user-search-email">{user.email}</span>
                      </div>
                      <div className="user-status online">●</div>
                    </div>
                  ))
                ) : (
                  <div className="no-results">Nenhum usuário encontrado</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Área de mensagens */}
        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="empty-chat">
              <div className="empty-chat-icon">💬</div>
              <h4>Seja o primeiro a enviar uma mensagem!</h4>
              <p>Compartilhe atualizações, ideias ou tire dúvidas com sua equipe.</p>
            </div>
          ) : (
            messages.map((message, index) => {
              const user = allUsers[message.userId];
              const isOwn = message.userId === currentUser.id;
              const showAvatar = index === 0 || messages[index - 1].userId !== message.userId;
              
              return (
                <div 
                  key={message.id} 
                  className={`message ${isOwn ? 'own-message' : 'other-message'}`}
                >
                  {!isOwn && showAvatar && (
                    <div 
                      className="message-avatar"
                      style={{
                        backgroundColor: user?.bgColor,
                        color: user?.color,
                        border: `2px solid ${user?.color}`
                      }}
                    >
                      {user?.avatar}
                    </div>
                  )}
                  
                  <div className="message-content">
                    {!isOwn && showAvatar && (
                      <div className="message-header">
                        <span className="message-author">{user?.name}</span>
                        <span className="message-time">{formatTime(message.timestamp)}</span>
                      </div>
                    )}
                    
                    <div className="message-body">
                      {/* Texto da mensagem */}
                      {message.content && (
                        <div className="message-text">{message.content}</div>
                      )}
                      
                      {/* Arquivo/Mídia */}
                      {message.file && (
                        <div className="message-media">
                          {message.type === 'image' && (
                            <img 
                              src={message.file.url} 
                              alt={message.file.name}
                              className="message-image"
                              onClick={() => window.open(message.file.url, '_blank')}
                            />
                          )}
                          
                          {message.type === 'video' && (
                            <video 
                              src={message.file.url} 
                              controls
                              className="message-video"
                            />
                          )}
                          
                          {message.type === 'audio' && (
                            <audio 
                              src={message.file.url} 
                              controls
                              className="message-audio"
                            />
                          )}
                          
                          {message.type === 'file' && (
                            <div className="message-file">
                              <div className="file-icon">📎</div>
                              <div className="file-info">
                                <span className="file-name">{message.file.name}</span>
                                <span className="file-size">{formatFileSize(message.file.size)}</span>
                              </div>
                              <button 
                                className="file-download"
                                onClick={() => window.open(message.file.url, '_blank')}
                              >
                                ⬇️
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {isOwn && (
                      <div className="message-time-own">{formatTime(message.timestamp)}</div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Preview de arquivo selecionado */}
        {selectedFile && (
          <div className="file-preview">
            <div className="preview-header">
              <span>Arquivo selecionado:</span>
              <button 
                className="remove-file-btn"
                onClick={removeSelectedFile}
              >
                ✕
              </button>
            </div>
            
            <div className="preview-content">
              {selectedFile.type.startsWith('image/') && (
                <img src={previewUrl} alt="Preview" className="preview-image" />
              )}
              
              {selectedFile.type.startsWith('video/') && (
                <video src={previewUrl} className="preview-video" controls />
              )}
              
              {selectedFile.type.startsWith('audio/') && (
                <audio src={previewUrl} className="preview-audio" controls />
              )}
              
              <div className="preview-info">
                <span className="preview-name">{selectedFile.name}</span>
                <span className="preview-size">{formatFileSize(selectedFile.size)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Indicador de gravação */}
        {isRecording && (
          <div className="recording-indicator">
            <div className="recording-animation">🎤</div>
            <span>Gravando... {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}</span>
            <button className="stop-recording-btn" onClick={stopRecording}>Parar</button>
            <button className="cancel-recording-btn" onClick={cancelRecording}>Cancelar</button>
          </div>
        )}

        {/* Input de mensagem */}
        <div className="chat-input-section">
          <div className="chat-input-container">
            <div className="chat-input-actions">
              <button 
                className="attach-btn"
                onClick={() => fileInputRef.current?.click()}
                title="Anexar arquivo"
              >
                📎
              </button>
              
              <button 
                className="image-btn"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = handleFileSelect;
                  input.click();
                }}
                title="Enviar imagem"
              >
                🖼️
              </button>
              
              <button 
                className={`audio-btn ${isRecording ? 'recording' : ''}`}
                onClick={isRecording ? stopRecording : startRecording}
                title={isRecording ? "Parar gravação" : "Gravar áudio"}
              >
                🎤
              </button>
            </div>
            
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              className="message-input"
              rows="1"
              disabled={isRecording}
            />
            
            <button 
              className="send-btn"
              onClick={handleSendMessage}
              disabled={!messageText.trim() && !selectedFile}
              title="Enviar mensagem"
            >
              📤
            </button>
          </div>
        </div>

        {/* Inputs ocultos para upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="*/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
};

export default TeamChat;
