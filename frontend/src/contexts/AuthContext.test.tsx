import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider, useAuth } from './AuthContext'

// Test component to access auth context
const TestComponent = ({ onAuthChange }: { onAuthChange?: () => void }) => {
  const { user, login, register, logout, updateBaseCurrency, isAuthenticated, loading } = useAuth()
  
  if (onAuthChange) {
    onAuthChange()
  }
  
  return (
    <div>
      <span data-testid="loading">{loading ? 'loading' : 'loaded'}</span>
      <span data-testid="authenticated">{isAuthenticated ? 'yes' : 'no'}</span>
      <span data-testid="user">{user?.email || 'none'}</span>
      <span data-testid="currency">{user?.baseCurrency || 'none'}</span>
      <button onClick={() => login('test@test.com', 'password')}>Login</button>
      <button onClick={() => register('test@test.com', 'password', 'Test User')}>Register</button>
      <button onClick={() => logout()}>Logout</button>
      <button onClick={() => updateBaseCurrency('USD')}>Update Currency</button>
    </div>
  )
}

// Mock API
const mockLogin = vi.fn()
const mockRegister = vi.fn()

vi.mock('../services/api', () => ({
  login: (...args: any[]) => mockLogin(...args),
  register: (...args: any[]) => mockRegister(...args),
}))

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('provides initial state with no user', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </BrowserRouter>
    )
    
    expect(screen.getByTestId('authenticated').textContent).toBe('no')
    expect(screen.getByTestId('loading').textContent).toBe('loaded')
  })

  it('loads user from localStorage on mount', () => {
    localStorage.setItem('authToken', 'test-token')
    localStorage.setItem('user', JSON.stringify({ email: 'test@test.com', fullName: 'Test User' }))
    
    render(
      <BrowserRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </BrowserRouter>
    )
    
    expect(screen.getByTestId('authenticated').textContent).toBe('yes')
    expect(screen.getByTestId('user').textContent).toBe('test@test.com')
  })

  it('clears localStorage on invalid user data', () => {
    localStorage.setItem('authToken', 'test-token')
    localStorage.setItem('user', 'invalid json')
    
    render(
      <BrowserRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </BrowserRouter>
    )
    
    expect(localStorage.getItem('authToken')).toBeNull()
  })

  it('throws error when useAuth is used outside provider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    expect(() => {
      render(<TestComponent />)
    }).toThrow('useAuth must be used within an AuthProvider')
    
    consoleSpy.mockRestore()
  })

  it('handles login successfully', async () => {
    mockLogin.mockResolvedValueOnce({ 
      token: 'new-token', 
      email: 'test@test.com', 
      fullName: 'Test User',
      baseCurrency: 'USD'
    })
    
    const TestComponentWithAuth = () => {
      const { login } = useAuth()
      return (
        <button onClick={() => login('test@test.com', 'password123')}>Login</button>
      )
    }
    
    render(
      <BrowserRouter>
        <AuthProvider>
          <TestComponentWithAuth />
        </AuthProvider>
      </BrowserRouter>
    )
    
    fireEvent.click(screen.getByText('Login'))
    
    // Wait for async operation
    await new Promise(resolve => setTimeout(resolve, 100))
  })

  it('handles register successfully', async () => {
    mockRegister.mockResolvedValueOnce({ 
      token: 'register-token', 
      email: 'new@test.com', 
      fullName: 'New User',
      baseCurrency: 'EUR'
    })
    
    const TestComponentWithRegister = () => {
      const { register } = useAuth()
      return (
        <button onClick={() => register('new@test.com', 'pass123', 'New User')}>Register</button>
      )
    }
    
    render(
      <BrowserRouter>
        <AuthProvider>
          <TestComponentWithRegister />
        </AuthProvider>
      </BrowserRouter>
    )
    
    fireEvent.click(screen.getByText('Register'))
    
    // Wait for async operation
    await new Promise(resolve => setTimeout(resolve, 100))
  })

  it('handles logout', () => {
    // Set up authenticated state
    localStorage.setItem('authToken', 'test-token')
    localStorage.setItem('user', JSON.stringify({ email: 'test@test.com', fullName: 'Test User' }))
    
    const TestComponentWithLogout = () => {
      const { logout, isAuthenticated } = useAuth()
      return (
        <div>
          <span data-testid="auth">{isAuthenticated ? 'yes' : 'no'}</span>
          <button onClick={logout}>Logout</button>
        </div>
      )
    }
    
    const { rerender } = render(
      <BrowserRouter>
        <AuthProvider>
          <TestComponentWithLogout />
        </AuthProvider>
      </BrowserRouter>
    )
    
    expect(screen.getByTestId('auth').textContent).toBe('yes')
    
    fireEvent.click(screen.getByText('Logout'))
    
    rerender(
      <BrowserRouter>
        <AuthProvider>
          <TestComponentWithLogout />
        </AuthProvider>
      </BrowserRouter>
    )
    
    expect(localStorage.getItem('authToken')).toBeNull()
  })

  it('handles updateBaseCurrency', () => {
    localStorage.setItem('authToken', 'test-token')
    localStorage.setItem('user', JSON.stringify({ email: 'test@test.com', fullName: 'Test User' }))
    
    const TestComponentWithUpdate = () => {
      const { user, updateBaseCurrency } = useAuth()
      return (
        <div>
          <span data-testid="currency">{user?.baseCurrency || 'none'}</span>
          <button onClick={() => updateBaseCurrency('GBP')}>Update</button>
        </div>
      )
    }
    
    render(
      <BrowserRouter>
        <AuthProvider>
          <TestComponentWithUpdate />
        </AuthProvider>
      </BrowserRouter>
    )
    
    fireEvent.click(screen.getByText('Update'))
    
    expect(localStorage.getItem('user')).toContain('GBP')
  })
})
