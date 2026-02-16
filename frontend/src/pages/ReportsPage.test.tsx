import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ReportsPage from './ReportsPage'
import { CurrencyProvider } from '../contexts/CurrencyContext'
import { AuthProvider } from '../contexts/AuthContext'

// Mock API
const mockGetExpenseSummary = vi.fn()
const mockGetMonthlySummary = vi.fn()
const mockGetBudgets = vi.fn()

vi.mock('../services/api', () => ({
  getExpenseSummary: (...args: any[]) => mockGetExpenseSummary(...args),
  getMonthlySummary: (...args: any[]) => mockGetMonthlySummary(...args),
  getBudgets: (...args: any[]) => mockGetBudgets(...args),
}))

// Mock recharts
vi.mock('recharts', () => ({
  Bar: () => null,
  BarChart: () => null,
  CartesianGrid: () => null,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => children,
  Tooltip: () => null,
  XAxis: () => null,
  YAxis: () => null,
}))

describe('ReportsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    
    // Default mock implementations
    mockGetExpenseSummary.mockResolvedValue({
      total: 0,
      totalByCategory: {}
    })
    mockGetMonthlySummary.mockResolvedValue([])
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

  it('renders reports page heading', async () => {
    mockGetExpenseSummary.mockResolvedValueOnce({ total: 0, totalByCategory: {} })
    mockGetMonthlySummary.mockResolvedValueOnce([])
    mockGetBudgets.mockResolvedValueOnce([])
    
    renderWithRouter(<ReportsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Reports')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('displays total amount when summary is loaded', async () => {
    mockGetExpenseSummary.mockResolvedValueOnce({ 
      total: 5000, 
      totalByCategory: {} 
    })
    mockGetMonthlySummary.mockResolvedValueOnce([])
    mockGetBudgets.mockResolvedValueOnce([])
    
    renderWithRouter(<ReportsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Total')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('displays category breakdown when available', async () => {
    mockGetExpenseSummary.mockResolvedValueOnce({ 
      total: 5000, 
      totalByCategory: { 
        'Food': 2000,
        'Transport': 1000,
        'Entertainment': 2000
      } 
    })
    mockGetMonthlySummary.mockResolvedValueOnce([])
    mockGetBudgets.mockResolvedValueOnce([])
    
    renderWithRouter(<ReportsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('By category')).toBeInTheDocument()
      expect(screen.getByText('Food')).toBeInTheDocument()
      expect(screen.getByText('Transport')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('displays monthly trend chart when data available', async () => {
    mockGetExpenseSummary.mockResolvedValueOnce({ total: 0, totalByCategory: {} })
    mockGetMonthlySummary.mockResolvedValueOnce([
      { month: 'Jan', total: 500 },
      { month: 'Feb', total: 800 },
      { month: 'Mar', total: 600 }
    ])
    mockGetBudgets.mockResolvedValueOnce([])
    
    renderWithRouter(<ReportsPage />)
    
    await waitFor(() => {
      expect(screen.getByText(/Monthly trend/)).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('displays budget performance section', async () => {
    mockGetExpenseSummary.mockResolvedValueOnce({ total: 0, totalByCategory: {} })
    mockGetMonthlySummary.mockResolvedValueOnce([])
    mockGetBudgets.mockResolvedValueOnce([
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
    
    renderWithRouter(<ReportsPage />)
    
    await waitFor(() => {
      expect(screen.getByText(/Budget Performance/)).toBeInTheDocument()
      expect(screen.getByText('Food')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('handles over-budget display', async () => {
    mockGetExpenseSummary.mockResolvedValueOnce({ total: 0, totalByCategory: {} })
    mockGetMonthlySummary.mockResolvedValueOnce([])
    mockGetBudgets.mockResolvedValueOnce([
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
    
    renderWithRouter(<ReportsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Over Budget')).toBeInTheDocument()
    }, { timeout: 3000 })
  })
})
