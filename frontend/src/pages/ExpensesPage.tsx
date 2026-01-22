import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createExpense, updateExpense, deleteExpense, getCategories, getExpenses, getBudgets, BudgetStatus } from "../services/api";
import { useCurrency } from "../contexts/CurrencyContext";
import { useAuth } from "../contexts/AuthContext";

interface Category {
  id: number;
  name: string;
}

interface Expense {
  id: number;
  amount: number; // Always in USD (base currency)
  originalAmount?: number; // Original amount entered by user
  originalCurrency?: string; // Original currency entered by user
  date: string;
  description?: string;
  recurring: boolean;
  category?: Category;
}

function ExpensesPage() {
  const { formatAmount, currency: userCurrency } = useCurrency();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<BudgetStatus[]>([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState(userCurrency.code);
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [baseCurrencyError, setBaseCurrencyError] = useState(false);
  const [apiError, setApiError] = useState<{error: string; message: string; type: string} | null>(null);
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const load = () => {
    getExpenses({
      startDate: from || undefined,
      endDate: to || undefined,
      categoryId: selectedCategory ? Number(selectedCategory) : undefined
    })
      .then(setExpenses)
      .catch(console.error);
  };

  useEffect(() => {
    load();
    getCategories().then(setCategories).catch(console.error);
    getBudgets(currentYear, currentMonth).then(setBudgets).catch(console.error);
  }, []);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!amount || !date) return;

    const payload = {
      amount: parseFloat(amount),
      currency: selectedCurrency,
      date,
      description: description || undefined,
      recurring,
      categoryId: selectedCategory ? Number(selectedCategory) : undefined
    };

    const promise = editingId
      ? updateExpense(editingId, payload)
      : createExpense(payload);

    promise
      .then(() => {
        setAmount("");
        setDate("");
        setDescription("");
        setRecurring(false);
        setSelectedCategory("");
        setEditingId(null);
        setBaseCurrencyError(false);
        load();
        getBudgets(currentYear, currentMonth).then(setBudgets).catch(console.error);
      })
      .catch((error) => {
        if (error.response?.data) {
          const errorData = error.response.data;
          if (errorData.error === "BASE_CURRENCY_REQUIRED") {
            setApiError({
              error: "BASE_CURRENCY_REQUIRED",
              message: errorData.message || "Please select your base currency in settings before adding expenses.",
              type: "BUSINESS_ERROR"
            });
          } else if (errorData.error === "BUDGET_REQUIRED") {
            setBaseCurrencyError(true);
          } else {
            setApiError({
              error: errorData.error || "UNKNOWN_ERROR",
              message: errorData.message || "An unexpected error occurred",
              type: errorData.type || "SYSTEM_ERROR"
            });
          }
        } else {
          console.error(error);
          setApiError({
            error: "NETWORK_ERROR",
            message: "Unable to connect to the server. Please check your internet connection.",
            type: "SYSTEM_ERROR"
          });
        }
      });
  };

  const handleEdit = (expense: Expense) => {
    setEditingId(expense.id);
    setAmount(expense.originalAmount?.toString() || expense.amount.toString());
    setSelectedCurrency(expense.originalCurrency || userCurrency.code);
    setDate(expense.date);
    setDescription(expense.description || "");
    setRecurring(expense.recurring);
    setSelectedCategory(expense.category?.id.toString() || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;
    deleteExpense(id)
      .then(() => {
        load();
        getBudgets(currentYear, currentMonth).then(setBudgets).catch(console.error);
      })
      .catch(console.error);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setAmount("");
    setSelectedCurrency(userCurrency.code);
    setDate("");
    setDescription("");
    setRecurring(false);
    setSelectedCategory("");
  };

  const getBudgetWarning = () => {
    if (budgets.length === 0) return null;
    const overBudget = budgets.filter(b => b.percentUsed >= 100);
    const nearLimit = budgets.filter(b => b.percentUsed >= 80 && b.percentUsed < 100);
    
    if (overBudget.length > 0) {
      return {
        type: "error",
        message: `${overBudget.length} budget${overBudget.length > 1 ? "s" : ""} exceeded this month!`
      };
    }
    if (nearLimit.length > 0) {
      return {
        type: "warning",
        message: `${nearLimit.length} budget${nearLimit.length > 1 ? "s are" : " is"} near the limit (≥80%)`
      };
    }
    return null;
  };

  const warning = getBudgetWarning();

  return (
    <div>
      <h1>Expenses</h1>
      
      {baseCurrencyError && (
        <div
          style={{
            padding: 16,
            marginBottom: 16,
            borderRadius: 8,
            backgroundColor: "#eff6ff",
            border: "1px solid #3b82f6",
            color: "#1e40af",
            fontWeight: 500
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <svg style={{ width: 20, height: 20, flexShrink: 0 }} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <strong>Base Currency Setup Required</strong>
          </div>
          <p style={{ margin: 0, fontSize: 14 }}>
            You need to set up a budget first to establish your base currency. This will be the currency all your expenses are stored in for consistent calculations.
          </p>
          <div style={{ marginTop: 12 }}>
            <button
              onClick={() => navigate('/settings')}
              style={{
                backgroundColor: "#3b82f6",
                color: "white",
                padding: "8px 16px",
                borderRadius: 6,
                border: "none",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer"
              }}
            >
              Set Up Budget →
            </button>
          </div>
        </div>
      )}

      {apiError && (
        <div
          style={{
            padding: 16,
            marginBottom: 16,
            borderRadius: 8,
            backgroundColor: apiError.type === "AUTHENTICATION_ERROR" ? "#fef2f2" : "#fffbeb",
            border: `1px solid ${apiError.type === "AUTHENTICATION_ERROR" ? "#fecaca" : "#fde68a"}`,
            color: apiError.type === "AUTHENTICATION_ERROR" ? "#991b1b" : "#92400e",
            fontWeight: 500
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <svg style={{ width: 20, height: 20, flexShrink: 0 }} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <strong>
              {apiError.type === "AUTHENTICATION_ERROR" ? "Authentication Error" :
               apiError.type === "BUSINESS_ERROR" ? "Action Required" :
               "System Error"}
            </strong>
          </div>
          <p style={{ margin: 0, fontSize: 14 }}>
            {apiError.message}
          </p>
          <div style={{ marginTop: 12 }}>
            <button
              onClick={() => setApiError(null)}
              style={{
                backgroundColor: apiError.type === "AUTHENTICATION_ERROR" ? "#dc2626" : "#d97706",
                color: "white",
                padding: "6px 12px",
                borderRadius: 4,
                border: "none",
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer"
              }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {warning && (
        <div
          style={{
            padding: 12,
            marginBottom: 16,
            borderRadius: 8,
            backgroundColor: warning.type === "error" ? "#fef2f2" : "#fffbeb",
            border: `1px solid ${warning.type === "error" ? "#fecaca" : "#fde68a"}`,
            color: warning.type === "error" ? "#991b1b" : "#92400e",
            fontWeight: 500
          }}
        >
          {warning.message}
        </div>
      )}

      <section className="card">
        <h2>{editingId ? "Edit expense" : "Add expense"}</h2>
        <form className="form-grid" onSubmit={onSubmit}>
          <label>
            Amount
            <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
          </label>
          <label>
            Currency
            <select value={selectedCurrency} onChange={(e) => setSelectedCurrency(e.target.value)}>
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="JPY">JPY - Japanese Yen</option>
              <option value="CNY">CNY - Chinese Yuan</option>
              <option value="INR">INR - Indian Rupee</option>
              <option value="AUD">AUD - Australian Dollar</option>
              <option value="CAD">CAD - Canadian Dollar</option>
              <option value="CHF">CHF - Swiss Franc</option>
              <option value="SEK">SEK - Swedish Krona</option>
              <option value="NZD">NZD - New Zealand Dollar</option>
              <option value="SGD">SGD - Singapore Dollar</option>
            </select>
          </label>
          <label>
            Date
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </label>
          <label>
            Category
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="">Uncategorized</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Description
            <input value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
          <label className="checkbox">
            <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} />
            Recurring
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" className="primary-btn">
              {editingId ? "Update" : "Save"}
            </button>
            {editingId && (
              <button type="button" className="secondary-btn" onClick={handleCancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="card">
        <h2>Filter</h2>
        <div className="form-grid">
          <label>
            From
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </label>
          <label>
            To
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </label>
          <label>
            Category
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="">All</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <button className="secondary-btn" onClick={load}>
            Apply
          </button>
        </div>
      </section>

      {budgets.length > 0 && (
        <section className="card">
          <h2>Current Month Budgets</h2>
          <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
            {budgets.map((budget) => (
              <div
                key={budget.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: 10,
                  backgroundColor: budget.percentUsed >= 100 ? "#fef2f2" : "#f8fafc",
                  borderRadius: 6,
                  border: `1px solid ${budget.percentUsed >= 100 ? "#fecaca" : "#e2e8f0"}`
                }}
              >
                <span style={{ fontWeight: 500 }}>{budget.categoryName}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 14 }}>
                    {formatAmount(budget.spent)} / {formatAmount(budget.limitAmount)}
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: budget.percentUsed >= 100 ? "#ef4444" : budget.percentUsed >= 80 ? "#f59e0b" : "#10b981"
                    }}
                  >
                    {budget.percentUsed}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="card">
        <h2>List</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Recurring</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((e) => (
              <tr key={e.id}>
                <td>{e.date}</td>
                <td>{e.description}</td>
                <td>{e.category?.name ?? "-"}</td>
                <td>
                  <div>
                    <div style={{ fontWeight: 500 }}>
                      {e.originalAmount && e.originalCurrency
                        ? `${e.originalCurrency} ${e.originalAmount.toFixed(2)}`
                        : formatAmount(e.amount)}
                    </div>
                    {e.originalAmount && e.originalCurrency && (
                      <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                        {user?.baseCurrency || "USD"} {e.amount.toFixed(2)}
                      </div>
                    )}
                  </div>
                </td>
                <td>{e.recurring ? "Yes" : "No"}</td>
                <td>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      className="secondary-btn"
                      onClick={() => handleEdit(e)}
                      style={{ padding: "4px 12px", fontSize: 13 }}
                    >
                      Edit
                    </button>
                    <button
                      className="secondary-btn"
                      onClick={() => handleDelete(e.id)}
                      style={{ padding: "4px 12px", fontSize: 13, color: "#ef4444" }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default ExpensesPage;
