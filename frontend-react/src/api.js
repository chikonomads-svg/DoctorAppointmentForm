// api.js — Thin API client for the FastAPI backend
const isLocalhost =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.protocol === 'file:';

const BASE_HOST = isLocalhost
    ? 'http://localhost:8000'
    : (import.meta.env.VITE_API_URL || 'https://your-render-backend-url.onrender.com');

export const API_BASE = `${BASE_HOST}/api/prescriptions`;
export const MEDICINE_API = `${BASE_HOST}/api/medicine/search`;
export const CSV_MED_API = `${BASE_HOST}/api/medicine/csv-search`;
export const HEALTH_URL = `${BASE_HOST}/health`;

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
    let results = [];
    // Try CSV search first (faster, no DB needed)
    try {
        const res = await fetch(`${CSV_MED_API}?q=${encodeURIComponent(name)}&limit=30`);
        if (res.ok) {
            const data = await res.json();
            if (data?.data?.length) results = data.data;
        }
    } catch { /* fall through */ }
    // Fallback to DB search if CSV returned nothing
    if (results.length === 0) {
        try {
            const res = await fetch(`${MEDICINE_API}?name=${encodeURIComponent(name)}`);
            if (res.ok) {
                const data = await res.json();
                results = data?.data || [];
            }
        } catch { return []; }
    }
    // Deduplicate by name — keep first occurrence only
    const seen = new Set();
    return results.filter(d => {
        const key = (d.name || '').toLowerCase().trim();
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}
