import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Filter, Users, RefreshCw, BarChart2, GitBranch, Database, Menu, ChevronLeft } from 'lucide-react';
import SandersIcon from './components/SandersIcon';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Dashboard from './pages/Dashboard';
import Funnel from './pages/Funnel';
import Segments from './pages/Segments';
import Lifecycle from './pages/Lifecycle';
import DataExplorer from './pages/DataExplorer';
import DataManager from './pages/DataManager';
import Automation from './pages/Automation';
import Cohorts from './pages/Cohorts';
import Retention from './pages/Retention';
import Login from './pages/Login';
import './index.css';

const queryClient = new QueryClient();

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('sidebar_collapsed') === 'true');
  const location = useLocation();
  const navigate = useNavigate();

  const toggle = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    localStorage.setItem('sidebar_collapsed', newState);
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    window.location.href = '/';
  };

  const links = [
    { path: '/', name: 'Dashboard', icon: LayoutDashboard },
    { path: '/funnel', name: 'Funnel Analytics', icon: Filter },
    { path: '/segments', name: 'Segments', icon: Users },
    { path: '/lifecycle', name: 'Lifecycle', icon: RefreshCw },
    { path: '/cohorts', name: 'Cohort Analysis', icon: BarChart2 },
    { path: '/retention-churn', name: 'Retention & Churn', icon: BarChart2 },
    { path: '/automation', name: 'Automation', icon: GitBranch },
    { path: '/data', name: 'Data Explorer', icon: Database },
    { path: '/data-manager', name: 'Data Manager (CRUD)', icon: Users },
  ];

  return (
    <div className="sidebar" style={{ width: collapsed ? 80 : 260, transition: 'width 0.2s', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      <button onClick={toggle} style={{ position: 'absolute', right: -12, top: 20, background: 'white', border: '1px solid #ddd', borderRadius: '50%', padding: 4, cursor: 'pointer', zIndex: 10 }}>
        {collapsed ? <Menu size={16} color="black" /> : <ChevronLeft size={16} color="black" />}
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '3rem', justifyContent: collapsed ? 'center' : 'flex-start', padding: collapsed ? '20px 0' : '20px 0 0 20px' }}>
        <SandersIcon size={32} color="#E4002B" />
        {!collapsed && <h2 style={{ margin: 0, fontWeight: 900, letterSpacing: '-1px' }}>KFC CRM</h2>}
      </div>
      <nav style={{ flex: 1 }}>
        {links.map(link => (
          <NavLink
            key={link.path}
            to={link.path}
            className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
            style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
            title={collapsed ? link.name : ''}
          >
            <link.icon size={20} />
            {!collapsed && link.name}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '10px', borderTop: '1px solid #eee' }}>
        <button
          onClick={logout}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: '10px',
            padding: '10px',
            cursor: 'pointer',
            color: '#666'
          }}
        >
          <SandersIcon size={20} color="#666" />
          {!collapsed && "Logout"}
        </button>
      </div>

      {!collapsed && (
        <div style={{ padding: '20px', fontSize: '0.75rem', opacity: 0.5 }}>
          v2.1.0 Enterprise
        </div>
      )}
    </div>
  );
};

const AuthWrapper = () => {
  const token = localStorage.getItem('auth_token');
  if (!token) return <Login />;

  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/funnel" element={<Funnel />} />
          <Route path="/segments" element={<Segments />} />
          <Route path="/lifecycle" element={<Lifecycle />} />
          <Route path="/automation" element={<Automation />} />
          <Route path="/data" element={<DataExplorer />} />
          <Route path="/data-manager" element={<DataManager />} />
          <Route path="/cohorts" element={<Cohorts />} />
          <Route path="/retention-churn" element={<Retention />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthWrapper />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
