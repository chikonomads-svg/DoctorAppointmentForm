import React, { useState, useEffect } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function PatientDirectory({ onEnterForm }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const [ageFilter, setAgeFilter] = useState('all');

  useEffect(() => {
    setLoading(true);
    setError('');
    fetch(`${API}/api/prescriptions`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch patients');
        return res.json();
      })
      .then(data => {
        // data might be an array or have a data field
        const list = Array.isArray(data) ? data : (data?.data || data?.prescriptions || []);
        setPatients(list);
        setLoading(false);
      })
      .catch(e => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  let filtered = patients;
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(p =>
      (p.patient_name || '').toLowerCase().includes(q) ||
      (p.id || '').toLowerCase().includes(q)
    );
  }
  if (genderFilter !== 'all') {
    filtered = filtered.filter(p => (p.patient_sex || '').toLowerCase() === genderFilter);
  }
  if (ageFilter !== 'all') {
    filtered = filtered.filter(p => {
      const age = parseInt(p.patient_age, 10);
      if (isNaN(age)) return false;
      if (ageFilter === '0-18') return age <= 18;
      if (ageFilter === '19-45') return age >= 19 && age <= 45;
      if (ageFilter === '46-60') return age >= 46 && age <= 60;
      if (ageFilter === '60+') return age >= 61;
      return true;
    });
  }

  const formatDate = (d) => {
    if (!d) return '—';
    try { return new Date(d).toLocaleDateString('en-IN'); } catch { return d; }
  };

  return (
    <>
      {/* ── Page Header ── */}
      <div className="pd-header">
        <div className="breadcrumb">
          <span>Clinical Portal</span>
          <span className="material-symbols-outlined">chevron_right</span>
          <span className="breadcrumb-current">Patients</span>
        </div>
        <h2 className="pd-title">Patient Directory</h2>
        <div className="pd-controls">
          <div className="pd-search">
            <span className="material-symbols-outlined">search</span>
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="pd-filters">
            <select value={genderFilter} onChange={e => setGenderFilter(e.target.value)}>
              <option value="all">Gender: All</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <select value={ageFilter} onChange={e => setAgeFilter(e.target.value)}>
              <option value="all">Age: All</option>
              <option value="0-18">0-18</option>
              <option value="19-45">19-45</option>
              <option value="46-60">46-60</option>
              <option value="60+">60+</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Patients Table ── */}
      <div className="pd-table-container">
        {loading && (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--on-surface-variant)' }}>
            <div style={{ width: 24, height: 24, border: '3px solid var(--primary-fixed)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.6s linear infinite', margin: '0 auto 8px' }}></div>
            <span>Loading patients...</span>
          </div>
        )}
        {error && (
          <div style={{ padding: '12px 16px', background: '#fee2e2', color: '#991b1b', margin: '8px', borderRadius: 'var(--radius)' }}>
            ⚠️ {error}
          </div>
        )}
        {!loading && !error && (
          <>
            <div className="pd-table-wrap">
              <table className="pd-table">
                <thead>
                  <tr>
                    <th>Patient ID</th>
                    <th>Name & Gender</th>
                    <th>Age</th>
                    <th>Diagnosis</th>
                    <th>Last Visit</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--on-surface-variant)' }}>
                        No patients found matching your criteria.
                      </td>
                    </tr>
                  ) : filtered.map((p, i) => (
                    <tr key={p.id || i}>
                      <td><span className="pd-id">{(p.id || '').slice(-8)}</span></td>
                      <td>
                        <div className="pd-name-cell">
                          <span className="pd-name">{p.patient_name || '—'}</span>
                          <span className={`pd-badge pd-badge-${(p.patient_sex || '').toLowerCase()}`}>{p.patient_sex || '—'}</span>
                        </div>
                      </td>
                      <td>{p.patient_age ? `${p.patient_age} yrs` : '—'}</td>
                      <td><span className="dash-diag-text">{(p.provisional_diagnosis || '').slice(0, 40) || '—'}</span></td>
                      <td style={{ fontSize: '14px', color: 'var(--on-surface)' }}>{formatDate(p.saved_at)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="pd-open-btn" onClick={() => onEnterForm(p.id)}>
                          Open History
                          <span className="material-symbols-outlined">keyboard_arrow_right</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pd-pagination">
              <span>Showing {filtered.length} of {patients.length} patients</span>
            </div>
          </>
        )}
      </div>
    </>
  );
}