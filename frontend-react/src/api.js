// api.js — Thin API client for the FastAPI backend
const isLocalhost =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.protocol === 'file:';

export const API_BASE = isLocalhost
    ? 'http://localhost:8000/api/prescriptions'
    : 'https://your-render-backend-url.onrender.com/api/prescriptions';

export const MEDICINE_API = isLocalhost
    ? 'http://localhost:8000/api/medicine/search'
    : 'https://your-render-backend-url.onrender.com/api/medicine/search';

export const HEALTH_URL = isLocalhost
    ? 'http://localhost:8000/health'
    : 'https://your-render-backend-url.onrender.com/health';

export async function checkHealth() {
    try {
        const res = await fetch(HEALTH_URL, { signal: AbortSignal.timeout(2000) });
        return res.ok;
    } catch {
        return false;
    }
}

export async function listPrescriptions(search = '') {
    const url = search
        ? `${API_BASE}?search=${encodeURIComponent(search)}`
        : API_BASE;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch list');
    return res.json();
}

export async function getPrescription(id) {
    const res = await fetch(`${API_BASE}/${id}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('Failed to fetch prescription');
    return res.json();
}

export async function savePrescription(data) {
    // Try PUT (update) first, then POST (create) if 404
    let res = await fetch(`${API_BASE}/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (res.status === 404) {
        res = await fetch(API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
    }
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Server error: ${res.status}`);
    }
    return res.json();
}

export async function deletePrescription(id) {
    const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    if (res.status === 404) return;
    if (!res.ok) throw new Error('Failed to delete');
}

export async function searchMedicines(name) {
    const res = await fetch(`${MEDICINE_API}?name=${encodeURIComponent(name)}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data?.data || [];
}
