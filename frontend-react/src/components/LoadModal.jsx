import React, { useEffect, useState } from 'react';
import { listPrescriptions, deletePrescription } from '../api';

function formatDate(iso) {
    try {
        return new Date(iso).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
        }) + ' ' + new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    } catch { return ''; }
}

export default function LoadModal({ onLoad, onClose }) {
    const [items, setItems] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    const load = async (q = '') => {
        setLoading(true);
        try {
            const data = await listPrescriptions(q);
            setItems(data);
        } catch {
            setItems([]);
        }
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const handleSearch = (e) => {
        setSearch(e.target.value);
        load(e.target.value);
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (!confirm('Delete this prescription permanently?')) return;
        await deletePrescription(id);
        load(search);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Saved Prescriptions</h3>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>
                <input
                    type="text"
                    className="modal-search"
                    placeholder="Search by patient name…"
                    value={search}
                    onChange={handleSearch}
                />
                <div className="modal-list">
                    {loading && <div className="modal-empty">Loading…</div>}
                    {!loading && items.length === 0 && (
                        <div className="modal-empty">{search ? 'No matching prescriptions.' : 'No saved prescriptions yet.'}</div>
                    )}
                    {items.map(p => (
                        <div key={p.id} className="modal-item" onClick={() => onLoad(p.id)}>
                            <div className="modal-item-info">
                                <span className="modal-item-name">{p.patient_name}</span>
                                <span className="modal-item-meta">{p.patient_date || 'No date'} · {formatDate(p.saved_at)}</span>
                            </div>
                            <div className="modal-item-actions">
                                <button className="btn btn-secondary btn-sm">📂 Load</button>
                                <button className="btn btn-danger btn-sm" onClick={e => handleDelete(p.id, e)}>🗑️</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
