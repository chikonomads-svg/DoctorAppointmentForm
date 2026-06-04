import React, { useState } from 'react';

/**
 * UserProfile — Arogya Clinic User Profile View
 * Design from Figma: stitches_arogya_clinic_rx_manager/user_profile
 */
export default function UserProfile({ user = {} }) {
  const [twoFA, setTwoFA] = useState(true);

  return (
    <div className="profile-page">
      {/* ── Hero Profile Section ── */}
      <div className="profile-hero">
        <div className="profile-avatar-wrap">
          <div className="profile-avatar" style={{ background: 'var(--primary-fixed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--primary)' }}>person</span>
          </div>
          <button className="profile-avatar-edit">
            <span className="material-symbols-outlined">photo_camera</span>
          </button>
        </div>
        <h1 className="profile-name">{user?.name || 'Dr. Deepak Kumar'}</h1>
        <p className="profile-qual">{user?.qualification || 'MBBS (SKMCH), MD General Medicine (DMCH Darbhanga)'}</p>
        <div className="profile-tags">
          <span className="profile-tag profile-tag-primary">Reg No: {user?.regNo || 'BCMR50223'}</span>
          <span className="profile-tag profile-tag-secondary">Muzaffarpur, Bihar</span>
        </div>
        <div style={{ marginTop: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-md)', flexWrap: 'wrap', justifyContent: 'center' }}>
          <span style={{ fontSize: 14, color: 'var(--on-surface-variant)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: 'text-bottom' }}>school</span> MBBS, SKMCH Muzaffarpur
          </span>
          <span style={{ fontSize: 14, color: 'var(--on-surface-variant)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: 'text-bottom' }}>school</span> MD General Medicine, DMCH Darbhanga
          </span>
        </div>
      </div>

      {/* ── Bento Grid Content ── */}
      <div className="profile-grid">
        {/* Account Security */}
        <div className="profile-card">
          <div className="profile-card-title">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
            <h3>Account Security</h3>
          </div>
          <div>
            <div className="profile-detail-item">
              <div>
                <p className="profile-detail-label">Email Address</p>
                <p className="profile-detail-value">{user?.email || 'deepakkumar21121995@gmail.com'}</p>
              </div>
              <span className="profile-detail-icon material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            </div>
            <div className="profile-detail-item">
              <div>
                <p className="profile-detail-label">Phone</p>
                <p className="profile-detail-value">{user?.phone || '+91 9199943818'}</p>
              </div>
              <span className="profile-detail-icon material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>call</span>
            </div>
            <div className="profile-detail-item">
              <div>
                <p className="profile-detail-label">Password</p>
                <p className="profile-detail-value">Last changed 2 months ago</p>
              </div>
              <button className="profile-detail-btn">Reset</button>
            </div>
            <div className="profile-detail-item">
              <div>
                <p className="profile-detail-label">Two-Factor Auth</p>
                <p className="profile-detail-value">Enabled (SMS)</p>
              </div>
              <label
                className={`rx-switch ${twoFA ? 'active' : ''}`}
                onClick={() => setTwoFA(!twoFA)}
                style={{ cursor: 'pointer' }}
              >
                <div className="rx-switch-knob"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Professional Details */}
        <div className="profile-card">
          <div className="profile-card-title">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>medical_services</span>
            <h3>Professional Details</h3>
          </div>
          <div>
            <div className="profile-info-row">
              <span className="material-symbols-outlined profile-info-icon">school</span>
              <div className="profile-info-text">
                <p>Education</p>
                <p>MBBS, SKMCH Muzaffarpur</p>
              </div>
            </div>
            <div className="profile-info-row">
              <span className="material-symbols-outlined profile-info-icon">history_edu</span>
              <div className="profile-info-text">
                <p>Specialization</p>
                <p>MD General Medicine, DMCH Darbhanga</p>
              </div>
            </div>
            <div className="profile-info-row">
              <span className="material-symbols-outlined profile-info-icon">stethoscope</span>
              <div className="profile-info-text">
                <p>Specialty Areas</p>
                <p>Diabetes, Blood Pressure, Thyroid, Asthma, COPD, Abdominal Diseases</p>
              </div>
            </div>
            <div className="profile-info-row">
              <span className="material-symbols-outlined profile-info-icon">location_on</span>
              <div className="profile-info-text">
                <p>Practice Location</p>
                <p>{user?.city || 'Muzaffarpur, Bihar'}</p>
              </div>
            </div>
            <div className="profile-info-row">
              <span className="material-symbols-outlined profile-info-icon">language</span>
              <div className="profile-info-text">
                <p>Languages</p>
                <p>{user?.languages || 'English, Hindi'}</p>
              </div>
            </div>
          </div>
          <button className="profile-edit-btn">Edit Professional Bio</button>
        </div>

        {/* Clinic Information (Full Width) */}
        <div className="profile-card profile-preferences-card">
          <div className="profile-card-title">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>tune</span>
            <h3>Clinic Information</h3>
          </div>
          <div className="profile-pref-grid">
            <div className="profile-pref-stat">
              <p>Clinic Name</p>
              <p style={{ fontSize: 16 }}>{user?.clinicName || 'Arogya Clinic'}</p>
            </div>
            <div className="profile-pref-stat">
              <p>Address</p>
              <p style={{ fontSize: 13, wordBreak: 'break-word' }}>Saktidharamkata Bada Jagganath, near God Father Public School, 842004</p>
            </div>
            <div className="profile-pref-stat">
              <p>Clinic Hours</p>
              <p style={{ fontSize: 13 }}>Morning: 6 AM - 9 AM<br/>Evening: 3 PM - 6 PM</p>
            </div>
            <div className="profile-pref-stat">
              <p>Consultation Fee</p>
              <p>{user?.consultationFee || '₹ 800'}</p>
            </div>
            <div className="profile-pref-stat">
              <p>Appt. Duration</p>
              <p>{user?.appointmentDuration || '20 Minutes'}</p>
            </div>
            <div className="profile-pref-stat">
              <p>Daily Limit</p>
              <p>{user?.dailyLimit || '45 Patients'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Contact Info ── */}
      <div style={{ marginTop: 'var(--space-lg)', padding: 'var(--space-lg)', background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
        <div>
          <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary)', marginBottom: 4 }}>Contact</h4>
          <p style={{ fontSize: 14, color: 'var(--on-surface)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: 'text-bottom' }}>call</span> {user?.phone || '+91 9199943818'}
          </p>
          <p style={{ fontSize: 14, color: 'var(--on-surface)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: 'text-bottom' }}>mail</span> {user?.email || 'deepakkumar21121995@gmail.com'}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>Registration No</p>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--on-surface)', fontFamily: 'var(--font-mono)' }}>{user?.regNo || 'BCMR50223'}</p>
        </div>
      </div>
    </div>
  );
}