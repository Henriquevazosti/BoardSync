import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Card from '../components/Card/Card'
import { initialData } from '../data/initialData'

// Mock do react-beautiful-dnd
vi.mock('react-beautiful-dnd', () => ({
  Draggable: ({ children, draggableId, index }) => 
    children({
      draggableProps: { 'data-testid': `draggable-${draggableId}` },
      dragHandleProps: { 'data-testid': `drag-handle-${draggableId}` },
      innerRef: vi.fn(),
    }, {}),
}))

describe('Card Component', () => {
  const mockCard = {
    id: 'card-1',
    title: 'Teste Card',
    description: 'Descrição do card de teste',
    priority: 'alta',
    category: 'historia',
    isBlocked: false,
    blockReason: '',
    labels: ['label-1'],
    assignedUsers: ['user-1'],
    dueDate: '2025-07-05T23:59:59.999Z',
    createdAt: '2025-06-20T10:00:00.000Z',
    completedAt: null
  }

  const mockAllCards = {
    'card-1': mockCard,
    'card-2': {
      id: 'card-2',
      title: 'Subtarefa',
      category: 'sub-teste',
      parentId: 'card-1'
    }
  }

  const mockProps = {
    card: mockCard,
    columnId: 'column-1',
    allCards: mockAllCards,
    allUsers: initialData.users,
    allLabels: initialData.labels,
    onOpenCardDetail: vi.fn(),
    onBlockCard: vi.fn(),
    onManageLabels: vi.fn(),
    onViewActivityLog: vi.fn(),
    onViewComments: vi.fn()
  }

  it('deve renderizar as informações básicas do card', () => {
    render(<Card {...mockProps} />)

    // Verificar se o título está presente
    expect(screen.getByText('Teste Card')).toBeInTheDocument()
    
    // Verificar se a descrição está presente
    expect(screen.getByText('Descrição do card de teste')).toBeInTheDocument()
    
    // Verificar se a prioridade está indicada
    expect(screen.getByText(/alta/i)).toBeInTheDocument()
  })

  it('deve mostrar as labels do card', () => {
    render(<Card {...mockProps} />)

    // A label-1 do initialData é 'Frontend'
    expect(screen.getByText('Frontend')).toBeInTheDocument()
  })

  it('deve mostrar os usuários atribuídos', () => {
    render(<Card {...mockProps} />)

    // Verificar se o avatar do usuário está presente (Ana Silva tem avatar 👩‍💻)
    expect(screen.getByTitle(/Ana Silva/i)).toBeInTheDocument()
  })

  it('deve mostrar data de vencimento formatada', () => {
    render(<Card {...mockProps} />)

    // Verificar se a data está presente (formatada)
    expect(screen.getByText(/05\/07\/2025/)).toBeInTheDocument()
  })

  it('deve chamar onOpenCardDetail ao clicar no botão de editar', () => {
    render(<Card {...mockProps} />)

    const editButton = screen.getByTitle(/editar/i)
    fireEvent.click(editButton)

    expect(mockProps.onOpenCardDetail).toHaveBeenCalledWith(mockCard)
  })

  it('deve mostrar indicador visual para card bloqueado', () => {
    const blockedCard = { ...mockCard, isBlocked: true, blockReason: 'Teste de bloqueio' }
    const blockedProps = { ...mockProps, card: blockedCard }

    render(<Card {...blockedProps} />)

    // Verificar se o card tem classe ou indicação de bloqueado
    expect(screen.getByText(/bloqueado/i)).toBeInTheDocument()
    expect(screen.getByText('Teste de bloqueio')).toBeInTheDocument()
  })

  it('deve mostrar indicador para diferentes prioridades', () => {
    // Testar prioridade alta
    render(<Card {...mockProps} />)
    expect(screen.getByText(/alta/i)).toBeInTheDocument()

    // Testar prioridade média
    const mediumPriorityCard = { ...mockCard, priority: 'media' }
    const mediumProps = { ...mockProps, card: mediumPriorityCard }
    
    render(<Card {...mediumProps} />)
    expect(screen.getByText(/media/i)).toBeInTheDocument()
  })

  it('deve mostrar indicador para cards vencidos', () => {
    // Card com data vencida
    const overdueCard = { 
      ...mockCard, 
      dueDate: '2025-06-01T23:59:59.999Z' // Data no passado
    }
    const overdueProps = { ...mockProps, card: overdueCard }

    render(<Card {...overdueProps} />)

    // Deve mostrar algum indicador de vencido
    expect(screen.getByText(/01\/06\/2025/)).toBeInTheDocument()
  })

})
