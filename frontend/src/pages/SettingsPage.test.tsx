import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import SettingsPage from './SettingsPage'
import { CurrencyProvider } from '../contexts/CurrencyContext'
import { AuthProvider } from '../contexts/AuthContext'

// Mock API
const mockGetCategories = vi.fn()
const mockGetBudgets = vi.fn()
const mockCreateCategory = vi.fn()
const mockDeleteCategory = vi.fn()
const mockCreateBudget = vi.fn()
const mockUpdateBudget = vi.fn()
const mockDeleteBudget = vi.fn()

vi.mock('../services/api', () => ({
  getCategories: (...args: any[]) => mockGetCategories(...args),
  getBudgets: (...args: any[]) => mockGetBudgets(...args),
  createCategory: (...args: any[]) => mockCreateCategory(...args),
  deleteCategory: (...args: any[]) => mockDeleteCategory(...args),
  createBudget: (...args: any[]) => mockCreateBudget(...args),
  updateBudget: (...args: any[]) => mockUpdateBudget(...args),
  deleteBudget: (...args: any[]) => mockDeleteBudget(...args),
}))

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    
    // Default mock implementations
    mockGetCategories.mockResolvedValue([])
    mockGetBudgets.mockResolvedValue([])
  })

  const renderWithRouter = (component: React.ReactElement) => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <CurrencyProvider>
            {component}
          </CurrencyProvider>
        </AuthProvider>
      </BrowserRouter>
    )
  }

  it('renders settings page heading', async () => {
    mockGetCategories.mockResolvedValue([])
    mockGetBudgets.mockResolvedValue([])
    
    renderWithRouter(<SettingsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('displays categories section', async () => {
    mockGetCategories.mockResolvedValue([
      { id: 1, name: 'Food', color: '#ff0000' }
    ])
    mockGetBudgets.mockResolvedValue([])
    
    renderWithRouter(<SettingsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Categories')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('displays budgets section', async () => {
    mockGetCategories.mockResolvedValue([])
    mockGetBudgets.mockResolvedValue([
      { 
        id: 1, 
        year: 2024, 
        month: 1, 
        categoryId: 1, 
        categoryName: 'Food', 
        limitAmount: 500, 
        spent: 200, 
        remaining: 300, 
        percentUsed: 40 
      }
    ])
    
    renderWithRouter(<SettingsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Budgets')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('displays month navigation', async () => {
    mockGetCategories.mockResolvedValue([])
    mockGetBudgets.mockResolvedValue([])
    
    renderWithRouter(<SettingsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('← Previous')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('navigates to next month', async () => {
    mockGetCategories.mockResolvedValue([])
    mockGetBudgets.mockResolvedValue([])
    
    renderWithRouter(<SettingsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Next →')).toBeInTheDocument()
    }, { timeout: 3000 })
    
    fireEvent.click(screen.getByText('Next →'))
  })

  it('navigates to previous month', async () => {
    mockGetCategories.mockResolvedValue([])
    mockGetBudgets.mockResolvedValue([])
    
    renderWithRouter(<SettingsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('← Previous')).toBeInTheDocument()
    }, { timeout: 3000 })
    
    fireEvent.click(screen.getByText('← Previous'))
  })

  it('displays progress bar with 80% usage (warning color)', async () => {
    mockGetCategories.mockResolvedValue([])
    mockGetBudgets.mockResolvedValue([
      { 
        id: 1, 
        year: 2024, 
        month: 1, 
        categoryId: 1, 
        categoryName: 'Food', 
        limitAmount: 500, 
        spent: 400, 
        remaining: 100, 
        percentUsed: 80 
      }
    ])
    
    renderWithRouter(<SettingsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('80% used')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('displays progress bar with 100%+ usage (over budget)', async () => {
    mockGetCategories.mockResolvedValue([])
    mockGetBudgets.mockResolvedValue([
      { 
        id: 1, 
        year: 2024, 
        month: 1, 
        categoryId: 1, 
        categoryName: 'Entertainment', 
        limitAmount: 200, 
        spent: 300, 
        remaining: -100, 
        percentUsed: 150 
      }
    ])
    
    renderWithRouter(<SettingsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('150% used')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('displays "Remaining" text for positive remaining', async () => {
    mockGetCategories.mockResolvedValue([])
    mockGetBudgets.mockResolvedValue([
      { 
        id: 1, 
        year: 2024, 
        month: 1, 
        categoryId: 1, 
        categoryName: 'Food', 
        limitAmount: 500, 
        spent: 200, 
        remaining: 300, 
        percentUsed: 40 
      }
    ])
    
    renderWithRouter(<SettingsPage />)
    
    await waitFor(() => {
      expect(screen.getByText(/Remaining:/)).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('displays "Over by" text for negative remaining', async () => {
    mockGetCategories.mockResolvedValue([])
    mockGetBudgets.mockResolvedValue([
      { 
        id: 1, 
        year: 2024, 
        month: 1, 
        categoryId: 1, 
        categoryName: 'Food', 
        limitAmount: 500, 
        spent: 600, 
        remaining: -100, 
        percentUsed: 120 
      }
    ])
    
    renderWithRouter(<SettingsPage />)
    
    await waitFor(() => {
      expect(screen.getByText(/Over by:/)).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('displays base currency setup when user has no baseCurrency', async () => {
    mockGetCategories.mockResolvedValue([])
    mockGetBudgets.mockResolvedValue([])
    
    renderWithRouter(<SettingsPage />)
    
    await waitFor(() => {
      expect(screen.getByText(/Set Up Your Base Currency/)).toBeInTheDocument()
    }, { timeout: 3000 })
  })
})
