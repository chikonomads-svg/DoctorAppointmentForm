import React, { useState, useEffect, useCallback } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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

  const recentPatients = stats?.recent_patients || [];

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
        <p>{user?.name || 'Dr. Deepak Kumar'} — Your Trusted Healthcare Partner. We provide guideline-directed comprehensive care for Diabetes, Blood Pressure, Thyroid, Asthma, COPD, and Abdominal diseases, prioritizing your long-term wellness.</p>
        <div className="dash-welcome-meta">
          <span><span className="material-symbols-outlined" style={{fontSize:16,verticalAlign:'text-bottom'}}>location_on</span> Muzaffarpur, Bihar</span>
          <span><span className="material-symbols-outlined" style={{fontSize:16,verticalAlign:'text-bottom'}}>call</span> +91 9199943818</span>
        </div>
      </div>

      {/* ── Stat Badges Bento Grid ── */}
      <div className="dash-stats" style={{ marginTop: 'var(--space-xl)' }}>
        <div className="dash-stat-card">
          <div className="dash-stat-header">
            <span className="dash-stat-icon" style={{ color: 'var(--primary)' }}>groups</span>
            <span className="dash-stat-label" style={{ color: 'var(--primary)' }}>Total</span>
          </div>
          <div className="dash-stat-value">{stats?.total_patients ?? '—'}</div>
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
          <div className="dash-stat-value">{stats?.today ?? '—'}</div>
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
          <div className="dash-stat-value">{stats?.this_week ?? '—'}</div>
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
          <div className="dash-stat-value">{stats?.avg_age ?? '—'}</div>
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
              {!loading && !error && recentPatients.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--on-surface-variant)' }}>
                    No prescriptions found yet. Start by creating a new prescription.
                  </td>
                </tr>
              )}
              {recentPatients.map((p, i) => (
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && (
          <div className="dash-table-footer">
            <span>Showing {recentPatients.length} of {stats?.total_patients || '0'} records</span>
          </div>
        )}
      </section>

      {/* ── Bottom Cards ── */}
      <div className="dash-bottom-grid">
        <div className="dash-insight-card">
          <div style={{
            width: '100%', height: '100%',
            background: 'linear-gradient(135deg, #0b6e8a 0%, #00546b 100%)',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            padding: 'var(--space-lg)',
            gap: 'var(--space-base)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
              <span className="material-symbols-outlined" style={{ color: 'white', fontSize: 24 }}>school</span>
              <h4 style={{ color: 'white', fontSize: 18, fontWeight: 600 }}>Academic Excellence</h4>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, lineHeight: 1.5 }}>
              With foundational training from SKMCH and advanced MD General medicine specialization from DMCH Darbhanga, Dr. Deepak Kumar brings institutional expertise to private practice.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginTop: 'auto' }}>
              <span className="material-symbols-outlined" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 20 }}>verified_user</span>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>MBBS (SKMCH) · MD General Medicine (DMCH Darbhanga)</span>
            </div>
          </div>
        </div>
        <div className="dash-protocol-card">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--on-primary-container)', fontSize: 24 }}>patient_list</span>
              <h4>Why Choose Our Practice</h4>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-base)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-sm)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--on-primary-container)' }}>medical_services</span>
                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>Modern Facility — Equipped with latest diagnostic tools</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-sm)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--on-primary-container)' }}>verified_user</span>
                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>Verified Experience — Trusted name in Muzaffarpur medical community</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-sm)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--on-primary-container)' }}>favorite</span>
                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>Patient First — Tailored treatment plans with empathy</p>
              </div>
            </div>
          </div>
          <button className="dash-protocol-btn" onClick={() => onNavigate('profile')}>
            View Full Profile
          </button>
        </div>
      </div>
    </>
  );
}