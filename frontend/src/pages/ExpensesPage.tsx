import { FormEvent, useEffect, useState } from "react";
import { createExpense, updateExpense, deleteExpense, getCategories, getExpenses, getBudgets, BudgetStatus } from "../services/api";
import { useCurrency } from "../contexts/CurrencyContext";

interface Category {
  id: number;
  name: string;
}

interface Expense {
  id: number;
  amount: number;
  date: string;
  description?: string;
  recurring: boolean;
  category?: Category;
}

function ExpensesPage() {
  const { formatAmount } = useCurrency();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<BudgetStatus[]>([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
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
        load();
        getBudgets(currentYear, currentMonth).then(setBudgets).catch(console.error);
      })
      .catch(console.error);
  };

  const handleEdit = (expense: Expense) => {
    setEditingId(expense.id);
    setAmount(expense.amount.toString());
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
                <td>{formatAmount(e.amount)}</td>
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


