import { Route, Routes, NavLink } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import ExpensesPage from "./pages/ExpensesPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";

function App() {
  return (
    <div className="app-root">
      <aside className="sidebar">
        <div className="logo">Expense Manager</div>
        <nav className="nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>
            Dashboard
          </NavLink>
          <NavLink to="/expenses" className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>
            Expenses
          </NavLink>
          <NavLink to="/reports" className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>
            Reports
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>
            Settings
          </NavLink>
        </nav>
      </aside>
      <main className="content">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;


