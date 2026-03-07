import React from 'react';

export default function ClinicalAssessment({ data, onChange }) {
    const set = (key, val) => onChange({ ...data, [key]: val });

    return (
        <section className="form-section">
            <h2 className="section-title">Clinical Assessment</h2>
            <div className="field-group">
                <label>Chief Complaints</label>
                <textarea
                    rows={3}
                    placeholder="e.g. Fever, cough, breathlessness for 3 days"
                    value={data.chief_complaints || ''}
                    onChange={e => set('chief_complaints', e.target.value)}
                />
            </div>
            <div className="field-group">
                <label>Provisional Diagnosis</label>
                <textarea
                    rows={2}
                    placeholder="e.g. Community Acquired Pneumonia"
                    value={data.provisional_diagnosis || ''}
                    onChange={e => set('provisional_diagnosis', e.target.value)}
                />
            </div>
            <div className="field-group">
                <label>Investigations</label>
                <textarea
                    rows={3}
                    placeholder="e.g. CBC, CXR, RFT, LFT"
                    value={data.investigations || ''}
                    onChange={e => set('investigations', e.target.value)}
                />
            </div>
        </section>
    );
}
