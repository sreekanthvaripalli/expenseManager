import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getExpenseSummary, getMonthlySummary } from "../services/api";

interface Summary {
  total: number;
  totalByCategory: Record<string, number>;
}

interface MonthlyPoint {
  month: string;
  total: number;
}

function ReportsPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [monthly, setMonthly] = useState<MonthlyPoint[]>([]);
  const year = new Date().getFullYear();

  useEffect(() => {
    getExpenseSummary().then(setSummary).catch(console.error);
    getMonthlySummary(year).then(setMonthly).catch(console.error);
  }, [year]);

  return (
    <div>
      <h1>Reports</h1>
      {summary && (
        <>
          <div className="card">
            <h2>Total</h2>
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
                <Tooltip formatter={(value: number) => `₹${value.toFixed(2)}`} />
                <Bar dataKey="total" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportsPage;


