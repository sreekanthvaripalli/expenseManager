import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import LoginPage from './LoginPage'
import { AuthProvider } from '../contexts/AuthContext'

// Mock useAuth
const mockLogin = vi.fn()
const mockNavigate = vi.fn()

vi.mock('../contexts/AuthContext', async () => {
  const actual = await vi.importActual('../contexts/AuthContext')
  return {
    ...actual,
    useAuth: () => ({
      login: mockLogin,
    }),
  }
})

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLogin.mockResolvedValue(undefined)
  })

  const renderWithRouter = (component: React.ReactElement) => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          {component}
        </AuthProvider>
      </BrowserRouter>
    )
  }

  it('renders login form', () => {
    renderWithRouter(<LoginPage />)
    
    expect(screen.getAllByText('Sign In').length).toBeGreaterThan(0)
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument()
  })

  it('shows error message on failed login', async () => {
    mockLogin.mockRejectedValue({
      response: {
        data: {
          error: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
          type: 'AUTHENTICATION_ERROR'
        }
      }
    })

    renderWithRouter(<LoginPage />)
    
    const emailInput = screen.getByPlaceholderText('Enter your email')
    const passwordInput = screen.getByPlaceholderText('Enter your password')
    const buttons = screen.getAllByText('Sign In')
    const submitButton = buttons[buttons.length - 1] as HTMLElement

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Login Error')).toBeInTheDocument()
    })
  })

  it('navigates on successful login', async () => {
    renderWithRouter(<LoginPage />)
    
    const emailInput = screen.getByPlaceholderText('Enter your email')
    const passwordInput = screen.getByPlaceholderText('Enter your password')
    const buttons = screen.getAllByText('Sign In')
    const submitButton = buttons[buttons.length - 1] as HTMLElement

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  })

  it('has link to register page', () => {
    renderWithRouter(<LoginPage />)
    
    const registerLinks = screen.getAllByText('Sign up')
    expect(registerLinks.length).toBeGreaterThan(0)
  })
})
