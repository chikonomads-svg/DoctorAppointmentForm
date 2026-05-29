import React, { useState } from 'react';

/**
 * PatientDirectory — Arogya Clinic Patient Directory View
 * Design from Figma: stitches_arogya_clinic_rx_manager/patients_directory
 */
export default function PatientDirectory({ onEnterForm }) {
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const [ageFilter, setAgeFilter] = useState('all');

  const patients = [
    { id: 'P-24091', name: 'Rajesh Sharma', age: 42, sex: 'Male', blood: 'O+', phone: '+91 98765 43210', email: 'rajesh.s@example.com', lastVisit: 'Oct 12, 2023', prescriptions: 14 },
    { id: 'P-24092', name: 'Anita Desai', age: 35, sex: 'Female', blood: 'A-', phone: '+91 98221 00456', email: 'anita.d@email.com', lastVisit: 'Nov 04, 2023', prescriptions: 8 },
    { id: 'P-24095', name: 'Vikram Mehra', age: 58, sex: 'Male', blood: 'B+', phone: '+91 91234 56789', email: 'v.mehra@web.com', lastVisit: 'Yesterday', prescriptions: 21 },
    { id: 'P-24102', name: 'Sunita Patil', age: 29, sex: 'Female', blood: 'O-', phone: '+91 99887 76655', email: 'spatil@provider.in', lastVisit: 'Oct 28, 2023', prescriptions: 3 },
    { id: 'P-24115', name: 'Arjun Singh', age: 64, sex: 'Male', blood: 'AB+', phone: '+91 90000 12345', email: 'singh.arjun@care.com', lastVisit: 'Nov 01, 2023', prescriptions: 32 },
  ];

  const filtered = patients.filter(p => {
    const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase());
    const matchesGender = genderFilter === 'all' || p.sex.toLowerCase() === genderFilter;
    const matchesAge = ageFilter === 'all' ||
      (ageFilter === '0-18' && p.age <= 18) ||
      (ageFilter === '19-45' && p.age >= 19 && p.age <= 45) ||
      (ageFilter === '46-60' && p.age >= 46 && p.age <= 60) ||
      (ageFilter === '60+' && p.age >= 61);
    return matchesSearch && matchesGender && matchesAge;
  });

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
        <div className="pd-table-wrap">
          <table className="pd-table">
            <thead>
              <tr>
                <th>Patient ID</th>
                <th>Name & Gender</th>
                <th>Contact</th>
                <th>Last Visit</th>
                <th>Prescriptions</th>
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
                <tr key={p.id}>
                  <td><span className="pd-id">{p.id}</span></td>
                  <td>
                    <div className="pd-name-cell">
                      <span className="pd-name">{p.name}</span>
                      <span className={`pd-badge pd-badge-${p.sex.toLowerCase()}`}>{p.sex}</span>
                    </div>
                    <div className="pd-meta">{p.age} Years • Blood Type: {p.blood}</div>
                  </td>
                  <td>
                    <div className="pd-contact">{p.phone}</div>
                    <div className="pd-contact-email">{p.email}</div>
                  </td>
                  <td style={{ fontSize: '14px', color: 'var(--on-surface)' }}>{p.lastVisit}</td>
                  <td>
                    <span className="pd-count-badge">{p.prescriptions} Total</span>
                  </td>
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
          <div className="pd-pagination-actions">
            <button><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_left</span></button>
            <button className="active">1</button>
            <button>2</button>
            <button>3</button>
            <button><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_right</span></button>
          </div>
        </div>
      </div>
    </>
  );
}