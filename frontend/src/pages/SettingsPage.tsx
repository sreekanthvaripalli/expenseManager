import { FormEvent, useEffect, useState } from "react";
import {
  BudgetStatus,
  createBudget,
  updateBudget,
  createCategory,
  deleteBudget,
  deleteCategory,
  getBudgets,
  getCategories
} from "../services/api";
import { useCurrency, CURRENCIES } from "../contexts/CurrencyContext";

interface Category {
  id: number;
  name: string;
  color?: string;
}

function SettingsPage() {
  const { currency, setCurrency, formatAmount } = useCurrency();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#0ea5e9");
  const [budgets, setBudgets] = useState<BudgetStatus[]>([]);
  const now = new Date();
  const [budgetYear, setBudgetYear] = useState(now.getFullYear());
  const [budgetMonth, setBudgetMonth] = useState(now.getMonth() + 1);
  const [budgetAmount, setBudgetAmount] = useState("");
  const [budgetCategoryId, setBudgetCategoryId] = useState<string>("");
  const [editingBudgetId, setEditingBudgetId] = useState<number | null>(null);

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
      categoryId: budgetCategoryId ? Number(budgetCategoryId) : undefined
    };

    const promise = editingBudgetId
      ? updateBudget(editingBudgetId, payload)
      : createBudget(payload);

    promise
      .then((b) => {
        setBudgetAmount("");
        setBudgetCategoryId("");
        setEditingBudgetId(null);
        setBudgets((prev) => [...prev.filter((x) => x.id !== b.id), b]);
      })
      .catch(console.error);
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
      <section className="card">
        <h2>Currency</h2>
        <div className="form-grid">
          <label>
            Select Currency
            <select
              value={currency.code}
              onChange={(e) => {
                const selected = CURRENCIES.find((c) => c.code === e.target.value);
                if (selected) setCurrency(selected);
              }}
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name} ({c.symbol})
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>
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
            Monthly limit ({currency.symbol})
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


