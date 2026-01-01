import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getExpenseSummary, getMonthlySummary, getBudgets, BudgetStatus } from "../services/api";
import { useCurrency } from "../contexts/CurrencyContext";

interface Summary {
  total: number;
  totalByCategory: Record<string, number>;
}

interface MonthlyPoint {
  month: string;
  total: number;
}

function ReportsPage() {
  const { formatAmount } = useCurrency();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [monthly, setMonthly] = useState<MonthlyPoint[]>([]);
  const [budgets, setBudgets] = useState<BudgetStatus[]>([]);
  const year = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  useEffect(() => {
    getExpenseSummary().then(setSummary).catch(console.error);
    getMonthlySummary(year).then(setMonthly).catch(console.error);
    getBudgets(year, currentMonth).then(setBudgets).catch(console.error);
  }, [year]);

  return (
    <div>
      <h1>Reports</h1>
      {summary && (
        <>
          <div className="card">
            <h2>Total</h2>
            <p className="amount">{formatAmount(summary.total)}</p>
          </div>
          <div className="card">
            <h2>By category</h2>
            <ul>
              {Object.entries(summary.totalByCategory).map(([name, value]) => (
                <li
                  key={name}
                  style={{ display: "flex", justifyContent: "space-between", gap: 12 }}
                >
                  <span>{name}</span>
                  <span>{formatAmount(value)}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {monthly.length > 0 && (
        <div className="card" style={{ marginTop: 16 }}>
          <h2>Monthly trend ({year})</h2>
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={monthly} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(value: number) => formatAmount(value)} />
                <Bar dataKey="total" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {budgets.length > 0 && (
        <div className="card" style={{ marginTop: 16 }}>
          <h2>Budget Performance (Current Month)</h2>
          <div style={{ marginTop: 16 }}>
            {budgets.map((budget) => {
              const performance = ((budget.spent / budget.limitAmount) * 100).toFixed(0);
              const isOver = budget.percentUsed >= 100;
              
              return (
                <div
                  key={budget.id}
                  style={{
                    marginBottom: 20,
                    padding: 16,
                    backgroundColor: isOver ? "#fef2f2" : "#f8fafc",
                    borderRadius: 8,
                    border: `1px solid ${isOver ? "#fecaca" : "#e2e8f0"}`
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <h3 style={{ margin: 0, fontSize: 16 }}>{budget.categoryName}</h3>
                    <span
                      style={{
                        fontWeight: 600,
                        color: isOver ? "#ef4444" : "#10b981"
                      }}
                    >
                      {isOver ? "Over Budget" : "On Track"}
                    </span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>Budget</div>
                      <div style={{ fontSize: 16, fontWeight: 500 }}>{formatAmount(budget.limitAmount)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>Spent</div>
                      <div style={{ fontSize: 16, fontWeight: 500 }}>{formatAmount(budget.spent)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>
                        {budget.remaining >= 0 ? "Remaining" : "Over"}
                      </div>
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: 500,
                          color: budget.remaining >= 0 ? "#10b981" : "#ef4444"
                        }}
                      >
                        {formatAmount(Math.abs(budget.remaining))}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: 10,
                      backgroundColor: "#e2e8f0",
                      borderRadius: 5,
                      overflow: "hidden"
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.min(budget.percentUsed, 100)}%`,
                        height: "100%",
                        backgroundColor: isOver ? "#ef4444" : budget.percentUsed >= 80 ? "#f59e0b" : "#10b981",
                        transition: "width 0.3s ease"
                      }}
                    />
                  </div>
                  <div style={{ marginTop: 8, textAlign: "right", fontSize: 13, color: "#64748b" }}>
                    {performance}% of budget used
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportsPage;


