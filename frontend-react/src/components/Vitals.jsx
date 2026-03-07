import React from 'react';

const VITALS = [
    ['vital_bp', 'BP', 'mmHg', 'e.g. 120/80'],
    ['vital_pulse', 'Pulse', '/min', 'bpm'],
    ['vital_spo2', 'SpO₂', '%', 'e.g. 98'],
    ['vital_temp', 'Temp', '°F', 'e.g. 98.6'],
    ['vital_rr', 'RR', '/min', 'e.g. 16'],
    ['vital_grbs', 'GRBS', 'mg/dL', 'e.g. 110'],
];

export default function Vitals({ data, onChange }) {
    const set = (key, val) => onChange({ ...data, [key]: val });

    return (
        <section className="form-section">
            <h2 className="section-title">Vitals</h2>
            <div className="vitals-grid">
                {VITALS.map(([key, label, unit, placeholder]) => (
                    <div key={key} className="vital-card">
                        <div className="vital-label">{label}</div>
                        <input
                            type="text"
                            placeholder={placeholder}
                            value={data[key] || ''}
                            onChange={e => set(key, e.target.value)}
                            className="vital-input"
                        />
                        <div className="vital-unit">{unit}</div>
                    </div>
                ))}
            </div>
        </section>
    );
}
