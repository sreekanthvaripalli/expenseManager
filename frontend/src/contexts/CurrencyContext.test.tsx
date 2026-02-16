import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CurrencyProvider, useCurrency, CURRENCIES } from './CurrencyContext'

const TestComponent = () => {
  const { currency, setCurrency, formatAmount } = useCurrency()
  return (
    <div>
      <span data-testid="currency">{currency.code}</span>
      <span data-testid="formatted">{formatAmount(100)}</span>
      <button onClick={() => setCurrency(CURRENCIES[0])}>Change</button>
    </div>
  )
}

describe('CurrencyContext', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('provides default currency', () => {
    render(
      <CurrencyProvider>
        <TestComponent />
      </CurrencyProvider>
    )
    expect(screen.getByTestId('currency').textContent).toBe('INR')
  })

  it('formats amount correctly', () => {
    render(
      <CurrencyProvider>
        <TestComponent />
      </CurrencyProvider>
    )
    expect(screen.getByTestId('formatted').textContent).toBe('₹100.00')
  })

  it('updates currency when setCurrency is called', async () => {
    render(
      <CurrencyProvider>
        <TestComponent />
      </CurrencyProvider>
    )
    
    await userEvent.click(screen.getByText('Change'))
    
    expect(screen.getByTestId('currency').textContent).toBe('USD')
    expect(screen.getByTestId('formatted').textContent).toBe('$100.00')
  })

  it('throws error when useCurrency is used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    expect(() => {
      render(<TestComponent />)
    }).toThrow('useCurrency must be used within CurrencyProvider')
    
    consoleSpy.mockRestore()
  })

  it('loads currency from localStorage', () => {
    localStorage.setItem('selectedCurrency', JSON.stringify(CURRENCIES[1])) // EUR
    
    render(
      <CurrencyProvider>
        <TestComponent />
      </CurrencyProvider>
    )
    
    expect(screen.getByTestId('currency').textContent).toBe('EUR')
  })

  it('saves currency to localStorage when changed', async () => {
    render(
      <CurrencyProvider>
        <TestComponent />
      </CurrencyProvider>
    )
    
    await userEvent.click(screen.getByText('Change'))
    
    expect(localStorage.getItem('selectedCurrency')).toContain('USD')
  })
})
