import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import RegisterPage from './RegisterPage'
import { AuthProvider } from '../contexts/AuthContext'

// Mock useAuth
const mockRegister = vi.fn()
const mockNavigate = vi.fn()

vi.mock('../contexts/AuthContext', async () => {
  const actual = await vi.importActual('../contexts/AuthContext')
  return {
    ...actual,
    useAuth: () => ({
      register: mockRegister,
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

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRegister.mockResolvedValue(undefined)
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

  it('renders registration form', () => {
    renderWithRouter(<RegisterPage />)
    
    expect(screen.getAllByText('Create Account').length).toBeGreaterThan(0)
    expect(screen.getByPlaceholderText('Enter your full name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Create a password (min 6 characters)')).toBeInTheDocument()
  })

  it('shows error when passwords do not match', async () => {
    renderWithRouter(<RegisterPage />)
    
    fireEvent.change(screen.getByPlaceholderText('Enter your full name'), { target: { value: 'John Doe' } })
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByPlaceholderText('Create a password (min 6 characters)'), { target: { value: 'password123' } })
    fireEvent.change(screen.getByPlaceholderText('Confirm your password'), { target: { value: 'differentpassword' } })
    
    const buttons = screen.getAllByText('Create Account')
    fireEvent.click(buttons[buttons.length - 1])

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
    })
  })

  it('shows error when password is too short', async () => {
    renderWithRouter(<RegisterPage />)
    
    fireEvent.change(screen.getByPlaceholderText('Enter your full name'), { target: { value: 'John Doe' } })
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByPlaceholderText('Create a password (min 6 characters)'), { target: { value: '123' } })
    fireEvent.change(screen.getByPlaceholderText('Confirm your password'), { target: { value: '123' } })
    
    const buttons = screen.getAllByText('Create Account')
    fireEvent.click(buttons[buttons.length - 1])

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument()
    })
  })

  it('navigates on successful registration', async () => {
    renderWithRouter(<RegisterPage />)
    
    fireEvent.change(screen.getByPlaceholderText('Enter your full name'), { target: { value: 'John Doe' } })
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByPlaceholderText('Create a password (min 6 characters)'), { target: { value: 'password123' } })
    fireEvent.change(screen.getByPlaceholderText('Confirm your password'), { target: { value: 'password123' } })
    
    const buttons = screen.getAllByText('Create Account')
    fireEvent.click(buttons[buttons.length - 1])

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  })

  it('has link to login page', () => {
    renderWithRouter(<RegisterPage />)
    
    const loginLinks = screen.getAllByText('Sign in')
    expect(loginLinks.length).toBeGreaterThan(0)
  })
})
