import React, { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 6 + 2,
    x: Math.random() * 100,
    delay: Math.random() * 8,
    duration: Math.random() * 10 + 8,
}));

export default function Login({ onLogin }) {
    const [tab, setTab] = useState('login');   // 'login' | 'signup'

    // login fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // signup fields
    const [suName, setSuName] = useState('');
    const [suEmail, setSuEmail] = useState('');
    const [suPassword, setSuPassword] = useState('');
    const [suConfirm, setSuConfirm] = useState('');
    const [suRole, setSuRole] = useState('doctor');

    const [showPwd, setShowPwd] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [focused, setFocused] = useState('');
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const t = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    const fmt = (d) => d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const fmtDate = (d) => d.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const switchTab = (t) => { setTab(t); setError(''); setSuccessMsg(''); };

    // ── Login ─────────────────────────────────────────────────────────────────
    const handleLogin = async (e) => {
        e.preventDefault();
        setError(''); setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim(), password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || 'Login failed.');
            sessionStorage.setItem('dd_user', JSON.stringify(data));
            onLogin(data);
        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    };

    // ── Signup ─────────────────────────────────────────────────────────────────
    const handleSignup = async (e) => {
        e.preventDefault();
        setError(''); setSuccessMsg('');
        if (!suName.trim()) return setError('Full name is required.');
        if (suPassword.length < 6) return setError('Password must be at least 6 characters.');
        if (suPassword !== suConfirm) return setError('Passwords do not match.');

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: suName.trim(), email: suEmail.trim(), password: suPassword, role: suRole }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || 'Signup failed.');

            // Auto-login after signup
            sessionStorage.setItem('dd_user', JSON.stringify(data));
            onLogin(data);
        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    };

    return (
        <div className="login-root">
            <div className="login-particles" aria-hidden>
                {PARTICLES.map(p => (
                    <div key={p.id} className="particle"
                        style={{ width: p.size, height: p.size, left: `${p.x}%`, animationDelay: `${p.delay}s`, animationDuration: `${p.duration}s` }} />
                ))}
            </div>
            <div className="login-orb orb-1" /><div className="login-orb orb-2" /><div className="login-orb orb-3" />

            <div className="login-card">
                {/* Clock */}
                <div className="login-clock">
                    <span className="clock-time">{fmt(time)}</span>
                    <span className="clock-date">{fmtDate(time)}</span>
                </div>

                {/* Brand */}
                <div className="login-brand">
                    <div className="login-logo-wrap">
                        <span className="login-logo">🩺</span>
                        <div className="login-logo-ring" />
                    </div>
                    <h1 className="login-app-name">Dr Deepak</h1>
                    <p className="login-tagline">Smart Prescription &amp; Patient Management</p>
                </div>

                {/* Tab switcher */}
                <div className="auth-tabs">
                    <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => switchTab('login')}>
                        🔑 Sign In
                    </button>
                    <button className={`auth-tab ${tab === 'signup' ? 'active' : ''}`} onClick={() => switchTab('signup')}>
                        ✨ Sign Up
                    </button>
                </div>

                {/* ── LOGIN FORM ── */}
                {tab === 'login' && (
                    <form className="login-form" onSubmit={handleLogin} autoComplete="off">
                        <div className={`login-field ${focused === 'email' ? 'focused' : ''}`}>
                            <label>Email Address</label>
                            <div className="login-input-wrap">
                                <span className="input-icon">✉️</span>
                                <input id="li-email" type="email" value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
                                    placeholder="your@email.com" required autoComplete="username" />
                            </div>
                        </div>

                        <div className={`login-field ${focused === 'pwd' ? 'focused' : ''}`}>
                            <label>Password</label>
                            <div className="login-input-wrap">
                                <span className="input-icon">🔒</span>
                                <input id="li-password" type={showPwd ? 'text' : 'password'} value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    onFocus={() => setFocused('pwd')} onBlur={() => setFocused('')}
                                    placeholder="Enter your password" required autoComplete="current-password" />
                                <button type="button" className="pwd-toggle" onClick={() => setShowPwd(p => !p)}>
                                    {showPwd ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>

                        {error && <div className="login-error"><span>⚠️</span> {error}</div>}

                        <button id="login-submit" type="submit" className="login-btn" disabled={loading}>
                            {loading ? <span className="login-loader"><span /><span /><span /></span> : <><span>🚀</span> Sign In</>}
                        </button>

                        <p className="auth-switch-hint">
                            No account? <button type="button" className="auth-link" onClick={() => switchTab('signup')}>Create one →</button>
                        </p>
                    </form>
                )}

                {/* ── SIGNUP FORM ── */}
                {tab === 'signup' && (
                    <form className="login-form" onSubmit={handleSignup} autoComplete="off">
                        <div className={`login-field ${focused === 'su-name' ? 'focused' : ''}`}>
                            <label>Full Name</label>
                            <div className="login-input-wrap">
                                <span className="input-icon">👤</span>
                                <input id="su-name" type="text" value={suName}
                                    onChange={e => setSuName(e.target.value)}
                                    onFocus={() => setFocused('su-name')} onBlur={() => setFocused('')}
                                    placeholder="Dr. Full Name" required />
                            </div>
                        </div>

                        <div className={`login-field ${focused === 'su-email' ? 'focused' : ''}`}>
                            <label>Email Address</label>
                            <div className="login-input-wrap">
                                <span className="input-icon">✉️</span>
                                <input id="su-email" type="email" value={suEmail}
                                    onChange={e => setSuEmail(e.target.value)}
                                    onFocus={() => setFocused('su-email')} onBlur={() => setFocused('')}
                                    placeholder="your@email.com" required autoComplete="username" />
                            </div>
                        </div>

                        <div className={`login-field ${focused === 'su-role' ? 'focused' : ''}`}>
                            <label>Role</label>
                            <div className="login-input-wrap">
                                <span className="input-icon">🏥</span>
                                <select id="su-role" value={suRole} onChange={e => setSuRole(e.target.value)}
                                    onFocus={() => setFocused('su-role')} onBlur={() => setFocused('')}
                                    style={{ paddingLeft: '2.5rem' }}>
                                    <option value="doctor">Doctor</option>
                                    <option value="admin">Administrator</option>
                                    <option value="nurse">Nurse</option>
                                    <option value="staff">Staff</option>
                                </select>
                            </div>
                        </div>

                        <div className={`login-field ${focused === 'su-pwd' ? 'focused' : ''}`}>
                            <label>Password <span style={{ color: '#8b949e', fontWeight: 400 }}>(min 6 chars)</span></label>
                            <div className="login-input-wrap">
                                <span className="input-icon">🔒</span>
                                <input id="su-password" type={showPwd ? 'text' : 'password'} value={suPassword}
                                    onChange={e => setSuPassword(e.target.value)}
                                    onFocus={() => setFocused('su-pwd')} onBlur={() => setFocused('')}
                                    placeholder="Create a password" required autoComplete="new-password" />
                                <button type="button" className="pwd-toggle" onClick={() => setShowPwd(p => !p)}>
                                    {showPwd ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>

                        <div className={`login-field ${focused === 'su-confirm' ? 'focused' : ''}`}>
                            <label>Confirm Password</label>
                            <div className="login-input-wrap">
                                <span className="input-icon">✅</span>
                                <input id="su-confirm" type={showPwd ? 'text' : 'password'} value={suConfirm}
                                    onChange={e => setSuConfirm(e.target.value)}
                                    onFocus={() => setFocused('su-confirm')} onBlur={() => setFocused('')}
                                    placeholder="Repeat password" required autoComplete="new-password" />
                            </div>
                        </div>

                        {/* Strength indicator */}
                        {suPassword && (
                            <div className="pwd-strength">
                                <div className={`pwd-bar ${suPassword.length >= 12 ? 'strong' : suPassword.length >= 8 ? 'medium' : 'weak'}`} />
                                <span className="pwd-strength-label">
                                    {suPassword.length >= 12 ? '💪 Strong' : suPassword.length >= 8 ? '👍 Medium' : '⚠️ Weak'}
                                </span>
                            </div>
                        )}

                        {error && <div className="login-error"><span>⚠️</span> {error}</div>}
                        {successMsg && <div className="login-success"><span>✅</span> {successMsg}</div>}

                        <button id="signup-submit" type="submit" className="login-btn signup-btn" disabled={loading}>
                            {loading ? <span className="login-loader"><span /><span /><span /></span> : <><span>🎉</span> Create Account</>}
                        </button>

                        <p className="auth-switch-hint">
                            Already have an account? <button type="button" className="auth-link" onClick={() => switchTab('login')}>Sign in →</button>
                        </p>
                    </form>
                )}

                <p className="login-footer">&copy; 2026 Dr Deepak · Powered by MedGuardian AI</p>
            </div>
        </div>
    );
}
