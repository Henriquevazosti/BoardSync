import { describe, it, expect } from 'vitest'
import {
  formatDate,
  isOverdue,
  isDueToday,
  isDueSoon,
  getDueDateStatus,
  getActivityIcon,
  getActivityDescription,
  sortCardsByDueDate
} from '../data/initialData'

describe('Funções Utilitárias de Data', () => {
  describe('formatDate', () => {
    it('deve retornar string vazia para data nula', () => {
      expect(formatDate(null)).toBe('')
      expect(formatDate(undefined)).toBe('')
      expect(formatDate('')).toBe('')
    })

    it('deve retornar "Hoje" para data de hoje', () => {
      const today = new Date().toISOString()
      expect(formatDate(today)).toBe('Hoje')
    })

    it('deve retornar "Amanhã" para data de amanhã', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      expect(formatDate(tomorrow.toISOString())).toBe('Amanhã')
    })

    it('deve formatar data no formato brasileiro', () => {
      const testDate = '2025-07-15T10:30:00.000Z'
      const formatted = formatDate(testDate)
      expect(formatted).toMatch(/15\/07\/2025/)
    })
  })

  describe('isOverdue', () => {
    it('deve retornar false para data nula', () => {
      expect(isOverdue(null)).toBe(false)
      expect(isOverdue(undefined)).toBe(false)
      expect(isOverdue('')).toBe(false)
    })

    it('deve retornar true para data no passado', () => {
      const pastDate = '2025-01-01T10:30:00.000Z'
      expect(isOverdue(pastDate)).toBe(true)
    })

    it('deve retornar false para data no futuro', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 10)
      expect(isOverdue(futureDate.toISOString())).toBe(false)
    })
  })

  describe('isDueToday', () => {
    it('deve retornar false para data nula', () => {
      expect(isDueToday(null)).toBe(false)
    })

    it('deve retornar true para data de hoje', () => {
      const today = new Date()
      expect(isDueToday(today.toISOString())).toBe(true)
    })

    it('deve retornar false para data de amanhã', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      expect(isDueToday(tomorrow.toISOString())).toBe(false)
    })
  })

  describe('isDueSoon', () => {
    it('deve retornar false para data nula', () => {
      expect(isDueSoon(null)).toBe(false)
    })

    it('deve retornar true para data em 2 dias', () => {
      const soonDate = new Date()
      soonDate.setDate(soonDate.getDate() + 2)
      expect(isDueSoon(soonDate.toISOString())).toBe(true)
    })

    it('deve retornar false para data em 5 dias', () => {
      const laterDate = new Date()
      laterDate.setDate(laterDate.getDate() + 5)
      expect(isDueSoon(laterDate.toISOString())).toBe(false)
    })
  })

  describe('getDueDateStatus', () => {
    it('deve retornar null para data nula', () => {
      expect(getDueDateStatus(null)).toBe(null)
    })

    it('deve retornar "overdue" para data vencida', () => {
      const pastDate = '2025-01-01T10:30:00.000Z'
      expect(getDueDateStatus(pastDate)).toBe('overdue')
    })

    it('deve retornar "due-today" para data de hoje', () => {
      const today = new Date().toISOString()
      expect(getDueDateStatus(today)).toBe('due-today')
    })

    it('deve retornar "due-soon" para data próxima', () => {
      const soonDate = new Date()
      soonDate.setDate(soonDate.getDate() + 2)
      expect(getDueDateStatus(soonDate.toISOString())).toBe('due-soon')
    })

    it('deve retornar "normal" para data distante', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 10)
      expect(getDueDateStatus(futureDate.toISOString())).toBe('normal')
    })
  })
})

describe('Funções de Atividades', () => {
  describe('getActivityIcon', () => {
    it('deve retornar ícone correto para tipos conhecidos', () => {
      expect(getActivityIcon('card_created')).toBe('✨')
      expect(getActivityIcon('card_updated')).toBe('✏️')
      expect(getActivityIcon('card_moved')).toBe('🔄')
      expect(getActivityIcon('card_deleted')).toBe('🗑️')
      expect(getActivityIcon('data_imported')).toBe('📥')
      expect(getActivityIcon('data_exported')).toBe('📤')
    })

    it('deve retornar ícone padrão para tipo desconhecido', () => {
      expect(getActivityIcon('unknown_type')).toBe('📌')
    })
  })

  describe('getActivityDescription', () => {
    const mockUsers = {
      'user-1': { id: 'user-1', name: 'João Silva' }
    }
    
    const mockCards = {
      'card-1': { id: 'card-1', title: 'Teste Card' }
    }

    it('deve gerar descrição correta para criação de card', () => {
      const activity = {
        userId: 'user-1',
        type: 'card_created'
      }
      
      const description = getActivityDescription(activity, mockUsers, mockCards)
      expect(description).toBe('João Silva criou o card')
    })

    it('deve gerar descrição correta para movimentação de card', () => {
      const activity = {
        userId: 'user-1',
        type: 'card_moved',
        oldValue: { column: 'todo' },
        newValue: { column: 'in-progress' }
      }
      
      const description = getActivityDescription(activity, mockUsers, mockCards)
      expect(description).toBe('João Silva moveu o card de "todo" para "in-progress"')
    })

    it('deve gerar descrição correta para importação de dados', () => {
      const activity = {
        userId: 'user-1',
        type: 'data_imported'
      }
      
      const description = getActivityDescription(activity, mockUsers, mockCards)
      expect(description).toBe('João Silva importou dados do board')
    })

    it('deve lidar com usuário desconhecido', () => {
      const activity = {
        userId: 'user-unknown',
        type: 'card_created'
      }
      
      const description = getActivityDescription(activity, mockUsers, mockCards)
      expect(description).toBe('Usuário desconhecido criou o card')
    })
  })
})

describe('Funções de Ordenação', () => {
  describe('sortCardsByDueDate', () => {
    const cards = [
      { id: 'card-1', title: 'Card 1', dueDate: '2025-07-15T10:00:00.000Z' },
      { id: 'card-2', title: 'Card 2', dueDate: null },
      { id: 'card-3', title: 'Card 3', dueDate: '2025-07-10T10:00:00.000Z' },
      { id: 'card-4', title: 'Card 4', dueDate: '2025-07-20T10:00:00.000Z' }
    ]

    it('deve ordenar cards por data de vencimento', () => {
      const sorted = sortCardsByDueDate(cards)
      
      expect(sorted[0].id).toBe('card-3') // 2025-07-10
      expect(sorted[1].id).toBe('card-1') // 2025-07-15
      expect(sorted[2].id).toBe('card-4') // 2025-07-20
      expect(sorted[3].id).toBe('card-2') // sem data (vai para o final)
    })

    it('deve manter array original inalterado', () => {
      const originalLength = cards.length
      const originalFirstCard = cards[0].id
      
      sortCardsByDueDate(cards)
      
      expect(cards.length).toBe(originalLength)
      expect(cards[0].id).toBe(originalFirstCard)
    })

    it('deve lidar com array vazio', () => {
      const result = sortCardsByDueDate([])
      expect(result).toEqual([])
    })
  })
})
