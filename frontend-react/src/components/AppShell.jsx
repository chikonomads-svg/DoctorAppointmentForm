import React from 'react';

/**
 * AppShell — Shared navigation shell with TopAppBar + SideNav + BottomNav
 * Based on "Clinical Precision" design from Figma
 */
export default function AppShell({
  activeView,
  onNavigate,
  onNewConsultation,
  user = {},
  backendAvailable,
  children,
}) {
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
      <header className="app-bar">
        <div className="app-bar-brand">
          <span className="app-bar-brand-hindi">आरोग्य क्लिनिक</span>
          <h1 className="app-bar-brand-name">Arogya Clinic</h1>
        </div>
        <div className="app-bar-actions">
          <span className={`status-dot ${backendAvailable ? 'online' : 'offline'}`} />
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

      {/* ── SideNav (Desktop) ── */}
      <nav className="side-nav">
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

        <button className="side-nav-cta" onClick={onNewConsultation}>
          <span className="material-symbols-outlined">add</span>
          New Consultation
        </button>
      </nav>

      {/* ── Main Content ── */}
      <main className="main-content">
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