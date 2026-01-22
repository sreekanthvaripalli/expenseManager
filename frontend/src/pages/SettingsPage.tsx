import { FormEvent, useEffect, useState } from "react";
import {
  BudgetStatus,
  createBudget,
  updateBudget,
  createCategory,
  deleteBudget,
  deleteCategory,
  getBudgets,
  getCategories,
  updateBaseCurrency
} from "../services/api";
import { useCurrency, CURRENCIES } from "../contexts/CurrencyContext";
import { useAuth } from "../contexts/AuthContext";

interface Category {
  id: number;
  name: string;
  color?: string;
}

function SettingsPage() {
  const { currency, setCurrency, formatAmount } = useCurrency();
  const { user, updateBaseCurrency } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#0ea5e9");
  const [budgets, setBudgets] = useState<BudgetStatus[]>([]);
  const now = new Date();
  const [budgetYear, setBudgetYear] = useState(now.getFullYear());
  const [budgetMonth, setBudgetMonth] = useState(now.getMonth() + 1);
  const [budgetAmount, setBudgetAmount] = useState("");
  const [budgetCategoryId, setBudgetCategoryId] = useState<string>("");
  const [budgetCurrency, setBudgetCurrency] = useState<string>("INR");
  const [editingBudgetId, setEditingBudgetId] = useState<number | null>(null);
  const [apiError, setApiError] = useState<{error: string; message: string; type: string} | null>(null);

  const load = () => {
    getCategories().then(setCategories).catch(console.error);
  };

  const loadBudgets = () => {
    getBudgets(budgetYear, budgetMonth).then(setBudgets).catch(console.error);
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    loadBudgets();
  }, [budgetYear, budgetMonth]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name) return;
    createCategory({ name, color })
      .then(() => {
        setName("");
        load();
      })
      .catch(console.error);
  };

  const onDelete = (id: number) => {
    deleteCategory(id)
      .then(load)
      .catch(console.error);
  };

  const onBudgetSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!budgetAmount) return;

    const payload = {
      year: budgetYear,
      month: budgetMonth,
      limitAmount: parseFloat(budgetAmount),
      categoryId: budgetCategoryId ? Number(budgetCategoryId) : undefined,
      currency: !user?.baseCurrency && !editingBudgetId ? budgetCurrency : undefined
    };

    const promise = editingBudgetId
      ? updateBudget(editingBudgetId, payload)
      : createBudget(payload);

    promise
      .then((b) => {
        setBudgetAmount("");
        setBudgetCategoryId("");
        setEditingBudgetId(null);
        setApiError(null);
        setBudgets((prev) => [...prev.filter((x) => x.id !== b.id), b]);

        // If we just set the base currency, update the contexts
        if (!user?.baseCurrency && !editingBudgetId && budgetCurrency) {
          updateBaseCurrency(budgetCurrency);
          const selectedCurrency = CURRENCIES.find((c) => c.code === budgetCurrency);
          if (selectedCurrency) {
            setCurrency(selectedCurrency);
          }
        }
      })
      .catch((error) => {
        if (error.response?.data) {
          const errorData = error.response.data;
          setApiError({
            error: errorData.error || "UNKNOWN_ERROR",
            message: errorData.message || "An unexpected error occurred",
            type: errorData.type || "SYSTEM_ERROR"
          });
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

  const handleBudgetEdit = (budget: BudgetStatus) => {
    setEditingBudgetId(budget.id);
    setBudgetAmount(budget.limitAmount.toString());
    setBudgetCategoryId(budget.categoryId?.toString() || "");
    setBudgetYear(budget.year);
    setBudgetMonth(budget.month);
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  const handleCancelBudgetEdit = () => {
    setEditingBudgetId(null);
    setBudgetAmount("");
    setBudgetCategoryId("");
  };

  const onBudgetDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this budget?")) return;
    deleteBudget(id)
      .then(() => {
        setBudgets((prev) => prev.filter((b) => b.id !== id));
        if (editingBudgetId === id) {
          setEditingBudgetId(null);
          setBudgetAmount("");
          setBudgetCategoryId("");
        }
      })
      .catch(console.error);
  };

  const getProgressBarColor = (percentUsed: number) => {
    if (percentUsed >= 100) return "#ef4444";
    if (percentUsed >= 80) return "#f59e0b";
    return "#10b981";
  };

  const monthName = new Date(budgetYear, budgetMonth - 1).toLocaleString("default", { month: "long" });

  const navigateMonth = (direction: number) => {
    const newDate = new Date(budgetYear, budgetMonth - 1 + direction, 1);
    setBudgetYear(newDate.getFullYear());
    setBudgetMonth(newDate.getMonth() + 1);
  };

  return (
    <div>
      <h1>Settings</h1>

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


      <section className="card" style={{ marginTop: 16 }}>
        <h2>Categories</h2>
        <form className="form-grid" onSubmit={onSubmit}>
          <label>
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label>
            Color
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
          </label>
          <button type="submit" className="primary-btn">
            Add
          </button>
        </form>
        <ul>
          {categories.map((c) => (
            <li key={c.id} style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
              <span
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  backgroundColor: c.color || "#64748b"
                }}
              />
              <span style={{ flex: 1 }}>{c.name}</span>
              <button className="secondary-btn" onClick={() => onDelete(c.id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      </section>
      <section className="card" style={{ marginTop: 16 }}>
        <h2>Budgets</h2>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <button className="secondary-btn" onClick={() => navigateMonth(-1)}>
            ← Previous
          </button>
          <h3 style={{ margin: 0 }}>{monthName} {budgetYear}</h3>
          <button className="secondary-btn" onClick={() => navigateMonth(1)}>
            Next →
          </button>
        </div>
        <form className="form-grid" onSubmit={onBudgetSubmit}>
          {!user?.baseCurrency && !editingBudgetId && (
            <div style={{
              gridColumn: "1 / -1",
              padding: 16,
              backgroundColor: "#eff6ff",
              border: "1px solid #3b82f6",
              borderRadius: 8,
              marginBottom: 16
            }}>
              <h4 style={{ margin: "0 0 8px 0", color: "#1e40af" }}>Set Up Your Base Currency</h4>
              <p style={{ margin: "0 0 12px 0", fontSize: 14, color: "#3730a3" }}>
                Choose your preferred currency for expense tracking. All expenses will be converted and stored in this currency.
              </p>
              <label style={{ display: "block", marginBottom: 8 }}>
                Base Currency
                <select
                  value={budgetCurrency}
                  onChange={(e) => setBudgetCurrency(e.target.value)}
                  style={{ width: "100%", marginTop: 4 }}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name} ({c.symbol})
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
          <label>
            Category
            <select
              value={budgetCategoryId}
              onChange={(e) => setBudgetCategoryId(e.target.value)}
            >
              <option value="">All expenses</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Monthly limit ({user?.baseCurrency ? currency.symbol : budgetCurrency === "INR" ? "₹" : budgetCurrency === "USD" ? "$" : budgetCurrency === "EUR" ? "€" : budgetCurrency})
            <input
              type="number"
              step="0.01"
              value={budgetAmount}
              onChange={(e) => setBudgetAmount(e.target.value)}
              required
            />
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" className="primary-btn">
              {editingBudgetId ? "Update budget" : "Add budget"}
            </button>
            {editingBudgetId && (
              <button type="button" className="secondary-btn" onClick={handleCancelBudgetEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>
        <div style={{ marginTop: 20 }}>
          {budgets.length === 0 ? (
            <p style={{ color: "#64748b", textAlign: "center", padding: "20px 0" }}>
              No budgets set for this month
            </p>
          ) : (
            budgets.map((b) => (
              <div
                key={b.id}
                style={{
                  marginBottom: 16,
                  padding: 16,
                  backgroundColor: b.percentUsed >= 100 ? "#fef2f2" : "#f8fafc",
                  borderRadius: 8,
                  border: `1px solid ${b.percentUsed >= 100 ? "#fecaca" : "#e2e8f0"}`
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontWeight: 600, fontSize: 16 }}>{b.categoryName}</span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button 
                      className="secondary-btn" 
                      onClick={() => handleBudgetEdit(b)}
                      style={{ padding: "4px 12px", fontSize: 13 }}
                    >
                      Edit
                    </button>
                    <button 
                      className="secondary-btn" 
                      onClick={() => onBudgetDelete(b.id)}
                      style={{ padding: "4px 12px", fontSize: 13, color: "#ef4444" }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14 }}>
                  <span>Spent</span>
                  <span style={{ fontWeight: 500 }}>{formatAmount(b.spent)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14 }}>
                  <span>Limit</span>
                  <span style={{ fontWeight: 500 }}>{formatAmount(b.limitAmount)}</span>
                </div>
                <div
                  style={{
                    width: "100%",
                    height: 12,
                    backgroundColor: "#e2e8f0",
                    borderRadius: 6,
                    overflow: "hidden",
                    marginBottom: 8
                  }}
                >
                  <div
                    style={{
                      width: `${Math.min(b.percentUsed, 100)}%`,
                      height: "100%",
                      backgroundColor: getProgressBarColor(b.percentUsed),
                      transition: "width 0.3s ease"
                    }}
                  />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: getProgressBarColor(b.percentUsed), fontWeight: 500 }}>
                    {b.percentUsed}% used
                  </span>
                  <span style={{ color: b.remaining < 0 ? "#ef4444" : "#10b981", fontWeight: 500 }}>
                    {b.remaining >= 0 ? "Remaining: " : "Over by: "}
                    {formatAmount(Math.abs(b.remaining))}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default SettingsPage;
