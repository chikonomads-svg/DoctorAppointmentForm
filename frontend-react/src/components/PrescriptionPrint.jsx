import React from 'react';
import './PrescriptionPrint.css';

/**
 * PrescriptionPrint — renders a prescription in the standard format.
 * Matches the standard_prescription.pdf layout.
 *
 * Props:
 *   data      — the shared form state object from App.jsx
 *   doctorName — optional string e.g. "Dr Deepak"
 */
export default function PrescriptionPrint({ data = {}, doctorName = 'Dr Deepak' }) {
    const {
        patient_name = '',
        patient_age = '',
        patient_sex = '',
        patient_date = '',
        patient_uhid = '',
        patient_phone = data.patient_phone || data.clinic_phone || '',
        patient_address = '',
        chief_complaints = '',
        provisional_diagnosis = '',
        medications = [],
        advice = '',
        follow_up = '',
        reg_no = '',
        // vitals
        vital_bp = '', vital_pulse = '', vital_spo2 = '', vital_temp = '', vital_rr = '', vital_grbs = '',
    } = data;

    const hasVitals = vital_bp || vital_pulse || vital_spo2 || vital_temp || vital_rr || vital_grbs;

    const ageSex = [patient_age ? `${patient_age} yr` : '', patient_sex].filter(Boolean).join(' / ');

    const formatDate = (d) => {
        if (!d) return '';
        try {
            return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        } catch { return d; }
    };

    // Parse bullet lists (newline-separated) for Chief Complaints & Advice
    const bullets = (text) =>
        text
            .split('\n')
            .map(l => l.replace(/^[-•*]\s*/, '').trim())
            .filter(Boolean);

    // Parse diagnosis lines
    const diagLines = provisional_diagnosis.split('\n').map(l => l.trim()).filter(Boolean);

    // Filtered medications
    const meds = medications.filter(m => m.drug_name);

    return (
        <div className="rx-print-page" id="rx-print-page">
            {/* ── Title ── */}
            <h1 className="rx-print-title">STANDARD PRESCRIPTION FORMAT</h1>
            <hr className="rx-print-hr" />

            {/* ── Patient Details ── */}
            <section className="rx-section">
                <h2 className="rx-section-heading">Patient Details</h2>
                <table className="rx-info-table">
                    <tbody>
                        <tr>
                            <td className="rx-label">Name:</td>
                            <td className="rx-value">{patient_name || '—'}</td>
                            <td className="rx-label">Age / Sex:</td>
                            <td className="rx-value">{ageSex || '—'}</td>
                        </tr>
                        <tr>
                            <td className="rx-label">UHID:</td>
                            <td className="rx-value">{data.patient_uhid || data.id || '—'}</td>
                            <td className="rx-label">Date:</td>
                            <td className="rx-value">{formatDate(patient_date)}</td>
                        </tr>
                        <tr>
                            <td className="rx-label">Phone:</td>
                            <td className="rx-value">{patient_phone || '—'}</td>
                            <td className="rx-label">Address:</td>
                            <td className="rx-value">{patient_address || '—'}</td>
                        </tr>
                    </tbody>
                </table>
            </section>

            {/* ── Vitals (optional — prints only if filled) ── */}
            {hasVitals && (
                <section className="rx-section">
                    <h2 className="rx-section-heading">Vitals</h2>
                    <table className="rx-info-table rx-vitals-table">
                        <tbody>
                            <tr>
                                {vital_bp    && <><td className="rx-label">BP:</td><td className="rx-value">{vital_bp} mmHg</td></>}
                                {vital_pulse && <><td className="rx-label">Pulse:</td><td className="rx-value">{vital_pulse}/min</td></>}
                                {vital_spo2  && <><td className="rx-label">SpO₂:</td><td className="rx-value">{vital_spo2}%</td></>}
                                {vital_temp  && <><td className="rx-label">Temp:</td><td className="rx-value">{vital_temp}°F</td></>}
                                {vital_rr    && <><td className="rx-label">RR:</td><td className="rx-value">{vital_rr}/min</td></>}
                                {vital_grbs  && <><td className="rx-label">GRBS:</td><td className="rx-value">{vital_grbs} mg/dL</td></>}
                            </tr>
                        </tbody>
                    </table>
                </section>
            )}

            {/* ── Chief Complaints ── */}
            {chief_complaints && (
                <section className="rx-section">
                    <h2 className="rx-section-heading">Chief Complaints</h2>
                    <ul className="rx-bullet-list">
                        {bullets(chief_complaints).map((c, i) => (
                            <li key={i}>{c}</li>
                        ))}
                    </ul>
                </section>
            )}

            {/* ── Diagnosis ── */}
            {provisional_diagnosis && (
                <section className="rx-section">
                    <h2 className="rx-section-heading">Diagnosis</h2>
                    <ul className="rx-plain-list">
                        {diagLines.map((d, i) => (
                            <li key={i}>{d}</li>
                        ))}
                    </ul>
                </section>
            )}

            {/* ── Prescription ── */}
            <section className="rx-section">
                <h2 className="rx-section-heading">Prescription</h2>
                {meds.length === 0 ? (
                    <p className="rx-empty">No medications added.</p>
                ) : (
                    <table className="rx-med-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Drug</th>
                                <th>Dose</th>
                                <th>Route</th>
                                <th>Frequency</th>
                                <th>Duration</th>
                                <th>Instructions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {meds.map((m, i) => (
                                <tr key={i}>
                                    <td>{i + 1}</td>
                                    <td>{m.drug_name}</td>
                                    <td>{m.dose || '—'}</td>
                                    <td>{m.route || '—'}</td>
                                    <td>{m.frequency || '—'}</td>
                                    <td>{m.duration || '—'}</td>
                                    <td>{m.instructions || '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>

            {/* ── Advice ── */}
            {advice && (
                <section className="rx-section">
                    <h2 className="rx-section-heading">Advice</h2>
                    <ul className="rx-bullet-list">
                        {bullets(advice).map((a, i) => (
                            <li key={i}>{a}</li>
                        ))}
                    </ul>
                </section>
            )}

            {/* ── Follow-up ── */}
            {data.follow_up !== undefined && (
                <section className="rx-section">
                    <h2 className="rx-section-heading">Follow-up</h2>
                    <p className="rx-followup-value">{data.follow_up || '—'}</p>
                </section>
            )}

            {/* ── Footer / Signature ── */}
            <div className="rx-footer">
                <div className="rx-sig-block">
                    <span className="rx-sig-label">Doctor Signature:</span>
                    <span className="rx-sig-line" />
                </div>
                <div className="rx-sig-block">
                    <span className="rx-sig-label">Registration No:</span>
                    <span className="rx-sig-line">{reg_no || ''}</span>
                </div>
            </div>
        </div>
    );
}
