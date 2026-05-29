import React from 'react';
import './PrescriptionPrint.css';

/**
 * PrescriptionPrint — Arogya Clinic print layout.
 * Matches the paper prescription PDF exactly.
 *
 * Props:
 *   data      — the shared form state object from App.jsx
 */
export default function PrescriptionPrint({ data = {} }) {
    const {
        clinic_address = '',
        clinic_phone = '',
        reg_no = '',
        patient_name = '',
        patient_age = '',
        patient_sex = '',
        patient_date = '',
        patient_uhid = '',
        patient_address = '',
        patient_weight = '',
        vital_bp = '', vital_pulse = '', vital_spo2 = '', vital_temp = '', vital_rr = '', vital_grbs = '',
        cb_diabetes, cb_hypertension, cb_copd, cb_tb, cb_thyroid, cb_cad, cb_ckd, cb_stroke,
        cb_smoking, cb_alcohol, cb_tobacco, cb_iv_drug,
        ex_pallor, ex_icterus, ex_cyanosis, ex_clubbing, ex_edema,
        exam_rs = '', exam_cvs = '', exam_cns = '', exam_pa = '',
        chief_complaints = '',
        provisional_diagnosis = '',
        investigations = '',
        medications = [],
        advice = '',
        follow_up = '',
    } = data;

    const ageSex = [patient_age ? `${patient_age} yr` : '', patient_sex].filter(Boolean).join(' / ');

    const formatDate = (d) => {
        if (!d) return '';
        try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }); }
        catch { return d; }
    };

    const bullets = (text) =>
        text.split('\n').map(l => l.replace(/^[-•*]\s*/, '').trim()).filter(Boolean);

    const diagLines = provisional_diagnosis.split('\n').map(l => l.trim()).filter(Boolean);
    const meds = medications.filter(m => m.drug_name);
    const hasVitals = vital_bp || vital_pulse || vital_spo2 || vital_temp || vital_rr || vital_grbs;

    const LabelValue = ({ label, value }) => value ? (
        <span className="rx-label-value"><span className="rx-label">{label}:</span> {value}</span>
    ) : null;

    return (
        <div className="rx-print-page" id="rx-print-page">
            {/* ═══ CLINIC HEADER (Letterhead) ═══ */}
            <div className="rx-header">
                <div className="rx-header-top">
                    {/* Logo / Icon placeholder */}
                    <div className="rx-logo-area">
                        <span className="rx-logo-icon">🩺</span>
                    </div>
                    <div className="rx-header-text">
                        <h1 className="rx-clinic-name">आरोग्य क्लिनिक</h1>
                        <h2 className="rx-clinic-name-en">Arogya Clinic</h2>
                        <p className="rx-doctor-name">Dr. Deepak Kumar MD (General Medicine)</p>
                        <p className="rx-clinic-addr">
                            {clinic_address || '123, Health Nagar, Opp. District Hospital, City — 123456'}
                        </p>
                        <p className="rx-clinic-contact">
                            📞 {clinic_phone || '9876543210'} &nbsp;|&nbsp; Reg. No: {reg_no || 'MH-12345'}
                        </p>
                    </div>
                </div>
            </div>

            <hr className="rx-divider" />

            {/* ═══ PATIENT DETAILS ═══ */}
            <div className="rx-patient-row">
                <LabelValue label="Name" value={patient_name} />
                <LabelValue label="Age/Sex" value={ageSex} />
                <LabelValue label="Weight" value={patient_weight ? `${patient_weight} kg` : ''} />
                <LabelValue label="Date" value={formatDate(patient_date)} />
                <LabelValue label="OP No" value={patient_uhid || data.id || ''} />
                <LabelValue label="Address" value={patient_address} />
            </div>

            <hr className="rx-divider" />

            {/* ═══ TWO-COLUMN LAYOUT ═══ */}
            <div className="rx-two-col">
                {/* ── LEFT COLUMN: Vitals, Exam, Comorbidities ── */}
                <div className="rx-left-col">
                    {/* Vitals */}
                    {hasVitals && (
                        <div className="rx-block">
                            <h3 className="rx-block-title">❤️ Vitals</h3>
                            <div className="rx-vitals-grid">
                                {vital_bp && <span>BP: {vital_bp} mmHg</span>}
                                {vital_pulse && <span>Pulse: {vital_pulse}/min</span>}
                                {vital_spo2 && <span>SpO₂: {vital_spo2}%</span>}
                                {vital_temp && <span>Temp: {vital_temp}°F</span>}
                                {vital_rr && <span>RR: {vital_rr}/min</span>}
                                {vital_grbs && <span>GRBS: {vital_grbs} mg/dL</span>}
                            </div>
                        </div>
                    )}

                    {/* Physical Exam */}
                    {(ex_pallor || ex_icterus || ex_cyanosis || ex_clubbing || ex_edema) && (
                        <div className="rx-block">
                            <h3 className="rx-block-title">🔍 Physical Exam</h3>
                            <p className="rx-inline-bools">
                                {ex_pallor && 'Pallor '}{ex_icterus && 'Icterus '}{ex_cyanosis && 'Cyanosis '}
                                {ex_clubbing && 'Clubbing '}{ex_edema && 'Edema '}
                            </p>
                        </div>
                    )}

                    {/* Systemic Exam */}
                    {(exam_rs || exam_cvs || exam_cns || exam_pa) && (
                        <div className="rx-block">
                            <h3 className="rx-block-title">🫁 Systemic Exam</h3>
                            {exam_rs && <p><strong>RS:</strong> {exam_rs}</p>}
                            {exam_cvs && <p><strong>CVS:</strong> {exam_cvs}</p>}
                            {exam_cns && <p><strong>CNS:</strong> {exam_cns}</p>}
                            {exam_pa && <p><strong>PA:</strong> {exam_pa}</p>}
                        </div>
                    )}

                    {/* Comorbidities (compact) */}
                    {(cb_diabetes || cb_hypertension || cb_copd || cb_tb || cb_thyroid || cb_cad || cb_ckd || cb_stroke) && (
                        <div className="rx-block">
                            <h3 className="rx-block-title">🏥 Comorbidities</h3>
                            <p className="rx-inline-bools">
                                {cb_diabetes && 'DM '}{cb_hypertension && 'HTN '}{cb_copd && 'COPD '}
                                {cb_tb && 'TB '}{cb_thyroid && 'Thyroid '}{cb_cad && 'CAD '}
                                {cb_ckd && 'CKD '}{cb_stroke && 'Stroke '}
                            </p>
                        </div>
                    )}

                    {/* Addictions */}
                    {(cb_smoking || cb_alcohol || cb_tobacco || cb_iv_drug) && (
                        <div className="rx-block">
                            <h3 className="rx-block-title">🚬 Addictions</h3>
                            <p className="rx-inline-bools">
                                {cb_smoking && 'Smoking '}{cb_alcohol && 'Alcohol '}
                                {cb_tobacco && 'Tobacco '}{cb_iv_drug && 'IV Drug '}
                            </p>
                        </div>
                    )}

                    {/* Investigations */}
                    {investigations && (
                        <div className="rx-block">
                            <h3 className="rx-block-title">🧪 Investigations</h3>
                            <p>{investigations}</p>
                        </div>
                    )}
                </div>

                {/* ── RIGHT COLUMN: Complaints, Diagnosis ── */}
                <div className="rx-right-col">
                    {chief_complaints && (
                        <div className="rx-block">
                            <h3 className="rx-block-title">📋 Chief Complaints</h3>
                            <ul className="rx-bullet-list">
                                {bullets(chief_complaints).map((c, i) => <li key={i}>{c}</li>)}
                            </ul>
                        </div>
                    )}

                    {provisional_diagnosis && (
                        <div className="rx-block">
                            <h3 className="rx-block-title">📝 Diagnosis</h3>
                            <ul className="rx-plain-list">
                                {diagLines.map((d, i) => <li key={i}>{d}</li>)}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            <hr className="rx-divider" />

            {/* ═══ PRESCRIPTION TABLE ═══ */}
            <div className="rx-block">
                <h3 className="rx-block-title">💊 Prescription</h3>
                {meds.length === 0 ? (
                    <p className="rx-empty">No medications prescribed.</p>
                ) : (
                    <table className="rx-med-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Drug / Generic Name</th>
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
            </div>

            {/* ═══ DIET CHART (breakfast/lunch/dinner graphic) ═══ */}
            {advice && (
                <div className="rx-block">
                    <h3 className="rx-block-title">🥗 Diet & Advice</h3>
                    <ul className="rx-bullet-list">
                        {bullets(advice).map((a, i) => <li key={i}>{a}</li>)}
                    </ul>
                </div>
            )}

            {/* ═══ FOLLOW-UP ═══ */}
            {follow_up && (
                <div className="rx-block">
                    <h3 className="rx-block-title">📅 Follow-up</h3>
                    <p><strong>Next Visit:</strong> {follow_up}</p>
                </div>
            )}

            {/* ═══ DIET ROUTINE GRAPHIC ═══ */}
            <div className="rx-diet-chart">
                <h3 className="rx-block-title">🍽️ Diet Routine</h3>
                <div className="rx-diet-grid">
                    <div className="rx-diet-item">
                        <div className="rx-diet-icon">🌅</div>
                        <div className="rx-diet-label">Morning</div>
                        <div className="rx-diet-time">06 AM – 09 AM</div>
                        <div className="rx-diet-note">Light breakfast</div>
                    </div>
                    <div className="rx-diet-arrow">→</div>
                    <div className="rx-diet-item">
                        <div className="rx-diet-icon">☀️</div>
                        <div className="rx-diet-label">Afternoon</div>
                        <div className="rx-diet-time">12 PM – 02 PM</div>
                        <div className="rx-diet-note">Main meal</div>
                    </div>
                    <div className="rx-diet-arrow">→</div>
                    <div className="rx-diet-item">
                        <div className="rx-diet-icon">🌆</div>
                        <div className="rx-diet-label">Evening</div>
                        <div className="rx-diet-time">03 PM – 06 PM</div>
                        <div className="rx-diet-note">Snacks / Tea</div>
                    </div>
                    <div className="rx-diet-arrow">→</div>
                    <div className="rx-diet-item">
                        <div className="rx-diet-icon">🌙</div>
                        <div className="rx-diet-label">Dinner</div>
                        <div className="rx-diet-time">07 PM – 09 PM</div>
                        <div className="rx-diet-note">Light dinner</div>
                    </div>
                </div>
                <p className="rx-diet-note-bottom">
                    ⏰ Medicine Timing: <strong>06 AM–09 AM</strong> & <strong>03 PM–06 PM</strong>
                    &nbsp;|&nbsp; 📆 Validity: <strong>21 Days</strong>
                </p>
            </div>

            <hr className="rx-divider" />

            {/* ═══ SIGNATURE ═══ */}
            <div className="rx-footer">
                <div className="rx-sig-left">
                    <p><strong>Treating Doctor:</strong></p>
                    <div className="rx-sig-space" />
                    <p className="rx-sig-name">Dr. Deepak Kumar</p>
                    <p className="rx-sig-qual">MD (General Medicine)</p>
                </div>
                <div className="rx-sig-right">
                    <p><strong>Registration No:</strong></p>
                    <p>{reg_no || 'MH-12345'}</p>
                    <p><strong>Date:</strong> {formatDate(patient_date)}</p>
                </div>
            </div>

            <div className="rx-footer-note">
                <p>⚠️ This is a computer-generated prescription. Valid for 21 days from the date of issue.</p>
            </div>
        </div>
    );
}