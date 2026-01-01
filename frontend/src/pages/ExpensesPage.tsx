import { FormEvent, useEffect, useState } from "react";
import { createExpense, getCategories, getExpenses } from "../services/api";

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
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [recurring, setRecurring] = useState(false);

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
  }, []);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!amount || !date) return;
    createExpense({
      amount: parseFloat(amount),
      date,
      description: description || undefined,
      recurring,
      categoryId: selectedCategory ? Number(selectedCategory) : undefined
    })
      .then(() => {
        setAmount("");
        setDate("");
        setDescription("");
        setRecurring(false);
        load();
      })
      .catch(console.error);
  };

  return (
    <div>
      <h1>Expenses</h1>
      <section className="card">
        <h2>Add expense</h2>
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
          <button type="submit" className="primary-btn">
            Save
          </button>
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
            </tr>
          </thead>
          <tbody>
            {expenses.map((e) => (
              <tr key={e.id}>
                <td>{e.date}</td>
                <td>{e.description}</td>
                <td>{e.category?.name ?? "-"}</td>
                <td>₹{e.amount.toFixed(2)}</td>
                <td>{e.recurring ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default ExpensesPage;


