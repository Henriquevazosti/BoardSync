import { describe, it, expect } from 'vitest'

describe('Teste Básico', () => {
  it('deve funcionar', () => {
    expect(1 + 1).toBe(2)
  })
  
  it('deve criar objetos corretamente', () => {
    const obj = { name: 'test' }
    expect(obj.name).toBe('test')
  })
})
