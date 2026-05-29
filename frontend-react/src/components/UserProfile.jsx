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
        <p className="profile-qual">MBBS, MD (General Medicine)</p>
        <div className="profile-tags">
          <span className="profile-tag profile-tag-primary">Reg No: 12345</span>
          <span className="profile-tag profile-tag-secondary">Senior Practitioner</span>
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
                <p className="profile-detail-value">deepak.kumar@arogya.com</p>
              </div>
              <span className="profile-detail-icon material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
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
                <p>AIIMS New Delhi, Harvard Medical School (Fellowship)</p>
              </div>
            </div>
            <div className="profile-info-row">
              <span className="material-symbols-outlined profile-info-icon">history_edu</span>
              <div className="profile-info-text">
                <p>Experience</p>
                <p>15+ Years in Clinical Practice</p>
              </div>
            </div>
            <div className="profile-info-row">
              <span className="material-symbols-outlined profile-info-icon">language</span>
              <div className="profile-info-text">
                <p>Languages</p>
                <p>English, Hindi, Punjabi</p>
              </div>
            </div>
          </div>
          <button className="profile-edit-btn">Edit Professional Bio</button>
        </div>

        {/* Clinic Preferences (Full Width) */}
        <div className="profile-card profile-preferences-card">
          <div className="profile-card-title">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>tune</span>
            <h3>Clinic Preferences</h3>
          </div>
          <div className="profile-pref-grid">
            <div className="profile-pref-stat">
              <p>Consultation Fee</p>
              <p>₹ 800.00</p>
            </div>
            <div className="profile-pref-stat">
              <p>Appt. Duration</p>
              <p>20 Minutes</p>
            </div>
            <div className="profile-pref-stat">
              <p>Daily Limit</p>
              <p>45 Patients</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Danger Zone ── */}
      <div className="profile-danger-zone">
        <div>
          <h4>Account Deactivation</h4>
          <p>Temporarily disable your profile and visibility in the clinic network.</p>
        </div>
        <button className="profile-danger-btn">Deactivate</button>
      </div>
    </div>
  );
}