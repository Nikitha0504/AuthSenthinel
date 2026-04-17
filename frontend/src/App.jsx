import React from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { LayoutDashboard, FileText, AlertTriangle, Key, LogOut } from 'lucide-react';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LogViewer from './pages/LogViewer';
import Alerts from './pages/Alerts';
import TokenInspector from './pages/TokenInspector';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// Layout component
const Layout = ({ children }) => {
  const { logout, user } = useAuth();
  const location = useLocation();

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={18} /> },
    { name: 'Log Viewer', path: '/logs', icon: <FileText size={18} /> },
    { name: 'Alerts', path: '/alerts', icon: <AlertTriangle size={18} /> },
    { name: 'JWT Inspector', path: '/inspector', icon: <Key size={18} /> },
  ];

  return (
    <div className="flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: '260px',
        background: 'rgba(20, 21, 31, 0.8)',
        borderRight: '1px solid var(--border-color)',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'linear-gradient(135deg, var(--accent-cyan), #007bb5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#000' }}>
            IO
          </div>
          <h2 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1.25rem' }}>IdentityOps</h2>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {navLinks.map(link => (
            <Link key={link.path} to={link.path} style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)', textDecoration: 'none',
              background: location.pathname === link.path ? 'rgba(0, 240, 255, 0.1)' : 'transparent',
              color: location.pathname === link.path ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              transition: 'all 0.2s'
            }}>
              {link.icon}
              <span style={{ fontWeight: location.pathname === link.path ? 600 : 400 }}>{link.name}</span>
            </Link>
          ))}
        </nav>

        <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            {user?.email} ({user?.role})
          </p>
          <button onClick={logout} className="btn" style={{ width: '100%', justifyContent: 'flex-start', background: 'transparent', color: 'var(--text-secondary)', padding: '0.5rem 0' }}>
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
};

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
      <Route path="/logs" element={<ProtectedRoute><Layout><LogViewer /></Layout></ProtectedRoute>} />
      <Route path="/alerts" element={<ProtectedRoute><Layout><Alerts /></Layout></ProtectedRoute>} />
      <Route path="/inspector" element={<ProtectedRoute><Layout><TokenInspector /></Layout></ProtectedRoute>} />
    </Routes>
  );
};

export default App;
