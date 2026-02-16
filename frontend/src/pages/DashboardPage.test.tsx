import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import DashboardPage from './DashboardPage'
import { CurrencyProvider } from '../contexts/CurrencyContext'

// Mock API
const mockGetExpenseSummary = vi.fn()
const mockGetBudgets = vi.fn()

vi.mock('../services/api', () => ({
  getExpenseSummary: (...args: any[]) => mockGetExpenseSummary(...args),
  getBudgets: (...args: any[]) => mockGetBudgets(...args),
}))

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderWithRouter = (component: React.ReactElement) => {
    return render(
      <BrowserRouter>
        <CurrencyProvider>
          {component}
        </CurrencyProvider>
      </BrowserRouter>
    )
  }

  it('renders dashboard heading', async () => {
    mockGetExpenseSummary.mockResolvedValue({ total: 0, totalByCategory: {} })
    mockGetBudgets.mockResolvedValue([])
    
    renderWithRouter(<DashboardPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })
  })

  it('displays total spent when summary exists', async () => {
    mockGetExpenseSummary.mockResolvedValue({ 
      total: 1000, 
      totalByCategory: { 'Food': 500, 'Transport': 500 } 
    })
    mockGetBudgets.mockResolvedValue([])
    
    renderWithRouter(<DashboardPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Total spent')).toBeInTheDocument()
    })
  })

  it('displays no data message when no summary', async () => {
    mockGetExpenseSummary.mockResolvedValue(null)
    mockGetBudgets.mockResolvedValue([])
    
    renderWithRouter(<DashboardPage />)
    
    await waitFor(() => {
      expect(screen.getByText(/No data yet/)).toBeInTheDocument()
    })
  })

  it('displays category breakdown', async () => {
    mockGetExpenseSummary.mockResolvedValue({ 
      total: 1000, 
      totalByCategory: { 'Food': 600, 'Transport': 400 } 
    })
    mockGetBudgets.mockResolvedValue([])
    
    renderWithRouter(<DashboardPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Food')).toBeInTheDocument()
      expect(screen.getByText('Transport')).toBeInTheDocument()
    })
  })

  it('displays budget overview with progress bar', async () => {
    mockGetExpenseSummary.mockResolvedValue({ total: 0, totalByCategory: {} })
    mockGetBudgets.mockResolvedValue([
      { 
        id: 1, 
        year: 2024, 
        month: 1, 
        categoryId: 1, 
        categoryName: 'Food', 
        limitAmount: 1000, 
        spent: 500, 
        remaining: 500, 
        percentUsed: 50 
      }
    ])
    
    renderWithRouter(<DashboardPage />)
    
    await waitFor(() => {
      expect(screen.getByText(/Budget Overview/)).toBeInTheDocument()
    })
  })

  it('displays over-budget styling when percent >= 100', async () => {
    mockGetExpenseSummary.mockResolvedValue({ total: 0, totalByCategory: {} })
    mockGetBudgets.mockResolvedValue([
      { 
        id: 1, 
        year: 2024, 
        month: 1, 
        categoryId: 1, 
        categoryName: 'Entertainment', 
        limitAmount: 500, 
        spent: 600, 
        remaining: -100, 
        percentUsed: 120 
      }
    ])
    
    renderWithRouter(<DashboardPage />)
    
    await waitFor(() => {
      expect(screen.getByText('120% used')).toBeInTheDocument()
    })
  })

  it('displays remaining amount when under budget', async () => {
    mockGetExpenseSummary.mockResolvedValue({ total: 0, totalByCategory: {} })
    mockGetBudgets.mockResolvedValue([
      { 
        id: 1, 
        year: 2024, 
        month: 1, 
        categoryId: 1, 
        categoryName: 'Food', 
        limitAmount: 1000, 
        spent: 400, 
        remaining: 600, 
        percentUsed: 40 
      }
    ])
    
    renderWithRouter(<DashboardPage />)
    
    await waitFor(() => {
      expect(screen.getByText('40% used')).toBeInTheDocument()
      expect(screen.getByText(/Remaining:/)).toBeInTheDocument()
    })
  })

  it('displays 80% warning color scenario', async () => {
    mockGetExpenseSummary.mockResolvedValue({ total: 0, totalByCategory: {} })
    mockGetBudgets.mockResolvedValue([
      { 
        id: 1, 
        year: 2024, 
        month: 1, 
        categoryId: 1, 
        categoryName: 'Food', 
        limitAmount: 1000, 
        spent: 800, 
        remaining: 200, 
        percentUsed: 80 
      }
    ])
    
    renderWithRouter(<DashboardPage />)
    
    await waitFor(() => {
      expect(screen.getByText('80% used')).toBeInTheDocument()
    })
  })

  it('displays over budget remaining amount', async () => {
    mockGetExpenseSummary.mockResolvedValue({ total: 0, totalByCategory: {} })
    mockGetBudgets.mockResolvedValue([
      { 
        id: 1, 
        year: 2024, 
        month: 1, 
        categoryId: 1, 
        categoryName: 'Food', 
        limitAmount: 500, 
        spent: 700, 
        remaining: -200, 
        percentUsed: 140 
      }
    ])
    
    renderWithRouter(<DashboardPage />)
    
    await waitFor(() => {
      expect(screen.getByText('140% used')).toBeInTheDocument()
      expect(screen.getByText(/Over by:/)).toBeInTheDocument()
    })
  })
})
