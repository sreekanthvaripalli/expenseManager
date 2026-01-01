import { useEffect, useState } from "react";
import { getExpenseSummary } from "../services/api";

interface Summary {
  total: number;
  totalByCategory: Record<string, number>;
}

function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    getExpenseSummary().then(setSummary).catch(console.error);
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      {summary ? (
        <div className="cards-row">
          <div className="card">
            <h2>Total spent</h2>
            <p className="amount">₹{summary.total.toFixed(2)}</p>
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
                  <span>₹{value.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <p>No data yet. Add some expenses!</p>
      )}
    </div>
  );
}

export default DashboardPage;


