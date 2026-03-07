import React, { useState, useEffect, useCallback } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const COMORB_COLORS = {
    'Diabetes': '#f97316',
    'Hypertension': '#ef4444',
    'COPD': '#8b5cf6',
    'TB': '#06b6d4',
    'Thyroid': '#84cc16',
    'CAD': '#ec4899',
    'CKD': '#f59e0b',
    'Stroke': '#6366f1',
};

const COMORB_ICONS = {
    'Diabetes': '🍬', 'Hypertension': '💊', 'COPD': '🫁', 'TB': '🦠',
    'Thyroid': '🔵', 'CAD': '❤️', 'CKD': '🫘', 'Stroke': '🧠',
};

const SEX_COLORS = { Male: '#3b82f6', Female: '#ec4899', Other: '#84cc16' };
const AGE_COLORS = { '<18': '#06b6d4', '18-40': '#3b82f6', '41-60': '#f59e0b', '>60': '#ef4444' };

function StatCard({ icon, label, value, sub, color = '#3b82f6', trend }) {
    return (
        <div className="dash-stat-card" style={{ '--accent': color }}>
            <div className="dash-stat-icon">{icon}</div>
            <div className="dash-stat-body">
                <div className="dash-stat-value">{value ?? '—'}</div>
                <div className="dash-stat-label">{label}</div>
                {sub && <div className="dash-stat-sub">{sub}</div>}
            </div>
            {trend !== undefined && (
                <div className={`dash-stat-trend ${trend >= 0 ? 'up' : 'down'}`}>
                    {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}
                </div>
            )}
        </div>
    );
}

