import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import DataManager from '../components/DataManager/DataManager'
import { initialData } from '../data/initialData'

// Mock para URL.createObjectURL e URL.revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'mocked-url')
global.URL.revokeObjectURL = vi.fn()

// Mock para criar e clicar em link de download
const mockLink = {
  click: vi.fn(),
  setAttribute: vi.fn(),
  style: {}
}
document.createElement = vi.fn(() => mockLink)
document.body.appendChild = vi.fn()
document.body.removeChild = vi.fn()

describe('DataManager Component', () => {
  const mockProps = {
    isOpen: true,
    onClose: vi.fn(),
    data: initialData,
    onImportData: vi.fn(),
    user: { id: 'user-1', name: 'Test User' }
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('não deve renderizar quando isOpen é false', () => {
    render(<DataManager {...mockProps} isOpen={false} />)
    
    expect(screen.queryByText(/gerenciar dados do board/i)).not.toBeInTheDocument()
  })

  it('deve renderizar corretamente quando isOpen é true', () => {
    render(<DataManager {...mockProps} />)
    
    expect(screen.getByText(/gerenciar dados do board/i)).toBeInTheDocument()
    expect(screen.getByText(/exportar dados/i)).toBeInTheDocument()
    expect(screen.getByText(/importar dados/i)).toBeInTheDocument()
  })

  it('deve chamar onClose ao clicar no botão fechar', () => {
    render(<DataManager {...mockProps} />)
    
    const closeButton = screen.getByText('×')
    fireEvent.click(closeButton)
    
    expect(mockProps.onClose).toHaveBeenCalled()
  })

  it('deve chamar onClose ao clicar no botão "Fechar"', () => {
    render(<DataManager {...mockProps} />)
    
    const closeButton = screen.getByText('Fechar')
    fireEvent.click(closeButton)
    
    expect(mockProps.onClose).toHaveBeenCalled()
  })

  describe('Funcionalidade de Exportação', () => {
    it('deve iniciar download ao clicar em exportar', () => {
      render(<DataManager {...mockProps} />)
      
      const exportButton = screen.getByText(/exportar dados do board/i)
      fireEvent.click(exportButton)
      
      // Verificar se URL.createObjectURL foi chamado
      expect(global.URL.createObjectURL).toHaveBeenCalled()
      
      // Verificar se o link foi criado e clicado
      expect(document.createElement).toHaveBeenCalledWith('a')
      expect(mockLink.click).toHaveBeenCalled()
      
      // Verificar se mostrou mensagem de sucesso
      expect(screen.getByText(/dados exportados com sucesso/i)).toBeInTheDocument()
    })

    it('deve gerar nome de arquivo correto', () => {
      render(<DataManager {...mockProps} />)
      
      const exportButton = screen.getByText(/exportar dados do board/i)
      fireEvent.click(exportButton)
      
      // Verificar se o download tem nome correto (formato: boardsync-export-YYYY-MM-DD.json)
      const downloadCall = mockLink.setAttribute.mock.calls.find(call => call[0] === 'download')
      expect(downloadCall[1]).toMatch(/boardsync-export-\d{4}-\d{2}-\d{2}\.json/)
    })
  })

  describe('Funcionalidade de Importação', () => {
    const validImportData = JSON.stringify({
      version: '1.0.0',
      exportDate: '2025-06-29T10:00:00.000Z',
      exportedBy: 'user-1',
      data: {
        users: { 'user-1': { id: 'user-1', name: 'Test User' } },
        activities: {},
        labels: {},
        cards: { 'card-1': { id: 'card-1', title: 'Test Card' } },
        columns: { 'col-1': { id: 'col-1', title: 'Test Column', cardIds: [] } },
        columnOrder: ['col-1']
      }
    })

    it('deve permitir colar dados JSON na textarea', () => {
      render(<DataManager {...mockProps} />)
      
      const textarea = screen.getByPlaceholderText(/cole o conteúdo do arquivo json/i)
      fireEvent.change(textarea, { target: { value: validImportData } })
      
      expect(textarea.value).toBe(validImportData)
    })

    it('deve chamar onImportData com dados válidos', async () => {
      render(<DataManager {...mockProps} />)
      
      const textarea = screen.getByPlaceholderText(/cole o conteúdo do arquivo json/i)
      const importButton = screen.getByText(/importar dados/i)
      
      fireEvent.change(textarea, { target: { value: validImportData } })
      fireEvent.click(importButton)
      
      await waitFor(() => {
        expect(mockProps.onImportData).toHaveBeenCalled()
      })
      
      // Verificar se mostra mensagem de sucesso
      expect(screen.getByText(/dados importados com sucesso/i)).toBeInTheDocument()
    })

    it('deve mostrar erro para JSON inválido', async () => {
      render(<DataManager {...mockProps} />)
      
      const textarea = screen.getByPlaceholderText(/cole o conteúdo do arquivo json/i)
      const importButton = screen.getByText(/importar dados/i)
      
      fireEvent.change(textarea, { target: { value: 'json inválido' } })
      fireEvent.click(importButton)
      
      await waitFor(() => {
        expect(screen.getByText(/erro ao importar dados/i)).toBeInTheDocument()
      })
      
      expect(mockProps.onImportData).not.toHaveBeenCalled()
    })

    it('deve mostrar erro para estrutura inválida', async () => {
      const invalidData = JSON.stringify({ invalid: 'structure' })
      
      render(<DataManager {...mockProps} />)
      
      const textarea = screen.getByPlaceholderText(/cole o conteúdo do arquivo json/i)
      const importButton = screen.getByText(/importar dados/i)
      
      fireEvent.change(textarea, { target: { value: invalidData } })
      fireEvent.click(importButton)
      
      await waitFor(() => {
        expect(screen.getByText(/formato de dados inválido/i)).toBeInTheDocument()
      })
      
      expect(mockProps.onImportData).not.toHaveBeenCalled()
    })

    it('deve mostrar erro quando textarea está vazia', async () => {
      render(<DataManager {...mockProps} />)
      
      const importButton = screen.getByText(/importar dados/i)
      fireEvent.click(importButton)
      
      await waitFor(() => {
        expect(screen.getByText(/por favor, cole os dados json/i)).toBeInTheDocument()
      })
    })

    it('deve limpar textarea ao clicar em "Limpar"', () => {
      render(<DataManager {...mockProps} />)
      
      const textarea = screen.getByPlaceholderText(/cole o conteúdo do arquivo json/i)
      const clearButton = screen.getByText('Limpar')
      
      fireEvent.change(textarea, { target: { value: 'some data' } })
      expect(textarea.value).toBe('some data')
      
      fireEvent.click(clearButton)
      expect(textarea.value).toBe('')
    })

    it('deve desabilitar botões durante importação', async () => {
      render(<DataManager {...mockProps} />)
      
      const textarea = screen.getByPlaceholderText(/cole o conteúdo do arquivo json/i)
      const importButton = screen.getByText(/importar dados/i)
      const clearButton = screen.getByText('Limpar')
      
      fireEvent.change(textarea, { target: { value: validImportData } })
      fireEvent.click(importButton)
      
      // Durante o carregamento, botões devem estar desabilitados
      expect(importButton).toBeDisabled()
      expect(clearButton).toBeDisabled()
      
      await waitFor(() => {
        expect(importButton).not.toBeDisabled()
      })
    })
  })

  describe('Funcionalidade de Upload de Arquivo', () => {
    it('deve processar arquivo JSON válido', () => {
      render(<DataManager {...mockProps} />)
      
      const fileInput = screen.getByLabelText(/selecionar arquivo json/i)
      
      const file = new File([JSON.stringify({ test: 'data' })], 'test.json', {
        type: 'application/json'
      })
      
      // Mock do FileReader
      const mockFileReader = {
        readAsText: vi.fn(),
        onload: null,
        onerror: null,
        result: JSON.stringify({ test: 'data' })
      }
      
      global.FileReader = vi.fn(() => mockFileReader)
      
      fireEvent.change(fileInput, { target: { files: [file] } })
      
      // Simular carregamento do arquivo
      mockFileReader.onload({ target: { result: JSON.stringify({ test: 'data' }) } })
      
      expect(mockFileReader.readAsText).toHaveBeenCalledWith(file)
    })

    it('deve mostrar erro para arquivo não-JSON', () => {
      render(<DataManager {...mockProps} />)
      
      const fileInput = screen.getByLabelText(/selecionar arquivo json/i)
      
      const file = new File(['test'], 'test.txt', { type: 'text/plain' })
      
      fireEvent.change(fileInput, { target: { files: [file] } })
      
      expect(screen.getByText(/selecione um arquivo json válido/i)).toBeInTheDocument()
    })
  })
})
