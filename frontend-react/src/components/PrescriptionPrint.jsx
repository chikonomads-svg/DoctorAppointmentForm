import React from 'react';
import './PrescriptionPrint.css';

export default function PrescriptionPrint({ data = {} }) {
  const {
    patient_name = '', patient_age = '', patient_sex = '',
    patient_weight = '', patient_address = '', patient_date = '',
    follow_up = '',
    clinic_address = 'बड़ा जगनाथ, शक्ति धर्मकांटा, अहियापुर, मुजफ्फरपुर',
    clinic_phone = '8877556142',
    reg_no = 'BCMR50223',
    vital_bp = '', vital_pulse = '', vital_spo2 = '',
    vital_temp = '', vital_rr = '', vital_grbs = '',
    ex_pallor = '', ex_icterus = '', ex_cyanosis = '',
    ex_clubbing = '', ex_edema = '',
    exam_rs = '', exam_cvs = '', exam_cns = '', exam_pa = '',
    cb_diabetes = false, cb_hypertension = false, cb_copd = false,
    cb_tb = false, cb_thyroid = false, cb_cad = false,
    cb_ckd = false, cb_stroke = false,
    cb_smoking = false, cb_alcohol = false,
    cb_tobacco = false, cb_iv_drug = false,
    chief_complaints = '', provisional_diagnosis = '', investigations = '',
    advice = '', patient_uhid = '', id = '',
    medications: meds = [],
  } = data;

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

      {/* HEADER — 3 equal sections */}
      <div className="rx-header">
        <div className="rx-header-logo">
          <div className="rx-caduceus">⚕</div>
          <div className="rx-logo-text">
            <div className="rx-logo-arogya">AROGYA</div>
            <div className="rx-logo-clinic">CLINIC</div>
            <div className="rx-logo-sub">DR. DEEPAK KUMAR</div>
          </div>
        </div>

        <div className="rx-header-center">
          <div className="rx-hindi-title">आरोग्य क्लिनिक</div>
          <div className="rx-hindi-address">बड़ा जगनाथ, शक्ति धर्मकांटा, अहियापुर, मुजफ्फरपुर, 842001</div>
        </div>

        <div className="rx-header-right">
          <div className="rx-qr-placeholder">
            <div className="rx-qr-inner">
              <svg viewBox="0 0 100 100" width="55" height="55">
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
                <rect x="72" y="56" width="6" height="6" fill="#000"/>
                <rect x="48" y="64" width="6" height="6" fill="#000"/>
                <rect x="72" y="64" width="6" height="6" fill="#000"/>
                <rect x="80" y="72" width="6" height="6" fill="#000"/>
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

      {/* CLINIC BAR */}
      <div className="rx-clinic-bar">
        <span><strong>Clinic Address:</strong> {clinic_address}</span>
        <span><strong>Mobile No.:-</strong> {clinic_phone}</span>
        <span><strong>Validity:-</strong> 21 Days</span>
        <span><strong>06 AM–09 AM & 03 PM–06 PM</strong></span>
      </div>

      {/* PATIENT TABLE */}
      <table className="rx-patient-table">
        <tbody>
          <tr>
            <td className="rx-pt-cell rx-pt-label-cell"><strong>Date</strong></td>
            <td className="rx-pt-cell" style={{width:'22mm'}}>{formatDate(patient_date)}</td>
            <td className="rx-pt-cell rx-pt-label-cell"><strong>Patient Name</strong></td>
            <td className="rx-pt-cell">{patient_name}</td>
            <td className="rx-pt-cell rx-pt-label-cell"><strong>Weight</strong></td>
            <td className="rx-pt-cell" style={{width:'14mm'}}>{patient_weight ? `${patient_weight} kg` : ''}</td>
          </tr>
          <tr>
            <td className="rx-pt-cell rx-pt-label-cell"><strong>Sex</strong></td>
            <td className="rx-pt-cell">{patient_sex}</td>
            <td className="rx-pt-cell rx-pt-label-cell"><strong>Age</strong></td>
            <td className="rx-pt-cell">{patient_age ? `${patient_age} yrs` : ''}</td>
            <td className="rx-pt-cell rx-pt-label-cell"><strong>Address</strong></td>
            <td className="rx-pt-cell">{patient_address}</td>
          </tr>
        </tbody>
      </table>

      {/* BODY */}
      <div className="rx-body">

        {/* LEFT COLUMN */}
        <div className="rx-left-col">

          <div className="rx-section">
            <div className="rx-section-title">1. Vitals</div>
            <div className="rx-field-row"><span className="rx-field-label">BP:</span><span className="rx-field-line">{vital_bp}</span></div>
            <div className="rx-field-row"><span className="rx-field-label">Pulse:</span><span className="rx-field-line">{vital_pulse}</span></div>
            <div className="rx-field-row"><span className="rx-field-label">SPO<sub>2</sub>:</span><span className="rx-field-line">{vital_spo2}</span></div>
            <div className="rx-field-row"><span className="rx-field-label">Temp:</span><span className="rx-field-line">{vital_temp}</span></div>
            <div className="rx-field-row"><span className="rx-field-label">RR:</span><span className="rx-field-line">{vital_rr}</span></div>
            <div className="rx-field-row"><span className="rx-field-label">GRBS:</span><span className="rx-field-line">{vital_grbs}</span></div>
          </div>

          <div className="rx-section">
            <div className="rx-section-title">2. Clinical Examination</div>
            <div className="rx-field-row"><span className="rx-field-label">Pallor:</span><span className="rx-field-line">{examVal(ex_pallor)}</span></div>
            <div className="rx-field-row"><span className="rx-field-label">Icterus:</span><span className="rx-field-line">{examVal(ex_icterus)}</span></div>
            <div className="rx-field-row"><span className="rx-field-label">Cyanosis:</span><span className="rx-field-line">{examVal(ex_cyanosis)}</span></div>
            <div className="rx-field-row"><span className="rx-field-label">Clubbing:</span><span className="rx-field-line">{examVal(ex_clubbing)}</span></div>
            <div className="rx-field-row"><span className="rx-field-label">Edema:</span><span className="rx-field-line">{examVal(ex_edema)}</span></div>
          </div>

          <div className="rx-section">
            <div className="rx-section-title">3. Systemic Examination</div>
            <div className="rx-field-row"><span className="rx-field-label">Chest (Rs):</span><span className="rx-field-line">{exam_rs}</span></div>
            <div className="rx-field-row"><span className="rx-field-label">CVS:</span><span className="rx-field-line">{exam_cvs}</span></div>
            <div className="rx-field-row"><span className="rx-field-label">CNS:</span><span className="rx-field-line">{exam_cns}</span></div>
            <div className="rx-field-row"><span className="rx-field-label">P/A:</span><span className="rx-field-line">{exam_pa}</span></div>
          </div>

          <div className="rx-section">
            <div className="rx-section-title">4. Comorbidities</div>
            <div className="rx-checkbox-row"><span className={`rx-cb ${cb_diabetes ? 'rx-cb-checked' : ''}`}>{cb_diabetes ? '☑' : '☐'}</span> Diabetes</div>
            <div className="rx-checkbox-row"><span className={`rx-cb ${cb_hypertension ? 'rx-cb-checked' : ''}`}>{cb_hypertension ? '☑' : '☐'}</span> Hypertension</div>
            <div className="rx-checkbox-row"><span className={`rx-cb ${cb_copd ? 'rx-cb-checked' : ''}`}>{cb_copd ? '☑' : '☐'}</span> COPD / Asthma</div>
            <div className="rx-checkbox-row"><span className={`rx-cb ${cb_tb ? 'rx-cb-checked' : ''}`}>{cb_tb ? '☑' : '☐'}</span> Tuberculosis</div>
            <div className="rx-checkbox-row"><span className={`rx-cb ${cb_thyroid ? 'rx-cb-checked' : ''}`}>{cb_thyroid ? '☑' : '☐'}</span> Thyroid Disorder</div>
            <div className="rx-checkbox-row"><span className={`rx-cb ${cb_cad ? 'rx-cb-checked' : ''}`}>{cb_cad ? '☑' : '☐'}</span> CAD</div>
            <div className="rx-checkbox-row"><span className={`rx-cb ${cb_ckd ? 'rx-cb-checked' : ''}`}>{cb_ckd ? '☑' : '☐'}</span> CKD</div>
            <div className="rx-checkbox-row"><span className={`rx-cb ${cb_stroke ? 'rx-cb-checked' : ''}`}>{cb_stroke ? '☑' : '☐'}</span> Stroke</div>
          </div>

          <div className="rx-section">
            <div className="rx-section-title">5. Addiction</div>
            <div className="rx-checkbox-row"><span className={`rx-cb ${cb_smoking ? 'rx-cb-checked' : ''}`}>{cb_smoking ? '☑' : '☐'}</span> Smoking</div>
            <div className="rx-checkbox-row"><span className={`rx-cb ${cb_alcohol ? 'rx-cb-checked' : ''}`}>{cb_alcohol ? '☑' : '☐'}</span> Alcohol</div>
            <div className="rx-checkbox-row"><span className={`rx-cb ${cb_tobacco ? 'rx-cb-checked' : ''}`}>{cb_tobacco ? '☑' : '☐'}</span> Tobacco / Gutkha</div>
            <div className="rx-checkbox-row"><span className={`rx-cb ${cb_iv_drug ? 'rx-cb-checked' : ''}`}>{cb_iv_drug ? '☑' : '☐'}</span> IV Drug Use</div>
            <div className="rx-checkbox-row"><span className={`rx-cb ${noAddictions ? 'rx-cb-checked' : ''}`}>{noAddictions ? '☑' : '☐'}</span> None</div>
          </div>

          <div className="rx-section rx-section-investigations">
            <div className="rx-section-title">6. Investigations</div>
            <div className="rx-investigations-text">{investigations}</div>
          </div>

          {/* Diet Chart — card layout */}
          <div className="rx-diet-chart">
            <div className="rx-diet-title">🥗 Diet Routine</div>
            <div className="rx-diet-row">
              <div className="rx-diet-item">
                <div className="rx-diet-icon">🌅</div>
                <div className="rx-diet-label">Morning Breakfast</div>
                <div className="rx-diet-desc">1 bowl lukewarm milk with muesli/oats · 1–2 roti + seasonal fruits · 1 glass green tea</div>
              </div>
              <div className="rx-diet-item">
                <div className="rx-diet-icon">☀️</div>
                <div className="rx-diet-label">Lunch</div>
                <div className="rx-diet-desc">1 bowl daal · ¼ cup boiled rice · 50 gm paneer · seasonal fruit</div>
              </div>
              <div className="rx-diet-item">
                <div className="rx-diet-icon">🌙</div>
                <div className="rx-diet-label">Dinner</div>
                <div className="rx-diet-desc">Daal 1 cup · roti + salad · 2 boiled eggs · 50 gm paneer · seasonal fruit</div>
              </div>
            </div>
          </div>

        </div>{/* end left col */}

        {/* RIGHT COLUMN */}
        <div className="rx-right-col">
          <div className="rx-symbol">℞</div>

          <div className="rx-right-section">
            <div className="rx-right-label">Chief Complaints: -</div>
            <div className="rx-right-content rx-complaints-content">
              {chief_complaints
                ? chief_complaints.split('\n').map((line, i) => <div key={i}>{line}</div>)
                : <div className="rx-empty-lines"><div className="rx-dline"/><div className="rx-dline"/><div className="rx-dline"/></div>
              }
            </div>
          </div>

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

          {/* SIGNATURE */}
          <div className="rx-signature-block">
            <div className="rx-sig-line">Signature: _______________</div>
            <div className="rx-sig-name">Dr. Deepak Kumar</div>
            <div className="rx-sig-qual">MD (General Medicine)</div>
          </div>

        </div>{/* end right col */}
      </div>{/* end body */}

      {/* FOOTER */}
      <div className="rx-footer">
        <div className="rx-footer-note">This is a computer-generated prescription. Valid for 21 days from the date of issue.</div>
        <div className="rx-footer-timing">OPD Timings: 06 AM–09 AM & 03 PM–06 PM</div>
      </div>

    </div>
  );
}