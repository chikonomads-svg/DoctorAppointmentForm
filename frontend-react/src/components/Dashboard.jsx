import React, { useState, useEffect, useCallback } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Dashboard — Arogya Clinic Dashboard View
 * Design from Figma: stat bento grid + recent prescriptions table + bottom cards
 */
export default function Dashboard({ user, onEnterForm, onNewConsultation, onNavigate }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/api/dashboard/stats`);
      if (!res.ok) throw new Error('Failed to load');
      setStats(await res.json());
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const demoPatients = stats?.recent_patients?.length > 0 ? stats.recent_patients : [
    { id: '0842', patient_name: 'Ananya Singh', patient_age: '28', patient_sex: 'Female', provisional_diagnosis: 'Acute Pharyngitis', saved_at: '2023-10-24' },
    { id: '0841', patient_name: 'Rahul Kapoor', patient_age: '45', patient_sex: 'Male', provisional_diagnosis: 'Hypertension', saved_at: '2023-10-24' },
    { id: '0840', patient_name: 'Vikram Prasad', patient_age: '52', patient_sex: 'Male', provisional_diagnosis: 'Type 2 Diabetes', saved_at: '2023-10-24' },
    { id: '0839', patient_name: 'Sana Mirza', patient_age: '12', patient_sex: 'Female', provisional_diagnosis: 'Mild Viral Fever', saved_at: '2023-10-23' },
  ];

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(s => s[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAvatarBg = (name) => {
    const colors = ['primary-fixed', 'secondary-fixed', 'tertiary-fixed', 'error-container'];
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  const getAvatarTextColor = (name) => {
    const colors = ['primary', 'secondary', 'tertiary', 'error'];
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <>
      {/* ── Welcome Header ── */}
      <div className="dash-welcome">
        <h1>Welcome, {user?.name || 'Dr. Deepak Kumar'}</h1>
        <p>Here's an overview of your clinic's activity today.</p>
      </div>

      {/* ── Stat Badges Bento Grid ── */}
      <div className="dash-stats" style={{ marginTop: 'var(--space-xl)' }}>
        <div className="dash-stat-card">
          <div className="dash-stat-header">
            <span className="dash-stat-icon" style={{ color: 'var(--primary)' }}>groups</span>
            <span className="dash-stat-label" style={{ color: 'var(--primary)' }}>Total</span>
          </div>
          <div className="dash-stat-value">{stats?.total_patients || '1,284'}</div>
          <div className="dash-stat-sub">Total Patients</div>
          <div className="dash-stat-bar" style={{ background: 'var(--primary-fixed)' }}>
            <div className="dash-stat-bar-track primary" style={{ width: '70%' }}></div>
          </div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-header">
            <span className="dash-stat-icon" style={{ color: 'var(--success)' }}>today</span>
            <span className="dash-stat-label" style={{ color: 'var(--success)' }}>Today</span>
          </div>
          <div className="dash-stat-value">{stats?.today || '42'}</div>
          <div className="dash-stat-sub">Today's Count</div>
          <div className="dash-stat-bar" style={{ background: 'var(--success-bg)' }}>
            <div className="dash-stat-bar-track success" style={{ width: '45%' }}></div>
          </div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-header">
            <span className="dash-stat-icon" style={{ color: 'var(--purple)' }}>date_range</span>
            <span className="dash-stat-label" style={{ color: 'var(--purple)' }}>Weekly</span>
          </div>
          <div className="dash-stat-value">{stats?.this_week || '218'}</div>
          <div className="dash-stat-sub">This Week's Count</div>
          <div className="dash-stat-bar" style={{ background: 'var(--purple-bg)' }}>
            <div className="dash-stat-bar-track purple" style={{ width: '60%' }}></div>
          </div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-header">
            <span className="dash-stat-icon" style={{ color: 'var(--warning)' }}>person_pin</span>
            <span className="dash-stat-label" style={{ color: 'var(--warning)' }}>Stats</span>
          </div>
          <div className="dash-stat-value">{stats?.avg_age ? `${stats.avg_age}` : '34.2'}</div>
          <div className="dash-stat-sub">Average Age</div>
          <div className="dash-stat-bar" style={{ background: 'var(--warning-bg)' }}>
            <div className="dash-stat-bar-track warning" style={{ width: '82%' }}></div>
          </div>
        </div>
      </div>

      {/* ── Recent Prescriptions Table ── */}
      <section className="dash-table-section">
        <div className="dash-table-header">
          <h3 className="dash-table-title">Recent Prescriptions</h3>
          <div className="dash-table-actions">
            <button className="btn btn-primary" onClick={onNewConsultation}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
              New Prescription
            </button>
            <button className="btn btn-secondary">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>filter_list</span>
              Filter
            </button>
          </div>
        </div>

        {loading && (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--on-surface-variant)' }}>
            <div style={{ width: 24, height: 24, border: '3px solid var(--primary-fixed)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.6s linear infinite', margin: '0 auto 8px' }}></div>
            <span>Loading...</span>
          </div>
        )}
        {error && (
          <div style={{ padding: '12px 16px', background: '#fee2e2', color: '#991b1b', margin: '8px', borderRadius: 'var(--radius)' }}>
            ⚠️ {error} — <button onClick={fetchStats} style={{ background: 'none', border: '1px solid #991b1b', borderRadius: 4, padding: '2px 10px', cursor: 'pointer', color: '#991b1b' }}>Retry</button>
          </div>
        )}

        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Patient Name</th>
                <th>Age</th>
                <th>Sex</th>
                <th>Diagnosis</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {demoPatients.map((p, i) => (
                <tr key={p.id || i} onClick={() => onEnterForm(p.id)}>
                  <td><span className="dash-row-id">{p.id?.slice(-4) || String(i + 1).padStart(4, '0')}</span></td>
                  <td>
                    <div className="dash-patient-cell">
                      <div
                        className="dash-avatar-sm"
                        style={{
                          background: `var(--${getAvatarBg(p.patient_name)})`,
                          color: `var(--${getAvatarTextColor(p.patient_name)})`,
                        }}
                      >
                        {getInitials(p.patient_name)}
                      </div>
                      <span className="dash-patient-name">{p.patient_name || '—'}</span>
                    </div>
                  </td>
                  <td>{p.patient_age ? `${p.patient_age}` : '—'}</td>
                  <td>
                    <span className={`dash-badge dash-badge-${(p.patient_sex || '').toLowerCase()}`}>
                      {p.patient_sex || '—'}
                    </span>
                  </td>
                  <td><span className="dash-diag-text">{p.provisional_diagnosis?.slice(0, 40) || '—'}</span></td>
                  <td><span className="dash-date-text">{p.saved_at?.slice(0, 10) || '—'}</span></td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="dash-action-btn primary" onClick={(e) => { e.stopPropagation(); onEnterForm(p.id); }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>visibility</span>
                    </button>
                    <button className="dash-action-btn default" onClick={(e) => { e.stopPropagation(); }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>print</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="dash-table-footer">
          <span>Showing {demoPatients.length} of {stats?.total_patients || '28'} records</span>
          <div className="dash-pagination">
            <button disabled><span className="material-symbols-outlined" style={{ fontSize: '20px' }}>chevron_left</span></button>
            <button><span className="material-symbols-outlined" style={{ fontSize: '20px' }}>chevron_right</span></button>
          </div>
        </div>
      </section>

      {/* ── Bottom Cards ── */}
      <div className="dash-bottom-grid">
        <div className="dash-insight-card">
          <div style={{
            width: '100%', height: '100%',
            background: 'linear-gradient(135deg, #0b6e8a 0%, #00546b 100%)',
            display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
            padding: 'var(--space-lg)',
          }}>
            <h4 style={{ color: 'white', fontSize: 20, fontWeight: 600 }}>Advanced Diagnostics</h4>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>Our new AI-powered analysis tool is now live.</p>
          </div>
        </div>
        <div className="dash-protocol-card">
          <div>
            <h4>Medical Insight of the Day</h4>
            <p>Proactive screening for cardiovascular health in patients over 40 reduces risk factors by 30% through early intervention.</p>
          </div>
          <button className="dash-protocol-btn">Read Protocol</button>
        </div>
      </div>
    </>
  );
}