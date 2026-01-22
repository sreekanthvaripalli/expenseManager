import { Route, Routes, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardPage from "./pages/DashboardPage";
import ExpensesPage from "./pages/ExpensesPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

function AppContent() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (isAuthenticated) {
    return (
      <div className="app-root">
        <aside className="sidebar">
          <div className="logo">Expense Manager</div>
          <div className="user-info">
            <div className="user-name">Welcome, {user?.fullName}</div>
            <div className="user-email">{user?.email}</div>
          </div>
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
          <div className="logout-section">
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </aside>
        <main className="content">
          <Routes>
            <Route path="/" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/expenses" element={
              <ProtectedRoute>
                <ExpensesPage />
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute>
                <ReportsPage />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="*" element={<LoginPage />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
