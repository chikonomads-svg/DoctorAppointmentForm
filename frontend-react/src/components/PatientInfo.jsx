import React from 'react';

export default function PatientInfo({ data, onChange }) {
    const set = (key, val) => onChange({ ...data, [key]: val });

    return (
        <section className="form-section">
            <h2 className="section-title">Patient Information</h2>
            <div className="grid-2">
                <div className="field-group">
                    <label>Patient Name <span className="required">*</span></label>
                    <input
                        type="text"
                        placeholder="Full name"
                        value={data.patient_name || ''}
                        onChange={e => set('patient_name', e.target.value)}
                    />
                </div>
                <div className="field-group">
                    <label>Date</label>
                    <input
                        type="date"
                        value={data.patient_date || ''}
                        onChange={e => set('patient_date', e.target.value)}
                    />
                </div>
                <div className="field-group">
                    <label>Age</label>
                    <input
                        type="number"
                        placeholder="Years"
                        value={data.patient_age ?? ''}
                        onChange={e => set('patient_age', e.target.value ? parseInt(e.target.value) : null)}
                    />
                </div>
                <div className="field-group">
                    <label>Sex</label>
                    <select value={data.patient_sex || ''} onChange={e => set('patient_sex', e.target.value)}>
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div className="field-group">
                    <label>UHID</label>
                    <input
                        type="text"
                        placeholder="e.g. 123456"
                        value={data.patient_uhid || ''}
                        onChange={e => set('patient_uhid', e.target.value)}
                    />
                </div>
                <div className="field-group">
                    <label>Phone</label>
                    <input
                        type="text"
                        placeholder="Patient phone number"
                        value={data.patient_phone || ''}
                        onChange={e => set('patient_phone', e.target.value)}
                    />
                </div>
                <div className="field-group">
                    <label>Weight (kg)</label>
                    <input
                        type="number"
                        step="0.1"
                        placeholder="kg"
                        value={data.patient_weight ?? ''}
                        onChange={e => set('patient_weight', e.target.value ? parseFloat(e.target.value) : null)}
                    />
                </div>
                <div className="field-group full-width">
                    <label>Address</label>
                    <input
                        type="text"
                        placeholder="Patient address"
                        value={data.patient_address || ''}
                        onChange={e => set('patient_address', e.target.value)}
                    />
                </div>
                <div className="field-group">
                    <label>Follow-up</label>
                    <input
                        type="text"
                        placeholder="e.g. After 2 weeks"
                        value={data.follow_up || ''}
                        onChange={e => set('follow_up', e.target.value)}
                    />
                </div>
            </div>

            <div className="subsection-label" style={{ marginTop: '1rem' }}>Clinic / Doctor Info</div>
            <div className="grid-2">
                <div className="field-group">
                    <label>Clinic Address</label>
                    <input
                        type="text"
                        placeholder="Clinic address"
                        value={data.clinic_address || ''}
                        onChange={e => set('clinic_address', e.target.value)}
                    />
                </div>
                <div className="field-group">
                    <label>Clinic Phone</label>
                    <input
                        type="text"
                        placeholder="Phone number"
                        value={data.clinic_phone || ''}
                        onChange={e => set('clinic_phone', e.target.value)}
                    />
                </div>
                <div className="field-group">
                    <label>Registration No.</label>
                    <input
                        type="text"
                        placeholder="Reg. No."
                        value={data.reg_no || ''}
                        onChange={e => set('reg_no', e.target.value)}
                    />
                </div>
            </div>
        </section>
    );
}
