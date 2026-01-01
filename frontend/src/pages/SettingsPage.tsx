import { FormEvent, useEffect, useState } from "react";
import {
  BudgetStatus,
  createBudget,
  createCategory,
  deleteBudget,
  deleteCategory,
  getBudgets,
  getCategories
} from "../services/api";

interface Category {
  id: number;
  name: string;
  color?: string;
}

function SettingsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#0ea5e9");
  const [budgets, setBudgets] = useState<BudgetStatus[]>([]);
  const now = new Date();
  const [budgetYear, setBudgetYear] = useState(now.getFullYear());
  const [budgetMonth, setBudgetMonth] = useState(now.getMonth() + 1);
  const [budgetAmount, setBudgetAmount] = useState("");
  const [budgetCategoryId, setBudgetCategoryId] = useState<string>("");

  const load = () => {
    getCategories().then(setCategories).catch(console.error);
    getBudgets(budgetYear, budgetMonth).then(setBudgets).catch(console.error);
  };

  useEffect(() => {
    load();
  }, []);

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
    createBudget({
      year: budgetYear,
      month: budgetMonth,
      limitAmount: parseFloat(budgetAmount),
      categoryId: budgetCategoryId ? Number(budgetCategoryId) : undefined
    })
      .then((b) => {
        setBudgetAmount("");
        setBudgets((prev) => [...prev.filter((x) => x.id !== b.id), b]);
      })
      .catch(console.error);
  };

  const onBudgetDelete = (id: number) => {
    deleteBudget(id)
      .then(() => setBudgets((prev) => prev.filter((b) => b.id !== id)))
      .catch(console.error);
  };

  return (
    <div>
      <h1>Settings</h1>
      <section className="card">
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
        <form className="form-grid" onSubmit={onBudgetSubmit}>
          <label>
            Year
            <input
              type="number"
              value={budgetYear}
              onChange={(e) => setBudgetYear(Number(e.target.value))}
              min={2000}
              max={2100}
            />
          </label>
          <label>
            Month
            <input
              type="number"
              value={budgetMonth}
              onChange={(e) => setBudgetMonth(Number(e.target.value))}
              min={1}
              max={12}
            />
          </label>
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
            Monthly limit
            <input
              type="number"
              step="0.01"
              value={budgetAmount}
              onChange={(e) => setBudgetAmount(e.target.value)}
              required
            />
          </label>
          <button type="submit" className="primary-btn">
            Add budget
          </button>
        </form>
        <ul>
          {budgets.map((b) => (
            <li
              key={b.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                marginTop: 8
              }}
            >
              <span style={{ flex: 1 }}>
                {b.categoryName} – {b.year}-{String(b.month).padStart(2, "0")}
              </span>
              <span>
                ₹{b.spent.toFixed(2)} / ₹{b.limitAmount.toFixed(2)} ({b.percentUsed}%)
              </span>
              <button className="secondary-btn" onClick={() => onBudgetDelete(b.id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default SettingsPage;


