import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Login from '../components/Login/Login'

describe('Login Component', () => {
  it('deve renderizar o formulário de login', () => {
    const mockOnLogin = vi.fn()
    const mockOnGoToRegister = vi.fn()
    
    render(
      <Login 
        onLogin={mockOnLogin} 
        onGoToRegister={mockOnGoToRegister}
      />
    )

    // Verificar se os elementos principais estão presentes
    expect(screen.getByText('BoardSync')).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
  })

  it('deve permitir inserir email e senha', async () => {
    const mockOnLogin = vi.fn()
    const mockOnGoToRegister = vi.fn()
    
    render(
      <Login 
        onLogin={mockOnLogin} 
        onGoToRegister={mockOnGoToRegister}
      />
    )

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/senha/i)

    // Inserir dados nos campos
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    // Verificar se os valores foram inseridos
    expect(emailInput.value).toBe('test@example.com')
    expect(passwordInput.value).toBe('password123')
  })

  it('deve chamar onLogin ao submeter o formulário com dados válidos', async () => {
    const mockOnLogin = vi.fn()
    const mockOnGoToRegister = vi.fn()
    
    render(
      <Login 
        onLogin={mockOnLogin} 
        onGoToRegister={mockOnGoToRegister}
      />
    )

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/senha/i)
    const submitButton = screen.getByRole('button', { name: /entrar/i })

    // Preencher o formulário
    fireEvent.change(emailInput, { target: { value: 'ana.silva@company.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    // Submeter o formulário
    fireEvent.click(submitButton)

    // Verificar se onLogin foi chamado
    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalled()
    })
  })

  it('deve chamar onGoToRegister ao clicar no link de registro', () => {
    const mockOnLogin = vi.fn()
    const mockOnGoToRegister = vi.fn()
    
    render(
      <Login 
        onLogin={mockOnLogin} 
        onGoToRegister={mockOnGoToRegister}
      />
    )

    const registerLink = screen.getByText(/criar cadastro/i)
    fireEvent.click(registerLink)

    expect(mockOnGoToRegister).toHaveBeenCalled()
  })

  it('deve mostrar erro para email inválido', async () => {
    const mockOnLogin = vi.fn()
    const mockOnGoToRegister = vi.fn()
    
    render(
      <Login 
        onLogin={mockOnLogin} 
        onGoToRegister={mockOnGoToRegister}
      />
    )

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/senha/i)
    const submitButton = screen.getByRole('button', { name: /entrar/i })

    // Preencher com email inválido
    fireEvent.change(emailInput, { target: { value: 'email-invalido' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    // Submeter o formulário
    fireEvent.click(submitButton)

    // Verificar se aparece mensagem de erro
    await waitFor(() => {
      expect(screen.getByText(/email ou senha incorretos/i)).toBeInTheDocument()
    })

    // onLogin não deve ter sido chamado
    expect(mockOnLogin).not.toHaveBeenCalled()
  })
})
