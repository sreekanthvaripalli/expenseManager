import axios from "axios";

const client = axios.create({
  baseURL: "http://localhost:8080/api"
});

export async function getExpenses(params?: { startDate?: string; endDate?: string }) {
  const res = await client.get("/expenses", { params });
  return res.data;
}

export async function createExpense(payload: {
  amount: number;
  date: string;
  description?: string;
  recurring?: boolean;
  categoryId?: number;
}) {
  const res = await client.post("/expenses", payload);
  return res.data;
}

export async function updateExpense(id: number, payload: {
  amount: number;
  date: string;
  description?: string;
  recurring?: boolean;
  categoryId?: number;
}) {
  const res = await client.put(`/expenses/${id}`, payload);
  return res.data;
}

export async function deleteExpense(id: number) {
  await client.delete(`/expenses/${id}`);
}

export async function getExpenseSummary(params?: { startDate?: string; endDate?: string }) {
  const res = await client.get("/expenses/summary", { params });
  return res.data;
}

export async function getCategories() {
  const res = await client.get("/categories");
  return res.data;
}

export async function createCategory(payload: { name: string; color?: string }) {
  const res = await client.post("/categories", payload);
  return res.data;
}

export async function deleteCategory(id: number) {
  await client.delete(`/categories/${id}`);
}

export async function getMonthlySummary(year: number) {
  const res = await client.get("/expenses/summary/monthly", { params: { year } });
  return res.data as { month: string; total: number }[];
}

export interface BudgetStatus {
  id: number;
  year: number;
  month: number;
  categoryId?: number;
  categoryName: string;
  limitAmount: number;
  spent: number;
  remaining: number;
  percentUsed: number;
}

export async function getBudgets(year: number, month: number) {
  const res = await client.get("/budgets", { params: { year, month } });
  return res.data as BudgetStatus[];
}

export async function createBudget(payload: {
  year: number;
  month: number;
  limitAmount: number;
  categoryId?: number;
}) {
  const res = await client.post("/budgets", payload);
  return res.data as BudgetStatus;
}

export async function updateBudget(id: number, payload: {
  year: number;
  month: number;
  limitAmount: number;
  categoryId?: number;
}) {
  const res = await client.put(`/budgets/${id}`, payload);
  return res.data as BudgetStatus;
}

export async function deleteBudget(id: number) {
  await client.delete(`/budgets/${id}`);
}


