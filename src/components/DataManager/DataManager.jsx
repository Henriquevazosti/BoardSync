import React, { useState } from 'react';
import './DataManager.css';

const DataManager = ({ 
  isOpen, 
  onClose, 
  data, 
  onImportData,
  user 
}) => {
  const [importData, setImportData] = useState('');
  const [importStatus, setImportStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  // Função para exportar dados
  const handleExport = () => {
    try {
      // Criar um objeto com todos os dados do board
      const exportData = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        exportedBy: user?.id || 'unknown',
        data: {
          users: data.users,
          activities: data.activities,
          labels: data.labels,
          cards: data.cards,
          columns: data.columns,
          columnOrder: data.columnOrder
        }
      };

      // Converter para JSON com formatação bonita
      const jsonString = JSON.stringify(exportData, null, 2);
      
      // Criar e baixar o arquivo
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `boardsync-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      setImportStatus({
        type: 'success',
        message: 'Dados exportados com sucesso!'
      });
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      setImportStatus({
        type: 'error',
        message: 'Erro ao exportar dados. Verifique o console para mais detalhes.'
      });
    }
  };

  // Função para importar dados
  const handleImport = async () => {
    if (!importData.trim()) {
      setImportStatus({
        type: 'error',
        message: 'Por favor, cole os dados JSON para importar.'
      });
      return;
    }

    setIsLoading(true);
    setImportStatus(null);

    try {
      // Tentar fazer parse do JSON
      const parsedData = JSON.parse(importData);
      
      // Validar estrutura básica
      if (!parsedData.data) {
        throw new Error('Formato de dados inválido: propriedade "data" não encontrada');
      }

      const { data: boardData } = parsedData;

      // Validar propriedades obrigatórias
      const requiredProperties = ['users', 'cards', 'columns', 'columnOrder'];
      for (const prop of requiredProperties) {
        if (!boardData[prop]) {
          throw new Error(`Formato de dados inválido: propriedade "${prop}" não encontrada`);
        }
      }

      // Validar estrutura das colunas
      if (!Array.isArray(boardData.columnOrder) || Object.keys(boardData.columns).length === 0) {
        throw new Error('Dados de colunas inválidos');
      }

      // Preparar dados com propriedades opcionais
      const importedData = {
        users: boardData.users || {},
        activities: boardData.activities || {},
        labels: boardData.labels || {},
        cards: boardData.cards || {},
        columns: boardData.columns || {},
        columnOrder: boardData.columnOrder || []
      };

      // Chamar função de importação
      onImportData(importedData);
      
      setImportStatus({
        type: 'success',
        message: `Dados importados com sucesso! Versão: ${parsedData.version || 'não especificada'}`
      });
      
      // Limpar o campo de importação
      setImportData('');
      
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      setImportStatus({
        type: 'error',
        message: `Erro ao importar dados: ${error.message}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para importar de arquivo
  const handleFileImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/json') {
      setImportStatus({
        type: 'error',
        message: 'Por favor, selecione um arquivo JSON válido.'
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setImportData(e.target.result);
    };
    reader.onerror = () => {
      setImportStatus({
        type: 'error',
        message: 'Erro ao ler o arquivo.'
      });
    };
    reader.readAsText(file);

    // Limpar o input
    event.target.value = '';
  };

  // Função para limpar dados
  const handleClearData = () => {
    setImportData('');
    setImportStatus(null);
  };

  return (
    <div className="data-manager-overlay">
      <div className="data-manager-modal">
        <div className="data-manager-header">
          <h2>Gerenciar Dados do Board</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="data-manager-content">
          {/* Seção de Exportação */}
          <div className="data-section">
            <h3>📤 Exportar Dados</h3>
            <p>
              Exporte todos os dados do board (cards, colunas, usuários, labels, etc.) 
              para um arquivo JSON que pode ser salvo como backup ou compartilhado.
            </p>
            <button 
              className="export-button"
              onClick={handleExport}
            >
              Exportar Dados do Board
            </button>
          </div>

          {/* Seção de Importação */}
          <div className="data-section">
            <h3>📥 Importar Dados</h3>
            <p>
              Importe dados de um arquivo JSON exportado anteriormente. 
              <strong> Atenção:</strong> Isso substituirá todos os dados atuais do board.
            </p>

            {/* Importar por arquivo */}
            <div className="import-file-section">
              <label htmlFor="file-import" className="file-import-label">
                Selecionar arquivo JSON
              </label>
              <input
                id="file-import"
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="file-import-input"
              />
            </div>

            {/* Ou importar por texto */}
            <div className="import-text-section">
              <label htmlFor="import-textarea">
                Ou cole os dados JSON diretamente:
              </label>
              <textarea
                id="import-textarea"
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="Cole o conteúdo do arquivo JSON aqui..."
                rows={10}
                className="import-textarea"
              />
            </div>

            <div className="import-actions">
              <button 
                className="import-button"
                onClick={handleImport}
                disabled={isLoading || !importData.trim()}
              >
                {isLoading ? 'Importando...' : 'Importar Dados'}
              </button>
              <button 
                className="clear-button"
                onClick={handleClearData}
                disabled={isLoading}
              >
                Limpar
              </button>
            </div>
          </div>

          {/* Status da operação */}
          {importStatus && (
            <div className={`status-message ${importStatus.type}`}>
              {importStatus.type === 'success' ? '✅' : '❌'} {importStatus.message}
            </div>
          )}

          {/* Informações sobre o formato */}
          <div className="data-section info-section">
            <h3>ℹ️ Informações sobre o Formato</h3>
            <ul>
              <li>Os dados são salvos em formato JSON padrão</li>
              <li>Inclui versão do formato para compatibilidade futura</li>
              <li>Contém data de exportação e usuário que exportou</li>
              <li>Preserva todas as relações entre cards, labels e usuários</li>
              <li>Histórico de atividades é mantido na importação</li>
            </ul>
          </div>
        </div>

        <div className="data-manager-footer">
          <button className="cancel-button" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataManager;
