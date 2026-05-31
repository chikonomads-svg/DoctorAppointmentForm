import React from 'react';
import './PrescriptionPrint.css';

/* ─────────────────────────────────────────────
   Arogya Clinic — PrescriptionPrint.jsx
   Exact replica of dr_deepak_kumar_prescription_template.pdf
   ───────────────────────────────────────────── */

export default function PrescriptionPrint({ data = {} }) {
  const {
    // Patient
    patient_name = '', patient_age = '', patient_sex = '',
    patient_weight = '', patient_address = '', patient_date = '',
    follow_up = '',

    // Clinic
    clinic_address = 'बड़ा जगनाथ, शक्ति धर्मकांटा, अहियापुर, मुजफ्फरपुर',
    clinic_phone = '8877556142',
    reg_no = 'BCMR50223',

    // Vitals
    vital_bp = '', vital_pulse = '', vital_spo2 = '',
    vital_temp = '', vital_rr = '', vital_grbs = '',

    // Clinical Exam
    ex_pallor = '', ex_icterus = '', ex_cyanosis = '',
    ex_clubbing = '', ex_edema = '',

    // Systemic Exam
    exam_rs = '', exam_cvs = '', exam_cns = '', exam_pa = '',

    // Comorbidities
    cb_diabetes = false, cb_hypertension = false, cb_copd = false,
    cb_tb = false, cb_thyroid = false, cb_cad = false,
    cb_ckd = false, cb_stroke = false,

    // Addictions
    cb_smoking = false, cb_alcohol = false,
    cb_tobacco = false, cb_iv_drug = false,

    // Clinical
    chief_complaints = '', provisional_diagnosis = '', investigations = '',

    // Advice
    advice = '',

    // OP No from id or uhid
    id = '', patient_uhid = '',

    // Medications (nested inside data)
    medications: meds = [],
  } = data;

  // Use uhid or id as OP number
  const op_no = patient_uhid || id || '';

  const formatDate = (d) => {
    if (!d) return new Date().toLocaleDateString('en-IN');
    try { return new Date(d).toLocaleDateString('en-IN'); } catch { return d; }
  };

  const examVal = (v) => {
    if (v === true || v === 'present' || v === 'yes') return 'Present';
    if (v === false || v === 'absent' || v === 'no' || v === '') return 'Absent';
    return v || 'Absent';
  };

  const noAddictions = !cb_smoking && !cb_alcohol && !cb_tobacco && !cb_iv_drug;

  return (
    <div className="rx-page">

      {/* ══════════════════════════════════════
          HEADER
      ══════════════════════════════════════ */}
      <div className="rx-header">
        {/* Left logo */}
        <div className="rx-header-logo">
          <div className="rx-caduceus">⚕</div>
          <div className="rx-logo-text">
            <div className="rx-logo-arogya">AROGYA</div>
            <div className="rx-logo-clinic">CLINIC</div>
            <div className="rx-logo-sub">DR. DEEPAK KUMAR</div>
          </div>
        </div>

        {/* Center — Hindi title */}
        <div className="rx-header-center">
          <div className="rx-hindi-title">आरोग्य क्लिनिक</div>
          <div className="rx-hindi-address">
            बड़ा जगनाथ, शक्ति धर्मकांटा, अहियापुर, मुजफ्फरपुर, 842001
          </div>
        </div>

        {/* Right — QR + Doctor info */}
        <div className="rx-header-right">
          <div className="rx-qr-placeholder">
            <div className="rx-qr-inner">
              <svg viewBox="0 0 100 100" width="60" height="60">
                <rect x="10" y="10" width="30" height="30" fill="none" stroke="#000" strokeWidth="3"/>
                <rect x="15" y="15" width="20" height="20" fill="#000"/>
                <rect x="60" y="10" width="30" height="30" fill="none" stroke="#000" strokeWidth="3"/>
                <rect x="65" y="15" width="20" height="20" fill="#000"/>
                <rect x="10" y="60" width="30" height="30" fill="none" stroke="#000" strokeWidth="3"/>
                <rect x="15" y="65" width="20" height="20" fill="#000"/>
                <rect x="48" y="48" width="6" height="6" fill="#000"/>
                <rect x="56" y="48" width="6" height="6" fill="#000"/>
                <rect x="64" y="48" width="6" height="6" fill="#000"/>
                <rect x="48" y="56" width="6" height="6" fill="#000"/>
                <rect x="64" y="56" width="6" height="6" fill="#000"/>
                <rect x="48" y="64" width="6" height="6" fill="#000"/>
                <rect x="56" y="64" width="6" height="6" fill="#000"/>
                <rect x="72" y="56" width="6" height="6" fill="#000"/>
                <rect x="80" y="64" width="6" height="6" fill="#000"/>
                <rect x="72" y="72" width="6" height="6" fill="#000"/>
                <rect x="80" y="80" width="6" height="6" fill="#000"/>
              </svg>
            </div>
          </div>
          <div className="rx-doctor-block">
            <div className="rx-dr-name-en">Dr. DEEPAK KUMAR <span className="rx-dr-quals">MBBS, MD. (General Medicine)</span></div>
            <div className="rx-dr-name-hi">डॉ॰ दीपक कुमार <span className="rx-dr-quals-hi">एम॰बी॰बी॰एस॰, एम॰डी॰ (जेनरल मेडिसीन)</span></div>
            <div className="rx-dr-designation">Consultant Physician &nbsp;<span className="rx-reg">Reg.No:- {reg_no}</span></div>
          </div>
        </div>
      </div>

      {/* Clinic info bar */}
      <div className="rx-clinic-bar">
        <span><strong>Clinic Address:</strong> {clinic_address}</span>
        <span><strong>Mobile No.:-</strong> {clinic_phone}</span>
        <span><strong>Validity:-</strong> 21 Days</span>
        <span><strong>06 AM–09 AM & 03 PM–06 PM</strong></span>
      </div>

      {/* ══════════════════════════════════════
          PATIENT ROW
      ══════════════════════════════════════ */}
      <table className="rx-patient-table">
        <tbody>
          <tr>
            <td className="rx-pt-cell rx-pt-label-cell"><strong>Date</strong></td>
            <td className="rx-pt-cell rx-pt-date">{formatDate(patient_date)}</td>
            <td className="rx-pt-cell rx-pt-label-cell"><strong>Patient Name</strong></td>
            <td className="rx-pt-cell rx-pt-name">{patient_name}</td>
            <td className="rx-pt-cell rx-pt-label-cell"><strong>Weight</strong></td>
            <td className="rx-pt-cell rx-pt-small">{patient_weight ? `${patient_weight} kg` : ''}</td>
            <td className="rx-pt-cell rx-pt-label-cell"><strong>OP No</strong></td>
            <td className="rx-pt-cell rx-pt-small">{op_no}</td>
          </tr>
          <tr>
            <td className="rx-pt-cell rx-pt-label-cell"><strong>Sex</strong></td>
            <td className="rx-pt-cell">{patient_sex}</td>
            <td className="rx-pt-cell rx-pt-label-cell"><strong>Age</strong></td>
            <td className="rx-pt-cell">{patient_age ? `${patient_age} yrs` : ''}</td>
            <td className="rx-pt-cell rx-pt-label-cell" colSpan="1"><strong>Address</strong></td>
            <td className="rx-pt-cell" colSpan="3">{patient_address}</td>
          </tr>
        </tbody>
      </table>

      {/* ══════════════════════════════════════
          BODY — Two Columns
      ══════════════════════════════════════ */}
      <div className="rx-body">

        {/* ── LEFT COLUMN ── */}
        <div className="rx-left-col">

          {/* 1. Vitals */}
          <div className="rx-section">
            <div className="rx-section-title"><span className="rx-num">1.</span> Vitals</div>
            <div className="rx-field-row"><span className="rx-field-label">BP:</span><span className="rx-field-line">{vital_bp}</span></div>
            <div className="rx-field-row"><span className="rx-field-label">Pulse:</span><span className="rx-field-line">{vital_pulse}</span></div>
            <div className="rx-field-row"><span className="rx-field-label">SPO<sub>2</sub>:</span><span className="rx-field-line">{vital_spo2}</span></div>
            <div className="rx-field-row"><span className="rx-field-label">Temp:</span><span className="rx-field-line">{vital_temp}</span></div>
            <div className="rx-field-row"><span className="rx-field-label">RR:</span><span className="rx-field-line">{vital_rr}</span></div>
            <div className="rx-field-row"><span className="rx-field-label">GRBS:</span><span className="rx-field-line">{vital_grbs}</span></div>
          </div>

          {/* 2. Clinical Examination */}
          <div className="rx-section">
            <div className="rx-section-title"><span className="rx-num">2.</span> Clinical Examination</div>
            <div className="rx-field-row"><span className="rx-field-label">Pallor:</span><span className="rx-field-line">{examVal(ex_pallor)}</span></div>
            <div className="rx-field-row"><span className="rx-field-label">Icterus:</span><span className="rx-field-line">{examVal(ex_icterus)}</span></div>
            <div className="rx-field-row"><span className="rx-field-label">Cyanosis:</span><span className="rx-field-line">{examVal(ex_cyanosis)}</span></div>
            <div className="rx-field-row"><span className="rx-field-label">Clubbing:</span><span className="rx-field-line">{examVal(ex_clubbing)}</span></div>
            <div className="rx-field-row"><span className="rx-field-label">Edema:</span><span className="rx-field-line">{examVal(ex_edema)}</span></div>
          </div>

          {/* 3. Systemic Examination */}
          <div className="rx-section">
            <div className="rx-section-title"><span className="rx-num">3.</span> Systemic Examination</div>
            <div className="rx-field-row"><span className="rx-field-label">Chest (Rs):</span><span className="rx-field-line">{exam_rs}</span></div>
            <div className="rx-field-row"><span className="rx-field-label">CVS:</span><span className="rx-field-line">{exam_cvs}</span></div>
            <div className="rx-field-row"><span className="rx-field-label">CNS:</span><span className="rx-field-line">{exam_cns}</span></div>
            <div className="rx-field-row"><span className="rx-field-label">P/A:</span><span className="rx-field-line">{exam_pa}</span></div>
          </div>

          {/* 4. Comorbidities */}
          <div className="rx-section">
            <div className="rx-section-title"><span className="rx-num">4.</span> Comorbidities</div>
            <div className="rx-checkbox-row"><span className={`rx-cb ${cb_diabetes ? 'rx-cb-checked' : ''}`}>{cb_diabetes ? '☑' : '☐'}</span> Diabetes</div>
            <div className="rx-checkbox-row"><span className={`rx-cb ${cb_hypertension ? 'rx-cb-checked' : ''}`}>{cb_hypertension ? '☑' : '☐'}</span> Hypertension</div>
            <div className="rx-checkbox-row"><span className={`rx-cb ${cb_copd ? 'rx-cb-checked' : ''}`}>{cb_copd ? '☑' : '☐'}</span> COPD / Asthma</div>
            <div className="rx-checkbox-row"><span className={`rx-cb ${cb_tb ? 'rx-cb-checked' : ''}`}>{cb_tb ? '☑' : '☐'}</span> Tuberculosis</div>
            <div className="rx-checkbox-row"><span className={`rx-cb ${cb_thyroid ? 'rx-cb-checked' : ''}`}>{cb_thyroid ? '☑' : '☐'}</span> Thyroid Disorder</div>
            <div className="rx-checkbox-row"><span className={`rx-cb ${cb_cad ? 'rx-cb-checked' : ''}`}>{cb_cad ? '☑' : '☐'}</span> CAD</div>
            <div className="rx-checkbox-row"><span className={`rx-cb ${cb_ckd ? 'rx-cb-checked' : ''}`}>{cb_ckd ? '☑' : '☐'}</span> CKD</div>
            <div className="rx-checkbox-row"><span className={`rx-cb ${cb_stroke ? 'rx-cb-checked' : ''}`}>{cb_stroke ? '☑' : '☐'}</span> Stroke</div>
          </div>

          {/* 5. Addiction */}
          <div className="rx-section">
            <div className="rx-section-title"><span className="rx-num">5.</span> Addiction</div>
            <div className="rx-checkbox-row"><span className={`rx-cb ${cb_smoking ? 'rx-cb-checked' : ''}`}>{cb_smoking ? '☑' : '☐'}</span> Smoking</div>
            <div className="rx-checkbox-row"><span className={`rx-cb ${cb_alcohol ? 'rx-cb-checked' : ''}`}>{cb_alcohol ? '☑' : '☐'}</span> Alcohol</div>
            <div className="rx-checkbox-row"><span className={`rx-cb ${cb_tobacco ? 'rx-cb-checked' : ''}`}>{cb_tobacco ? '☑' : '☐'}</span> Tobacco / Gutkha</div>
            <div className="rx-checkbox-row"><span className={`rx-cb ${cb_iv_drug ? 'rx-cb-checked' : ''}`}>{cb_iv_drug ? '☑' : '☐'}</span> IV Drug Use</div>
            <div className="rx-checkbox-row"><span className={`rx-cb ${noAddictions ? 'rx-cb-checked' : ''}`}>{noAddictions ? '☑' : '☐'}</span> None</div>
          </div>

          {/* 6. Investigations */}
          <div className="rx-section rx-section-investigations">
            <div className="rx-section-title"><span className="rx-num">6.</span> Investigations</div>
            <div className="rx-investigations-text">{investigations}</div>
          </div>

          {/* Diet Chart */}
          <div className="rx-diet-chart">
            <div className="rx-diet-title">Diet Routine</div>
            <div className="rx-diet-row">
              <div className="rx-diet-item">
                <span className="rx-diet-icon">🌅</span>
                <span className="rx-diet-label">Morning Breakfast</span>
                <span className="rx-diet-desc">1 bowl lukewarm milk · 1–2 roti + fruits · Plus 1 glass green tea</span>
              </div>
              <div className="rx-diet-item">
                <span className="rx-diet-icon">☀️</span>
                <span className="rx-diet-label">Lunch</span>
                <span className="rx-diet-desc">1 bowl daal · ¼ cup rice · 1 gm paneer · seasonal fruit</span>
              </div>
              <div className="rx-diet-item">
                <span className="rx-diet-icon">🌙</span>
                <span className="rx-diet-label">Dinner</span>
                <span className="rx-diet-desc">Daal 1 cup · roti + salad · 2 boiled eggs · 50 gm paneer · seasonal fruit</span>
              </div>
            </div>
          </div>

        </div>{/* end left col */}

        {/* ── RIGHT COLUMN ── */}
        <div className="rx-right-col">

          {/* Rx symbol */}
          <div className="rx-symbol">℞</div>

          {/* Chief Complaints */}
          <div className="rx-right-section">
            <div className="rx-right-label">Chief Complaints: -</div>
            <div className="rx-right-content rx-complaints-content">
              {chief_complaints
                ? chief_complaints.split('\n').map((line, i) => <div key={i}>{line}</div>)
                : <div className="rx-empty-lines"><div className="rx-dline"/><div className="rx-dline"/><div className="rx-dline"/></div>
              }
            </div>
          </div>

          {/* Provisional Diagnosis */}
          <div className="rx-right-section">
            <div className="rx-right-label">Provisional Diagnosis: -</div>
            <div className="rx-right-content rx-diagnosis-content">
              {provisional_diagnosis
                ? provisional_diagnosis.split('\n').map((line, i) => <div key={i}>{line}</div>)
                : <div className="rx-empty-lines"><div className="rx-dline"/><div className="rx-dline"/><div className="rx-dline"/></div>
              }
            </div>
          </div>

          {/* Prescription Table */}
          {meds && meds.filter(m => m.drug_name).length > 0 && (
            <div className="rx-rx-section">
              <table className="rx-med-table">
                <thead>
                  <tr>
                    <th className="rx-med-th rx-med-sno">#</th>
                    <th className="rx-med-th rx-med-drug">Drug / Generic Name</th>
                    <th className="rx-med-th">Dose</th>
                    <th className="rx-med-th">Route</th>
                    <th className="rx-med-th">Frequency</th>
                    <th className="rx-med-th">Duration</th>
                    <th className="rx-med-th rx-med-instr">Instructions</th>
                  </tr>
                </thead>
                <tbody>
                  {meds.filter(m => m.drug_name).map((med, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'rx-med-row-even' : ''}>
                      <td className="rx-med-td rx-med-sno">{i + 1}.</td>
                      <td className="rx-med-td rx-med-drug"><strong>{med.drug_name}</strong></td>
                      <td className="rx-med-td">{med.dose}</td>
                      <td className="rx-med-td">{med.route}</td>
                      <td className="rx-med-td">{med.frequency}</td>
                      <td className="rx-med-td">{med.duration}</td>
                      <td className="rx-med-td rx-med-instr">{med.instructions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Advice */}
          {advice && (
            <div className="rx-advice-section">
              <div className="rx-advice-label">Advice / Instructions: -</div>
              <div className="rx-advice-content">
                {advice.split('\n').map((line, i) => line.trim() && <div key={i} className="rx-advice-line">• {line}</div>)}
              </div>
            </div>
          )}

          {/* Follow-up */}
          {follow_up && (
            <div className="rx-followup">
              <strong>Follow-up:</strong> {follow_up}
            </div>
          )}

          {/* Signature block */}
          <div className="rx-signature-block">
            <div className="rx-sig-line">Signature: _______________</div>
            <div className="rx-sig-name">Dr. Deepak Kumar</div>
            <div className="rx-sig-qual">MD (General Medicine)</div>
          </div>

        </div>{/* end right col */}
      </div>{/* end body */}

      {/* Footer */}
      <div className="rx-footer">
        <div className="rx-footer-note">
          This is a computer-generated prescription. Valid for 21 days from the date of issue.
        </div>
        <div className="rx-footer-timing">
          OPD Timings: 06 AM–09 AM & 03 PM–06 PM
        </div>
      </div>

    </div>
  );
}