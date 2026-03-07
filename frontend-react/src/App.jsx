import React, { useState, useEffect, useCallback } from 'react';
import { checkHealth, savePrescription, getPrescription, deletePrescription } from './api';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CameraCapture from './components/CameraCapture';
import PatientInfo from './components/PatientInfo';
import Comorbidities from './components/Comorbidities';
import Vitals from './components/Vitals';
import ClinicalAssessment from './components/ClinicalAssessment';
import PhysicalExam from './components/PhysicalExam';
import SystemicExam from './components/SystemicExam';
import Prescription from './components/Prescription';
import Advice from './components/Advice';
import LoadModal from './components/LoadModal';

// ── Default empty prescription ────────────────────────────────────────────────
const EMPTY = () => ({
    patient_date: new Date().toISOString().split('T')[0],
    patient_name: '',
    medications: [{}, {}, {}, {}, {}].map(() => ({
        drug_name: '', dose: '', route: '', frequency: '', duration: '',
    })),
});

function genId() {
    return Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 7);
}

// ── Toast ─────────────────────────────────────────────────────────────────────
let toastFn = null;
function Toast() {
    const [toasts, setToasts] = useState([]);
    toastFn = (msg, type = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, msg, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
    };
    return (
        <div className="toast-container">
            {toasts.map(t => (
                <div key={t.id} className={`toast toast-${t.type}`}>
                    {t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : 'ℹ️'} {t.msg}
                </div>
            ))}
        </div>
    );
}
const showToast = (msg, type) => toastFn?.(msg, type);

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
    // ── Auth ─────────────────────────────────────────────────────────────────
    const [user, setUser] = useState(() => {
        try { return JSON.parse(sessionStorage.getItem('dd_user') || 'null'); }
        catch { return null; }
    });

    // ── Prescription state ─────────────────────────────────────────────────
    const [data, setData] = useState(EMPTY());
    const [currentId, setCurrentId] = useState(null);
    const [backendAvailable, setBE] = useState(false);
    const [showLoad, setShowLoad] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        checkHealth().then(ok => setBE(ok));
        const iv = setInterval(() => checkHealth().then(ok => setBE(ok)), 30000);
        return () => clearInterval(iv);
    }, []);

    // ── View state: 'dashboard' | 'form' ─────────────────────────────────────
    const [view, setView] = useState('dashboard');

    const handleLogin = (u) => { setUser(u); setView('dashboard'); };

    const handleLogout = () => {
        sessionStorage.removeItem('dd_user');
        setUser(null); setView('dashboard');
    };

    // Enter form, optionally loading a specific patient record
    const handleEnterForm = async (id) => {
        if (id && typeof id === 'string' && id !== 'new') {
            try {
                const p = await getPrescription(id);
                if (p) { setData(p); setCurrentId(p.id); }
            } catch { /* ignore */ }
        } else {
            setData(EMPTY()); setCurrentId(null);
        }
        setView('form');
    };

    const handleSave = async () => {
        if (!data.patient_name?.trim()) { showToast('Please enter patient name', 'error'); return; }
        if (!backendAvailable) { showToast('Backend is offline — cannot save', 'error'); return; }
        setSaving(true);
        try {
            const payload = { ...data, id: currentId || genId(), saved_at: new Date().toISOString() };
            const saved = await savePrescription(payload);
            setCurrentId(saved.id);
            showToast('Saved successfully!', 'success');
        } catch (err) {
            showToast('Save failed: ' + err.message, 'error');
        }
        setSaving(false);
    };

    const handleLoad = async (id) => {
        try {
            const p = await getPrescription(id);
            if (!p) { showToast('Not found', 'error'); return; }
            setData(p);
            setCurrentId(p.id);
            setShowLoad(false);
            showToast(`Loaded: ${p.patient_name}`, 'success');
        } catch (err) {
            showToast('Load failed: ' + err.message, 'error');
        }
    };

    const handleNew = () => {
        if (!confirm('Start a new prescription? Unsaved changes will be lost.')) return;
        setData(EMPTY());
        setCurrentId(null);
        showToast('New prescription started', 'info');
    };

    const handleDelete = async () => {
        if (!currentId) { showToast('Nothing to delete. Save first.', 'info'); return; }
        if (!confirm('Delete this prescription permanently?')) return;
        await deletePrescription(currentId);
        setData(EMPTY());
        setCurrentId(null);
        showToast('Deleted', 'info');
    };

    // Merge AI-extracted data into current form state
    const handleCameraData = useCallback((extracted) => {
        setData(prev => {
            const merged = { ...prev };
            const { medications: extMeds, _demo, _note, ...fields } = extracted;

            // Merge scalar fields
            Object.entries(fields).forEach(([k, v]) => {
                if (v !== undefined && v !== null && v !== '' && v !== false) {
                    merged[k] = v;
                }
            });

            // Merge medications (prepend extracted, keep existing)
            if (extMeds?.length) {
                const existing = prev.medications || [];
                merged.medications = [
                    ...extMeds,
                    ...existing.filter(m => m.drug_name),
                ].slice(0, 10);
            }
            return merged;
        });
        showToast('Camera data applied to form!', 'success');
    }, []);

    // ── Gate: show login if not authenticated ────────────────────────────────
    if (!user) return <Login onLogin={handleLogin} />;

    // ── Dashboard view ───────────────────────────────────────────────────────
    if (view === 'dashboard') {
        return (
            <>
                <Toast />
                <Dashboard
                    user={user}
                    onEnterForm={handleEnterForm}
                    onLogout={handleLogout}
                />
            </>
        );
    }

    // ── Toolbar buttons shared between header and bottom bar ──────────────────
    const toolbarActions = (
        <>
            <button className="btn btn-ghost" onClick={() => setView('dashboard')} title="Back to Dashboard">
                🏠 Dashboard
            </button>
            <button className="btn btn-camera" id="btn-camera" onClick={() => setShowCamera(true)}>
                📷 Scan
            </button>
            <button className="btn btn-secondary" onClick={handleNew}>＋ New</button>
            <button className="btn btn-secondary" onClick={() => setShowLoad(true)}>📂 Load</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : '💾 Save'}
            </button>
            <button className="btn btn-secondary" onClick={() => window.print()}>🖨️ Print</button>
            <button className="btn btn-danger" onClick={handleDelete}>🗑️ Delete</button>
        </>
    );

    return (
        <>
            <Toast />
            {showLoad && <LoadModal onLoad={handleLoad} onClose={() => setShowLoad(false)} />}
            {showCamera && (
                <CameraCapture
                    onDataExtracted={handleCameraData}
                    onClose={() => setShowCamera(false)}
                />
            )}

            {/* ── Header ───────────────────────────────────────────── */}
            <header className="app-header">
                <div className="header-brand">
                    <span className="header-icon">🩺</span>
                    <div>
                        <div className="header-title">Dr Deepak</div>
                        <div className="header-subtitle">Smart Prescription Management</div>
                    </div>
                </div>

                <div className="header-center">
                    <span className={`status-dot ${backendAvailable ? 'online' : 'offline'}`} />
                    <span className="status-label">{backendAvailable ? 'PostgreSQL ●' : 'Offline'}</span>
                </div>

                <div className="header-actions">
                    {toolbarActions}
                    {/* User chip */}
                    <div className="user-chip" title={user.email}>
                        <span className="user-avatar">
                            {user.name?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                        <span className="user-name">{user.name}</span>
                        <button className="user-logout" onClick={handleLogout} title="Sign out">⏻</button>
                    </div>
                </div>
            </header>

            {/* ── Main Form ────────────────────────────────────────── */}
            <main className="app-main">
                <PatientInfo data={data} onChange={setData} />
                <Comorbidities data={data} onChange={setData} />
                <Vitals data={data} onChange={setData} />
                <ClinicalAssessment data={data} onChange={setData} />
                <PhysicalExam data={data} onChange={setData} />
                <SystemicExam data={data} onChange={setData} />
                <Prescription data={data} onChange={setData} backendAvailable={backendAvailable} />
                <Advice data={data} onChange={setData} />

                {/* Bottom floating bar */}
                <div className="bottom-bar">
                    {toolbarActions}
                </div>
            </main>
        </>
    );
}
