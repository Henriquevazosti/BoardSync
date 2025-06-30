import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Login from '../components/Login/Login'

describe('Login Component - Testes Simplificados', () => {
  const mockProps = {
    onLogin: vi.fn(),
    onGoToRegister: vi.fn()
  }

  it('deve renderizar sem erros', () => {
    expect(() => {
      render(<Login {...mockProps} />)
    }).not.toThrow()
  })

  it('deve ter um input de email', () => {
    render(<Login {...mockProps} />)
    const emailInput = screen.getByLabelText(/email/i)
    expect(emailInput).toBeInTheDocument()
  })

  it('deve ter um input de senha', () => {
    render(<Login {...mockProps} />)
    const passwordInput = screen.getByLabelText(/senha/i)
    expect(passwordInput).toBeInTheDocument()
  })

  it('deve ter um botão de entrar', () => {
    render(<Login {...mockProps} />)
    const submitButton = screen.getByRole('button', { name: /entrar/i })
    expect(submitButton).toBeInTheDocument()
  })
})
