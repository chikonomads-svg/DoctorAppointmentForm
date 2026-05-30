import React, { useState } from 'react';

/**
 * Settings — Arogya Clinic Settings View
 * Design from Figma: stitches_arogya_clinic_rx_manager/settings
 */
export default function Settings() {
  const [clinicName] = useState('Arogya Clinic');
  const [regNo] = useState('BR/12345');
  const [phone] = useState('+91 9999438183');
  const [address] = useState('Saktidharamkata Bada Jagganath, near God Father Public School, Muzaffarpur, Bihar - 842004');
  const [language, setLanguage] = useState('en');
  const [whatsappNotify, setWhatsappNotify] = useState(true);

  return (
    <div className="settings-page">
      {/* ── Header ── */}
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage your clinic profile, preferences, and clinical data safety.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
        {/* ── Clinic Profile ── */}
        <section className="settings-card">
          <div className="settings-card-header">
            <h2>
              <span className="material-symbols-outlined">business</span>
              Clinic Profile
            </h2>
          </div>
          <div className="settings-card-body">
            <div className="settings-form-grid">
              <div className="settings-full-width">
                <div className="form-group">
                  <label className="form-label">Clinic Name</label>
                  <input type="text" value={clinicName} readOnly />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Registration Number</label>
                <input type="text" value={regNo} readOnly />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input type="tel" value={phone} readOnly />
              </div>
              <div className="settings-full-width">
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <textarea rows={3} value={address} readOnly />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── System Preferences ── */}
        <section className="settings-card">
          <div className="settings-card-header">
            <h2>
              <span className="material-symbols-outlined">tune</span>
              System Preferences
            </h2>
          </div>
          <div className="settings-card-body" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="settings-pref-item">
              <div className="settings-pref-info">
                <h4>System Language</h4>
                <p>Default language for the dashboard and prescriptions.</p>
              </div>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                style={{ width: 'auto', minWidth: 160 }}
              >
                <option value="en">English (Universal)</option>
                <option value="hi">Hindi (हिंदी)</option>
              </select>
            </div>
            <div className="settings-pref-item">
              <div className="settings-pref-info">
                <h4>WhatsApp Notifications</h4>
                <p>Send automated appointment reminders to patients.</p>
              </div>
              <label className="settings-toggle">
                <input
                  type="checkbox"
                  checked={whatsappNotify}
                  onChange={e => setWhatsappNotify(e.target.checked)}
                />
                <div className="settings-toggle-track">
                  <div className="settings-toggle-knob"></div>
                </div>
              </label>
            </div>
          </div>
        </section>

        {/* ── Backup & Data Management ── */}
        <section className="settings-card">
          <div className="settings-card-header">
            <h2>
              <span className="material-symbols-outlined">cloud_sync</span>
              Backup & Management
            </h2>
          </div>
          <div className="settings-card-body">
            <div className="settings-backup-grid">
              <div className="settings-backup-card">
                <div className="settings-backup-icon primary">
                  <span className="material-symbols-outlined">cloud_download</span>
                </div>
                <div className="settings-backup-info">
                  <h4>Cloud Backup</h4>
                  <p>Last backup: Today at 04:00 AM</p>
                  <button className="primary-text">Manual Trigger</button>
                </div>
              </div>
              <div className="settings-backup-card">
                <div className="settings-backup-icon secondary">
                  <span className="material-symbols-outlined">database</span>
                </div>
                <div className="settings-backup-info">
                  <h4>Data Export</h4>
                  <p>Download patient history in CSV/PDF format.</p>
                  <button className="secondary-text">Start Export</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Action Buttons ── */}
        <div className="settings-actions">
          <button className="btn btn-secondary">Discard Changes</button>
          <button className="btn btn-primary">Save Settings</button>
        </div>
      </div>
    </div>
  );
}