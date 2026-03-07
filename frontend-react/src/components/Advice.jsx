import React from 'react';

export default function Advice({ data, onChange }) {
    const set = (key, val) => onChange({ ...data, [key]: val });

    return (
        <section className="form-section">
            <h2 className="section-title">Advice</h2>
            <div className="field-group">
                <textarea
                    rows={4}
                    placeholder="e.g. Rest, plenty of fluids, avoid cold. Follow up after 5 days."
                    value={data.advice || ''}
                    onChange={e => set('advice', e.target.value)}
                />
            </div>
        </section>
    );
}
