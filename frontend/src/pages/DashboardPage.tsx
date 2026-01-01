import { useEffect, useState } from "react";
import { getExpenseSummary, getBudgets, BudgetStatus } from "../services/api";
import { useCurrency } from "../contexts/CurrencyContext";

interface Summary {
  total: number;
  totalByCategory: Record<string, number>;
}

function DashboardPage() {
  const { formatAmount } = useCurrency();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [budgets, setBudgets] = useState<BudgetStatus[]>([]);
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  useEffect(() => {
    getExpenseSummary().then(setSummary).catch(console.error);
    getBudgets(currentYear, currentMonth).then(setBudgets).catch(console.error);
  }, []);

  const getProgressBarColor = (percentUsed: number) => {
    if (percentUsed >= 100) return "#ef4444";
    if (percentUsed >= 80) return "#f59e0b";
    return "#10b981";
  };

  return (
    <div>
      <h1>Dashboard</h1>
      {summary ? (
        <div className="cards-row">
          <div className="card">
            <h2>Total spent</h2>
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
        </div>
      ) : (
        <p>No data yet. Add some expenses!</p>
      )}

      {budgets.length > 0 && (
        <section className="card" style={{ marginTop: 16 }}>
          <h2>Budget Overview ({currentYear}-{String(currentMonth).padStart(2, "0")})</h2>
          <div style={{ marginTop: 16 }}>
            {budgets.map((budget) => (
              <div
                key={budget.id}
                style={{
                  marginBottom: 20,
                  padding: 12,
                  backgroundColor: budget.percentUsed >= 100 ? "#fef2f2" : "transparent",
                  borderRadius: 8,
                  border: budget.percentUsed >= 100 ? "1px solid #fecaca" : "none"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontWeight: 500 }}>{budget.categoryName}</span>
                  <span style={{ fontSize: 14, color: budget.percentUsed >= 100 ? "#ef4444" : "#64748b" }}>
                    {formatAmount(budget.spent)} / {formatAmount(budget.limitAmount)}
                  </span>
                </div>
                <div
                  style={{
                    width: "100%",
                    height: 8,
                    backgroundColor: "#e2e8f0",
                    borderRadius: 4,
                    overflow: "hidden"
                  }}
                >
                  <div
                    style={{
                      width: `${Math.min(budget.percentUsed, 100)}%`,
                      height: "100%",
                      backgroundColor: getProgressBarColor(budget.percentUsed),
                      transition: "width 0.3s ease"
                    }}
                  />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 13 }}>
                  <span style={{ color: getProgressBarColor(budget.percentUsed) }}>
                    {budget.percentUsed}% used
                  </span>
                  <span style={{ color: budget.remaining < 0 ? "#ef4444" : "#10b981" }}>
                    {budget.remaining >= 0 ? "Remaining: " : "Over by: "}
                    {formatAmount(Math.abs(budget.remaining))}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default DashboardPage;