function BarChart({ data, colors, title }) {
    const max = Math.max(...Object.values(data).map(Number), 1);
    return (
        <div className="dash-chart">
            <h3 className="dash-chart-title">{title}</h3>
            <div className="dash-bars">
                {Object.entries(data).map(([key, val]) => (
                    <div key={key} className="dash-bar-row">
                        <span className="dash-bar-label">{COMORB_ICONS[key] || ''} {key}</span>
                        <div className="dash-bar-track">
                            <div
                                className="dash-bar-fill"
                                style={{
                                    width: `${(Number(val) / max) * 100}%`,
                                    background: colors?.[key] || '#3b82f6',
                                }}
                            />
                        </div>
                        <span className="dash-bar-count">{val}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function PieChart({ data, colors, title }) {
    const total = Object.values(data).reduce((s, v) => s + Number(v), 0) || 1;
    let startAngle = 0;
    const SIZE = 120, CX = 60, CY = 60, R = 50;

    const slices = Object.entries(data).map(([key, val]) => {
        const pct = Number(val) / total;
        const angle = pct * 360;
        const large = angle > 180 ? 1 : 0;
        const x1 = CX + R * Math.cos((Math.PI * startAngle) / 180);
        const y1 = CY + R * Math.sin((Math.PI * startAngle) / 180);
        startAngle += angle;
        const x2 = CX + R * Math.cos((Math.PI * startAngle) / 180);
        const y2 = CY + R * Math.sin((Math.PI * startAngle) / 180);
        const d = `M ${CX} ${CY} L ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} Z`;
        return { key, val, pct, d };
    });

    return (
        <div className="dash-chart">
            <h3 className="dash-chart-title">{title}</h3>
            <div className="dash-pie-wrap">
                <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
                    {slices.map(({ key, d }) => (
                        <path key={key} d={d} fill={colors?.[key] || '#3b82f6'} stroke="#0d1117" strokeWidth="2" />
                    ))}
                </svg>
                <div className="dash-pie-legend">
                    {slices.map(({ key, val, pct }) => (
                        <div key={key} className="dash-pie-legend-item">
                            <span className="dash-pie-dot" style={{ background: colors?.[key] || '#3b82f6' }} />
                            <span>{key}</span>
                            <span className="dash-pie-pct">{val} ({(pct * 100).toFixed(0)}%)</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function Dashboard({ user, onEnterForm, onLogout }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const t = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    const fetchStats = useCallback(async () => {
        setLoading(true); setError('');
        try {
            const res = await fetch(`${API}/api/dashboard/stats`);
            if (!res.ok) throw new Error('Failed to load stats');
            setStats(await res.json());
        } catch (e) {
            setError(e.message);
        }
        setLoading(false);
    }, []);

    useEffect(() => { fetchStats(); }, [fetchStats]);

    const greeting = () => {
        const h = time.getHours();
        if (h < 12) return '🌅 Good Morning';
        if (h < 17) return '☀️ Good Afternoon';
        return '🌙 Good Evening';
    };

    const filtered = stats?.recent_patients?.filter(p =>
        !search || (p.patient_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.provisional_diagnosis || '').toLowerCase().includes(search.toLowerCase())
    ) || [];

    const comorbStats = stats?.comorbidities || {};
    const hasComorbData = Object.values(comorbStats).some(Number);

    return (
        <div className="dash-root">
            {/* Header */}
            <div className="dash-header">
                <div className="dash-header-left">
                    <div className="dash-logo">🩺</div>
                    <div>
                        <h1 className="dash-title">Dr Deepak</h1>
                        <p className="dash-subtitle">Smart Prescription &amp; Patient Management</p>
                    </div>
                </div>
                <div className="dash-header-right">
                    <div className="dash-clock">
                        <span className="dash-time">{time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="dash-date">{time.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                    </div>
                    <button className="dash-new-btn" onClick={onEnterForm}>✏️ New Prescription</button>
                    <div className="dash-user-chip">
                        <span className="dash-avatar">{(user?.name || 'D')[0].toUpperCase()}</span>
                        <span className="dash-uname">{user?.name || 'Doctor'}</span>
                        <button className="dash-logout" onClick={onLogout} title="Logout">⏻</button>
                    </div>
                </div>
            </div>

            <div className="dash-body">
                {/* Greeting */}
                <div className="dash-greeting">
                    <h2>{greeting()}, {(user?.name || 'Doctor').split(' ')[0]}!</h2>
                    <p>Here's your patient overview for today</p>
                </div>

                {loading && (
                    <div className="dash-loading">
                        <div className="dash-spinner" />
                        <span>Loading your dashboard…</span>
                    </div>
                )}

                {error && (
                    <div className="dash-error-banner">
                        ⚠️ {error} — <button onClick={fetchStats}>Retry</button>
                    </div>
                )}

                {stats && (
                    <>
                        {/* Stat cards */}
                        <div className="dash-stats-grid">
                            <StatCard icon="👥" label="Total Patients" value={stats.total_patients} color="#3b82f6" />
                            <StatCard icon="📅" label="Today" value={stats.today} color="#10b981" />
                            <StatCard icon="📊" label="This Week" value={stats.this_week} color="#8b5cf6" />
                            <StatCard icon="🎂" label="Avg Age" value={stats.avg_age ? `${stats.avg_age} yr` : '—'} color="#f97316" />
                        </div>

                        {/* Charts row */}
                        <div className="dash-charts-row">
                            {hasComorbData && (
                                <BarChart data={comorbStats} colors={COMORB_COLORS} title="Comorbidity Distribution" />
                            )}
                            {stats.sex_distribution && Object.keys(stats.sex_distribution).length > 0 && (
                                <PieChart data={stats.sex_distribution} colors={SEX_COLORS} title="Gender Split" />
                            )}
                            {stats.age_groups && Object.values(stats.age_groups).some(Number) && (
                                <PieChart data={stats.age_groups} colors={AGE_COLORS} title="Age Groups" />
                            )}
                        </div>

                        {/* Recent patients */}
                        <div className="dash-recent">
                            <div className="dash-recent-header">
                                <h3>📋 Recent Patients</h3>
                                <input
                                    className="dash-search"
                                    placeholder="🔍 Search by name or diagnosis…"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>

                            <div className="dash-table-wrap">
                                <table className="dash-table">
                                    <thead>
                                        <tr>
                                            <th>#</th><th>Name</th><th>Age</th><th>Sex</th>
                                            <th>Diagnosis</th><th>Comorbidities</th><th>Date</th><th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.length === 0 ? (
                                            <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#8b949e' }}>
                                                {search ? 'No matching patients' : 'No patients recorded yet'}
                                            </td></tr>
                                        ) : filtered.map((p, i) => {
                                            const tags = [];
                                            if (p.cb_diabetes) tags.push('🍬 DM');
                                            if (p.cb_hypertension) tags.push('💊 HTN');
                                            if (p.cb_copd) tags.push('🫁 COPD');
                                            if (p.cb_cad) tags.push('❤️ CAD');
                                            if (p.cb_ckd) tags.push('🫘 CKD');
                                            return (
                                                <tr key={p.id} className="dash-table-row">
                                                    <td className="dash-row-num">{i + 1}</td>
                                                    <td className="dash-patient-name">{p.patient_name || '—'}</td>
                                                    <td>{p.patient_age ? `${p.patient_age} yr` : '—'}</td>
                                                    <td>
                                                        <span className={`dash-sex-badge ${(p.patient_sex || '').toLowerCase()}`}>
                                                            {p.patient_sex || '—'}
                                                        </span>
                                                    </td>
                                                    <td className="dash-diagnosis">{p.provisional_diagnosis?.slice(0, 40) || '—'}</td>
                                                    <td>
                                                        <div className="dash-tags">
                                                            {tags.length ? tags.map(t => <span key={t} className="dash-tag">{t}</span>) : <span style={{ color: '#8b949e' }}>None</span>}
                                                        </div>
                                                    </td>
                                                    <td className="dash-date-cell">{p.saved_at?.slice(0, 10) || '—'}</td>
                                                    <td>
                                                        <button className="dash-open-btn" onClick={() => onEnterForm(p.id)}>
                                                            Open →
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <button className="dash-refresh-btn" onClick={fetchStats}>🔄 Refresh</button>
                    </>
                )}
            </div>
        </div>
    );
}
