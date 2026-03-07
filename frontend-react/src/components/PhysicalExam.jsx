import React from 'react';

const FINDINGS = [
    ['ex_pallor', 'Pallor'],
    ['ex_icterus', 'Icterus'],
    ['ex_cyanosis', 'Cyanosis'],
    ['ex_clubbing', 'Clubbing'],
    ['ex_edema', 'Edema'],
];

export default function PhysicalExam({ data, onChange }) {
    const toggle = (key) => onChange({ ...data, [key]: !data[key] });

    return (
        <section className="form-section">
            <h2 className="section-title">General Physical Examination</h2>
            <div className="checkbox-grid">
                {FINDINGS.map(([key, label]) => (
                    <label key={key} className={`chip-check ${data[key] ? 'active' : ''}`}>
                        <input type="checkbox" checked={!!data[key]} onChange={() => toggle(key)} />
                        {label}
                    </label>
                ))}
            </div>
        </section>
    );
}
