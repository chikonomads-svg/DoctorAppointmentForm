import React, { useState } from 'react';

/**
 * AppShell — Shared navigation shell with TopAppBar + collapsible SideNav + BottomNav
 */
export default function AppShell({
  activeView,
  onNavigate,
  onNewConsultation,
  user = {},
  backendAvailable,
  children,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { id: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
    { id: 'patients', icon: 'person_search', label: 'Patients' },
    { id: 'form', icon: 'description', label: 'Prescriptions' },
    { id: 'settings', icon: 'settings', label: 'Settings' },
    { id: 'profile', icon: 'account_circle', label: 'Profile' },
  ];

  const bottomNavItems = [
    { id: 'dashboard', icon: 'home', label: 'Home' },
    { id: 'form', icon: 'description', label: 'Rx' },
    { id: 'patients', icon: 'folder_open', label: 'Patients' },
    { id: 'settings', icon: 'settings', label: 'Settings' },
    { id: 'profile', icon: 'person', label: 'Profile' },
  ];

  return (
    <>
      {/* ── TopAppBar ── */}
      <header className={`app-bar ${sidebarOpen ? '' : 'app-bar-expanded'}`}>
        <div className="app-bar-left">
          <button className="app-bar-btn app-bar-hamburger" onClick={() => setSidebarOpen(s => !s)} title="Toggle Sidebar">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div className="app-bar-brand">
            <span className="app-bar-brand-hindi">आरोग्य क्लिनिक</span>
            <h1 className="app-bar-brand-name">Arogya Clinic</h1>
          </div>
        </div>
        <div className="app-bar-actions">
          <span className={`status-dot ${backendAvailable ? 'online' : 'offline'}`} />
          <button className="app-bar-btn app-bar-cta" onClick={onNewConsultation} title="New Consultation">
            <span className="material-symbols-outlined">add</span>
            <span className="app-bar-cta-label">New Consultation</span>
          </button>
          <button
            className="app-bar-btn"
            onClick={() => onNavigate('profile')}
            title="Profile"
          >
            <span className="material-symbols-outlined">account_circle</span>
          </button>
          <button
            className="app-bar-btn"
            onClick={() => onNavigate('dashboard')}
            title="Dashboard"
          >
            <span className="material-symbols-outlined">grid_view</span>
          </button>
          <button className="app-bar-btn" title="Logout">
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </header>

      {/* ── SideNav (Desktop, collapsible) ── */}
      <nav className={`side-nav ${sidebarOpen ? 'side-nav-open' : 'side-nav-closed'}`}>
        <div className="side-nav-profile">
          <div className="side-nav-avatar">
            <div className="side-nav-avatar-placeholder">
              {(user?.name || 'D')[0].toUpperCase()}
            </div>
          </div>
          <div>
            <p className="side-nav-doctor-name">{user?.name || 'Dr. Deepak Kumar'}</p>
            <p className="side-nav-doctor-reg">MBBS, MD (General Medicine) | Reg: BR/12345</p>
          </div>
        </div>

        <div className="side-nav-links">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`side-nav-link ${activeView === item.id ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      {/* ── Overlay to close sidebar on mobile ── */}
      {sidebarOpen && <div className="side-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* ── Main Content ── */}
      <main className={`main-content ${sidebarOpen ? '' : 'main-content-full'}`}>
        {children}
      </main>

      {/* ── BottomNav (Mobile) ── */}
      <nav className="bottom-nav no-print">
        {bottomNavItems.map(item => (
          <button
            key={item.id}
            className={`bottom-nav-item ${activeView === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="bottom-nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </>
  );
}