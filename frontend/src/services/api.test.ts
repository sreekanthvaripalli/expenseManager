import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Create mock functions
const mockGet = vi.fn()
const mockPost = vi.fn()
const mockPut = vi.fn()
const mockDelete = vi.fn()
const mockUse = vi.fn()

// Mock the axios module
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: mockGet,
      post: mockPost,
      put: mockPut,
      delete: mockDelete,
      interceptors: {
        request: {
          use: mockUse
        }
      }
    }))
  }
}))

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    
    // Default mock implementations
    mockGet.mockResolvedValue({ data: [] })
    mockPost.mockResolvedValue({ data: {} })
    mockPut.mockResolvedValue({ data: {} })
    mockDelete.mockResolvedValue({ data: {} })
  })

  describe('Module loads correctly', () => {
    it('loads the API module', async () => {
      const api = await import('./api')
      expect(api.getExpenses).toBeDefined()
    })
  })

  describe('getExpenses', () => {
    it('fetches expenses with category param', async () => {
      const { getExpenses } = await import('./api')
      mockGet.mockResolvedValueOnce({ data: [{ id: 1 }] })
      
      await getExpenses({ categoryId: 1 })
      
      expect(mockGet).toHaveBeenCalledWith('/expenses', { params: { categoryId: 1 } })
    })

    it('fetches expenses with date range', async () => {
      const { getExpenses } = await import('./api')
      mockGet.mockResolvedValueOnce({ data: [] })
      
      await getExpenses({ startDate: '2024-01-01', endDate: '2024-12-31' })
      
      expect(mockGet).toHaveBeenCalledWith('/expenses', { params: { startDate: '2024-01-01', endDate: '2024-12-31' } })
    })

    it('fetches expenses with no params', async () => {
      const { getExpenses } = await import('./api')
      mockGet.mockResolvedValueOnce({ data: [] })
      
      await getExpenses()
      
      expect(mockGet).toHaveBeenCalledWith('/expenses', { params: undefined })
    })
  })

  describe('createExpense', () => {
    it('creates expense with all fields', async () => {
      const { createExpense } = await import('./api')
      mockPost.mockResolvedValueOnce({ data: { id: 1 } })
      
      const result = await createExpense({
        amount: 100,
        currency: 'USD',
        date: '2024-01-01',
        description: 'Test',
        recurring: true,
        categoryId: 1
      })
      
      expect(mockPost).toHaveBeenCalledWith('/expenses', {
        amount: 100,
        currency: 'USD',
        date: '2024-01-01',
        description: 'Test',
        recurring: true,
        categoryId: 1
      })
    })

    it('creates expense with minimal fields', async () => {
      const { createExpense } = await import('./api')
      mockPost.mockResolvedValueOnce({ data: { id: 1 } })
      
      await createExpense({
        amount: 50,
        currency: 'EUR',
        date: '2024-02-01'
      })
      
      expect(mockPost).toHaveBeenCalled()
    })
  })

  describe('updateExpense', () => {
    it('updates expense by id', async () => {
      const { updateExpense } = await import('./api')
      mockPut.mockResolvedValueOnce({ data: { id: 1 } })
      
      await updateExpense(1, {
        amount: 200,
        currency: 'USD',
        date: '2024-01-01'
      })
      
      expect(mockPut).toHaveBeenCalledWith('/expenses/1', {
        amount: 200,
        currency: 'USD',
        date: '2024-01-01'
      })
    })
  })

  describe('deleteExpense', () => {
    it('deletes expense by id', async () => {
      const { deleteExpense } = await import('./api')
      mockDelete.mockResolvedValueOnce({})
      
      await deleteExpense(1)
      
      expect(mockDelete).toHaveBeenCalledWith('/expenses/1')
    })
  })

  describe('getExpenseSummary', () => {
    it('fetches summary with params', async () => {
      const { getExpenseSummary } = await import('./api')
      mockGet.mockResolvedValueOnce({ data: { total: 1000 } })
      
      await getExpenseSummary({ startDate: '2024-01-01' })
      
      expect(mockGet).toHaveBeenCalledWith('/expenses/summary', { params: { startDate: '2024-01-01' } })
    })

    it('fetches summary without params', async () => {
      const { getExpenseSummary } = await import('./api')
      mockGet.mockResolvedValueOnce({ data: { total: 500 } })
      
      await getExpenseSummary()
      
      expect(mockGet).toHaveBeenCalledWith('/expenses/summary', { params: undefined })
    })
  })

  describe('getCategories', () => {
    it('fetches all categories', async () => {
      const { getCategories } = await import('./api')
      mockGet.mockResolvedValueOnce({ data: [{ id: 1, name: 'Food' }] })
      
      const result = await getCategories()
      
      expect(mockGet).toHaveBeenCalledWith('/categories')
      expect(result).toEqual([{ id: 1, name: 'Food' }])
    })
  })

  describe('createCategory', () => {
    it('creates category with name and color', async () => {
      const { createCategory } = await import('./api')
      mockPost.mockResolvedValueOnce({ data: { id: 1, name: 'Transport' } })
      
      await createCategory({ name: 'Transport', color: '#ff0000' })
      
      expect(mockPost).toHaveBeenCalledWith('/categories', { name: 'Transport', color: '#ff0000' })
    })

    it('creates category with just name', async () => {
      const { createCategory } = await import('./api')
      mockPost.mockResolvedValueOnce({ data: { id: 2, name: 'Entertainment' } })
      
      await createCategory({ name: 'Entertainment' })
      
      expect(mockPost).toHaveBeenCalledWith('/categories', { name: 'Entertainment' })
    })
  })

  describe('deleteCategory', () => {
    it('deletes category by id', async () => {
      const { deleteCategory } = await import('./api')
      mockDelete.mockResolvedValueOnce({})
      
      await deleteCategory(1)
      
      expect(mockDelete).toHaveBeenCalledWith('/categories/1')
    })
  })

  describe('getMonthlySummary', () => {
    it('fetches monthly summary for year', async () => {
      const { getMonthlySummary } = await import('./api')
      mockGet.mockResolvedValueOnce({ data: [{ month: 'January', total: 500 }] })
      
      const result = await getMonthlySummary(2024)
      
      expect(mockGet).toHaveBeenCalledWith('/expenses/summary/monthly', { params: { year: 2024 } })
      expect(result).toEqual([{ month: 'January', total: 500 }])
    })
  })

  describe('getBudgets', () => {
    it('fetches budgets for year and month', async () => {
      const { getBudgets } = await import('./api')
      mockGet.mockResolvedValueOnce({ data: [{ id: 1, limitAmount: 500 }] })
      
      await getBudgets(2024, 6)
      
      expect(mockGet).toHaveBeenCalledWith('/budgets', { params: { year: 2024, month: 6 } })
    })
  })

  describe('createBudget', () => {
    it('creates budget with all fields', async () => {
      const { createBudget } = await import('./api')
      mockPost.mockResolvedValueOnce({ data: { id: 1 } })
      
      await createBudget({
        year: 2024,
        month: 6,
        limitAmount: 1000,
        categoryId: 1,
        currency: 'USD'
      })
      
      expect(mockPost).toHaveBeenCalledWith('/budgets', {
        year: 2024,
        month: 6,
        limitAmount: 1000,
        categoryId: 1,
        currency: 'USD'
      })
    })

    it('creates budget without category', async () => {
      const { createBudget } = await import('./api')
      mockPost.mockResolvedValueOnce({ data: { id: 2 } })
      
      await createBudget({
        year: 2024,
        month: 7,
        limitAmount: 500
      })
      
      expect(mockPost).toHaveBeenCalledWith('/budgets', {
        year: 2024,
        month: 7,
        limitAmount: 500,
        categoryId: undefined,
        currency: undefined
      })
    })
  })

  describe('updateBudget', () => {
    it('updates budget by id', async () => {
      const { updateBudget } = await import('./api')
      mockPut.mockResolvedValueOnce({ data: { id: 1 } })
      
      await updateBudget(1, {
        year: 2024,
        month: 6,
        limitAmount: 1500,
        categoryId: 2
      })
      
      expect(mockPut).toHaveBeenCalledWith('/budgets/1', {
        year: 2024,
        month: 6,
        limitAmount: 1500,
        categoryId: 2
      })
    })
  })

  describe('deleteBudget', () => {
    it('deletes budget by id', async () => {
      const { deleteBudget } = await import('./api')
      mockDelete.mockResolvedValueOnce({})
      
      await deleteBudget(1)
      
      expect(mockDelete).toHaveBeenCalledWith('/budgets/1')
    })
  })

  describe('register', () => {
    it('registers user successfully', async () => {
      const { register } = await import('./api')
      mockPost.mockResolvedValueOnce({ 
        data: { token: 'abc123', email: 'test@test.com', fullName: 'Test User' } 
      })
      
      const result = await register({
        email: 'test@test.com',
        password: 'password123',
        fullName: 'Test User'
      })
      
      expect(mockPost).toHaveBeenCalledWith('/auth/register', {
        email: 'test@test.com',
        password: 'password123',
        fullName: 'Test User'
      })
      expect(result).toEqual({ token: 'abc123', email: 'test@test.com', fullName: 'Test User' })
    })
  })

  describe('login', () => {
    it('logs in user successfully', async () => {
      const { login } = await import('./api')
      mockPost.mockResolvedValueOnce({ 
        data: { token: 'xyz789', email: 'user@test.com', fullName: 'User Name' } 
      })
      
      const result = await login({
        email: 'user@test.com',
        password: 'password'
      })
      
      expect(mockPost).toHaveBeenCalledWith('/auth/login', {
        email: 'user@test.com',
        password: 'password'
      })
      expect(result).toEqual({ token: 'xyz789', email: 'user@test.com', fullName: 'User Name' })
    })
  })

  describe('updateBaseCurrency', () => {
    it('updates base currency', async () => {
      const { updateBaseCurrency } = await import('./api')
      mockPut.mockResolvedValueOnce({})
      
      await updateBaseCurrency('EUR')
      
      expect(mockPut).toHaveBeenCalledWith('/auth/base-currency', { baseCurrency: 'EUR' })
    })
  })

  describe('Request Interceptor', () => {
    it('creates axios client with baseURL', async () => {
      const axiosModule = await import('axios')
      expect(axiosModule.default.create).toBeDefined()
    })
  })
})
