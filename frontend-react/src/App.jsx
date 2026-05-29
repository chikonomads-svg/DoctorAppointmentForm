import React, { useState, useEffect } from 'react';
import { checkHealth, savePrescription, getPrescription, deletePrescription } from './api';
import AppShell from './components/AppShell';
import Dashboard from './components/Dashboard';
import PatientDirectory from './components/PatientDirectory';
import Settings from './components/Settings';
import UserProfile from './components/UserProfile';
import LoadModal from './components/LoadModal';
import PrescriptionPrint from './components/PrescriptionPrint';

// ═══ Route options ═══
const ROUTE_OPTIONS = ['Oral', 'IV', 'IM', 'SC', 'Topical', 'Inhaled', 'Sublingual', 'PR', 'SL'];
const FREQ_OPTIONS = ['OD', 'BD', 'TDS', 'QID', 'SOS', 'HS', 'OD at night', 'OD morning', 'Weekly', 'Monthly', 'Alternate day', 'Stat'];

const VITAL_RANGES = {
  vital_spo2: { warn: 90, crit: 85 },
  vital_pulse: { low: 60, high: 100 },
  vital_temp: { low: 97, high: 99 },
  vital_rr: { low: 12, high: 20 },
  vital_grbs: { low: 70, high: 140 },
};

function getVitalStatus(key, val) {
  if (!val) return '';
  const n = parseFloat(val);
  if (isNaN(n)) return '';
  const range = VITAL_RANGES[key];
  if (!range) return '';
  if (range.crit !== undefined && n < range.crit) return 'danger';
  if (range.warn !== undefined && n < range.warn) return 'warning';
  if (range.low !== undefined && (n < range.low || n > range.high)) return 'warning';
  return 'normal';
}

const NORMAL_EXAM = { exam_rs: 'Clear air entry bilaterally, no wheeze/crepitations', exam_cvs: 'S1 S2 heard, no murmur', exam_cns: 'Conscious, oriented, no focal deficit', exam_pa: 'Soft, non-tender, no organomegaly' };
const DIAGNOSIS_CHIPS = ['Viral Fever', 'Hypertension Review', 'DM Follow-up', 'URTI', 'Gastritis', 'Migraine', 'Back Pain', 'Anxiety', 'Hypothyroidism', 'Bronchial Asthma', 'UTI', 'Anaemia'];
const ADVICE_PRESETS = [
  { label: 'Rest & Fluids', text: 'Rest, plenty of fluids, avoid cold food.' },
  { label: 'Diet & Exercise', text: 'Low salt diet, regular exercise 30 min/day, avoid oily/junk food.' },
  { label: 'Follow-up', text: 'Follow up after 5 days if symptoms persist.' },
  { label: 'Tab Timing', text: 'Take medicines after meals. Avoid self-medication.' },
];

const COMORBIDITIES = [
  { key: 'cb_diabetes', label: 'Diabetes', icon: '🍬', detailKeys: ['dm_duration','dm_treatment','dm_drugs','dm_fbs','dm_ppbs','dm_hba1c','dm_neuropathy','dm_retinopathy','dm_nephropathy','dm_cad','dm_foot','dm_notes'] },
  { key: 'cb_hypertension', label: 'Hypertension', icon: '💊', detailKeys: ['htn_duration','htn_treatment','htn_drugs','htn_bp_control','htn_lvh','htn_ckd','htn_retinopathy','htn_stroke','htn_notes'] },
  { key: 'cb_copd', label: 'COPD', icon: '🫁', detailKeys: ['copd_duration','copd_severity','copd_smoking_pack_yr','copd_inhalers','copd_exacerbations_yr','copd_pht','copd_cor_pulmonale','copd_notes'] },
  { key: 'cb_tb', label: 'TB', icon: '🦠', detailKeys: ['tb_type','tb_site','tb_status','tb_duration','tb_ds','tb_notes'] },
  { key: 'cb_thyroid', label: 'Thyroid', icon: '🔵', detailKeys: ['thyroid_type','thyroid_duration','thyroid_tsh','thyroid_drugs','thyroid_notes'] },
  { key: 'cb_cad', label: 'CAD', icon: '❤️', detailKeys: ['cad_type','cad_duration','cad_lvef','cad_drugs','cad_cabg','cad_pci','cad_stenting','cad_notes'] },
  { key: 'cb_ckd', label: 'CKD', icon: '🫘', detailKeys: ['ckd_stage','ckd_egfr','ckd_dialysis','ckd_dial_type','ckd_duration','ckd_drugs','ckd_notes'] },
  { key: 'cb_stroke', label: 'Stroke', icon: '🧠', detailKeys: ['stroke_type','stroke_duration','stroke_deficit','stroke_drugs','stroke_notes'] },
];
const ADDICTIONS = [{ key: 'cb_smoking', label: 'Smoking' },{ key: 'cb_alcohol', label: 'Alcohol' },{ key: 'cb_tobacco', label: 'Tobacco' },{ key: 'cb_iv_drug', label: 'IV Drug' }];

const EMPTY = () => ({
  clinic_address: '',
  clinic_phone: '',
  reg_no: '',
  patient_date: new Date().toISOString().split('T')[0],
  patient_name: '', patient_uhid: '', patient_age: '', patient_sex: '', patient_weight: '', patient_address: '', follow_up: '',
  cb_diabetes: false, cb_hypertension: false, cb_copd: false, cb_tb: false, cb_thyroid: false, cb_cad: false, cb_ckd: false, cb_stroke: false,
  cb_smoking: false, cb_alcohol: false, cb_tobacco: false, cb_iv_drug: false,
  dm_duration: '', dm_treatment: '', dm_drugs: '', dm_fbs: '', dm_ppbs: '', dm_hba1c: '',
  dm_neuropathy: false, dm_retinopathy: false, dm_nephropathy: false, dm_cad: false, dm_foot: false, dm_notes: '',
  htn_duration: '', htn_treatment: '', htn_drugs: '', htn_bp_control: '',
  htn_lvh: false, htn_ckd: false, htn_retinopathy: false, htn_stroke: false, htn_notes: '',
  copd_duration: '', copd_severity: '', copd_smoking_pack_yr: '', copd_inhalers: '',
  copd_exacerbations_yr: '', copd_pht: false, copd_cor_pulmonale: false, copd_notes: '',
  tb_type: '', tb_site: '', tb_status: '', tb_duration: '', tb_ds: '', tb_notes: '',
  thyroid_type: '', thyroid_duration: '', thyroid_tsh: '', thyroid_drugs: '', thyroid_notes: '',
  cad_type: '', cad_duration: '', cad_lvef: '', cad_drugs: '',
  cad_cabg: false, cad_pci: false, cad_stenting: false, cad_notes: '',
  ckd_stage: '', ckd_egfr: '', ckd_dialysis: false, ckd_dial_type: '', ckd_duration: '', ckd_drugs: '', ckd_notes: '',
  stroke_type: '', stroke_duration: '', stroke_deficit: '', stroke_drugs: '', stroke_notes: '',
  vital_bp: '', vital_pulse: '', vital_spo2: '', vital_temp: '', vital_rr: '', vital_grbs: '',
  chief_complaints: '', provisional_diagnosis: '', investigations: '',
  ex_pallor: false, ex_icterus: false, ex_cyanosis: false, ex_clubbing: false, ex_edema: false,
  exam_rs: '', exam_cvs: '', exam_cns: '', exam_pa: '',
  advice: '',
  medications: [{},{},{},{},{}].map(() => ({ drug_name: '', dose: '', route: '', frequency: '', duration: '', instructions: '' })),
  saved_at: new Date().toISOString(), id: '',
});

function genId() { return Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 7); }

let toastFn = null;
function Toast() {
  const [toasts, setToasts] = useState([]);
  toastFn = (msg, type = 'info') => { const id = Date.now(); setToasts(prev => [...prev, { id, msg, type }]); setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500); };
  return (<div className="toast-container">{toasts.map(t => (<div key={t.id} className={'toast toast-' + t.type}>{t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : 'ℹ️'} {t.msg}</div>))}</div>);
}
const showToast = (msg, type) => toastFn?.(msg, type);

function FormField({ label, children }) { return (<div className="form-group">{label && <label className="form-label">{label}</label>}{children}</div>); }

function Switch({ checked, onChange, label }) {
  return (<div className="rx-switch-row"><span style={{fontSize:14}}>{label}</span><div className={'rx-switch ' + (checked ? 'active' : '')} onClick={() => onChange(!checked)}><div className="rx-switch-knob"/></div></div>);
}

function ComorbidityDetail({ data, onChange, comorbidity }) {
  const [open, setOpen] = useState(false);
  const hasDetail = comorbidity.detailKeys.some(k => data[k]);
  return (<div style={{margin:'6px 0 4px 4px',paddingLeft:'var(--space-base)',borderLeft:'2px solid var(--primary-fixed)'}}><button onClick={()=>setOpen(!open)} style={{border:'none',background:'none',fontSize:12,color:'var(--primary)',cursor:'pointer',padding:'4px 0'}} type="button">{hasDetail ? '📋' : '➕'} {open ? '▲ Details' : '▼ Details'}</button>
    {open && <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))',gap:6,marginTop:6,padding:'var(--space-base)',background:'var(--surface-container-low)',borderRadius:'var(--radius)'}}>
      {comorbidity.detailKeys.map(key => {
        if (key.endsWith('_notes')) return <FormField key={key} label={key.replace(/_/g,' ')}><textarea rows={2} value={data[key]||''} onChange={e=>onChange({[key]:e.target.value})}/></FormField>;
        if (key.endsWith('_fbs')||key.endsWith('_ppbs')) return <FormField key={key} label={key.replace(/_/g,' ').toUpperCase()}><input type="number" step="0.1" value={data[key]||''} onChange={e=>onChange({[key]:e.target.value})}/></FormField>;
        if (['dm_neuropathy','dm_retinopathy','dm_nephropathy','dm_cad','dm_foot','htn_lvh','htn_ckd','htn_retinopathy','htn_stroke','copd_pht','copd_cor_pulmonale','cad_cabg','cad_pci','cad_stenting','ckd_dialysis'].includes(key))
          return <FormField key={key} label={key.replace(/_/g,' ')}><select value={data[key]?'yes':'no'} onChange={e=>onChange({[key]:e.target.value==='yes'})}><option value="no">No</option><option value="yes">Yes</option></select></FormField>;
        return <FormField key={key} label={key.replace(/_/g,' ').replace(/^[a-z]+_/,'')}><input type="text" value={data[key]||''} onChange={e=>onChange({[key]:e.target.value})}/></FormField>;
      })}
    </div>}
  </div>);
}

// ═══ Real doctor data from doctors-profile-chi.vercel.app ═══
const DOCTOR_INFO = {
  id: 'dr-deepak-kumar',
  name: 'Dr. Deepak Kumar',
  email: 'deepakkumar21121995@gmail.com',
  phone: '+91 9999438183',
  role: 'doctor',
  qualification: 'MBBS, MD (General Medicine)',
  regNo: 'BR/12345',
  education: 'MBBS (SKMCH, Muzaffarpur), MD General Medicine (DMCH Darbhanga)',
  college1: 'SKMCH - Sri Krishna Medical College & Hospital, Muzaffarpur',
  college2: 'DMCH - Darbhanga Medical College & Hospital',
  experience: '15+ Years in Clinical Practice',
  clinicName: 'Arogya Clinic',
  address: 'Saktidharamkata Bada Jagganath, near God Father Public School',
  city: 'Muzaffarpur, Bihar - 842004',
  clinicHours: 'Morning: 6 AM - 9 AM | Evening: 3 PM - 6 PM',
  consultationFee: '₹ 800',
  appointmentDuration: '20 Minutes',
  dailyLimit: '45 Patients',
  languages: 'English, Hindi',
};

export default function App() {
  const [user] = useState(DOCTOR_INFO);
  const [data, setData] = useState(EMPTY());
  const [currentId, setCurrentId] = useState(null);
  const [backendAvailable, setBE] = useState(false);
  const [showLoad, setShowLoad] = useState(false);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState('dashboard');

  useEffect(() => { checkHealth().then(ok => setBE(ok)); const iv = setInterval(() => checkHealth().then(ok => setBE(ok)), 30000); return () => clearInterval(iv); }, []);

  const handleNavigate = (target) => { if (target === 'form' && view !== 'form') { setData(EMPTY()); setCurrentId(null); } setView(target); };
  const handleNewConsultation = () => { setData(EMPTY()); setCurrentId(null); setView('form'); };
  const handleEnterForm = async (id) => {
    if (id && typeof id === 'string' && id !== 'new') { try { const p = await getPrescription(id); if (p) { setData(p); setCurrentId(p.id); } } catch {} }
    else { setData(EMPTY()); setCurrentId(null); } setView('form');
  };
  const handleSave = async () => {
    if (!data.patient_name?.trim()) { showToast('Please enter patient name', 'error'); return; }
    if (!backendAvailable) { showToast('Backend is offline', 'error'); return; }
    setSaving(true);
    try { const payload = { ...data, id: currentId || genId(), saved_at: new Date().toISOString() }; const saved = await savePrescription(payload); setCurrentId(saved.id); showToast('Saved!', 'success'); }
    catch (err) { showToast('Save failed: ' + err.message, 'error'); }
    setSaving(false);
  };
  const handleLoad = async (id) => { try { const p = await getPrescription(id); if (!p) { showToast('Not found', 'error'); return; } setData(p); setCurrentId(p.id); setShowLoad(false); showToast('Loaded: ' + p.patient_name, 'success'); } catch (err) { showToast('Load failed: ' + err.message, 'error'); } };
  const handleNew = () => { if (!window.confirm('Start new? Unsaved changes lost.')) return; setData(EMPTY()); setCurrentId(null); showToast('New prescription', 'info'); };
  const handleDelete = async () => { if (!currentId) { showToast('Nothing to delete', 'info'); return; } if (!window.confirm('Delete permanently?')) return; await deletePrescription(currentId); setData(EMPTY()); setCurrentId(null); showToast('Deleted', 'info'); };
  const update = (fields) => setData(prev => ({ ...prev, ...fields }));
  const updateMed = (index, fields) => { setData(prev => { const meds = [...prev.medications]; meds[index] = { ...meds[index], ...fields }; return { ...prev, medications: meds }; }); };
  const addMed = () => { setData(prev => ({ ...prev, medications: [...prev.medications, { drug_name:'', dose:'', route:'', frequency:'', duration:'', instructions:'' }] })); };
  const removeMed = (index) => { setData(prev => ({ ...prev, medications: prev.medications.filter((_,i) => i !== index) })); };

  const renderView = () => {
    switch (view) {
      case 'dashboard': return <Dashboard user={user} onEnterForm={handleEnterForm} onNewConsultation={handleNewConsultation} onNavigate={handleNavigate} />;
      case 'patients': return <PatientDirectory onEnterForm={handleEnterForm} />;
      case 'settings': return <Settings />;
      case 'profile': return <UserProfile user={user} />;
      case 'print': return (<div><div style={{display:'flex',gap:'var(--space-base)',marginBottom:'var(--space-md)',padding:'var(--space-sm) var(--space-lg)',background:'var(--surface-container-lowest)',borderBottom:'1px solid var(--outline-variant)',position:'sticky',top:0,zIndex:100}}><button className="btn btn-ghost" onClick={()=>setView('form')}><span className="material-symbols-outlined" style={{fontSize:18}}>edit</span> Back</button><button className="btn btn-primary" onClick={()=>window.print()}><span className="material-symbols-outlined" style={{fontSize:18}}>print</span> Print</button></div><PrescriptionPrint data={data}/></div>);
      case 'form': default: return renderForm();
    }
  };

  const renderForm = () => (
    <div className="rx-form">
      <div className="form-card" style={{padding:0}}>
        <div className="rx-clinic-header">
          <div className="rx-clinic-brand"><h1 className="rx-clinic-hindi">आरोग्य क्लिनिक</h1><div className="rx-clinic-divider"/><h1 className="rx-clinic-en">Arogya Clinic</h1></div>
          <p className="rx-clinic-doctor">Dr. Deepak Kumar</p>
          <p className="rx-clinic-qual">MBBS, MD (General Medicine) | Reg No: BR/12345</p>
          <div className="rx-clinic-contact-row">
            <span><span className="material-symbols-outlined" style={{fontSize:12,verticalAlign:'middle'}}>location_on</span> Saktidharamkata, Muzaffarpur, Bihar</span>
            <span><span className="material-symbols-outlined" style={{fontSize:12,verticalAlign:'middle'}}>call</span> +91 9999438183</span>
          </div>
        </div>
        <div style={{padding:'var(--space-lg)'}}>
          <div className="rx-patient-grid">
            <div className="rx-patient-field"><label>Patient Name</label><input type="text" placeholder="Enter name" value={data.patient_name||''} onChange={e=>update({patient_name:e.target.value})}/></div>
            <div className="rx-patient-field"><label>Age</label><input type="number" placeholder="Years" value={data.patient_age||''} onChange={e=>update({patient_age:e.target.value})}/></div>
            <div className="rx-patient-field"><label>Sex</label><select value={data.patient_sex||''} onChange={e=>update({patient_sex:e.target.value})}><option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select></div>
            <div className="rx-patient-field"><label>Weight (kg)</label><input type="number" placeholder="00" value={data.patient_weight||''} onChange={e=>update({patient_weight:e.target.value})}/></div>
            <div className="rx-patient-field"><label>OP No</label><input type="text" value={data.patient_uhid||'AC-2024-001'} onChange={e=>update({patient_uhid:e.target.value})}/></div>
            <div className="rx-patient-field" style={{gridColumn:'span 2'}}><label>Date</label><input type="date" value={data.patient_date||''} onChange={e=>update({patient_date:e.target.value})}/></div>
          </div>
          <div className="rx-two-col">
            <div style={{display:'flex',flexDirection:'column',gap:'var(--space-lg)'}}>
              <div className="rx-vitals-box">
                <h3><span className="material-symbols-outlined" style={{fontSize:18}}>monitor_heart</span> VITALS</h3>
                <div className="rx-vitals-grid">
                  <FormField label="BP (mmHg)"><input type="text" placeholder="120/80" value={data.vital_bp||''} onChange={e=>update({vital_bp:e.target.value})}/></FormField>
                  <FormField label="Pulse (bpm)"><input type="text" placeholder="72" value={data.vital_pulse||''} onChange={e=>update({vital_pulse:e.target.value})}/></FormField>
                  <FormField label="SpO₂ (%)"><input type="text" placeholder="98" value={data.vital_spo2||''} onChange={e=>update({vital_spo2:e.target.value})}/></FormField>
                  <FormField label="Temp (°F)"><input type="text" placeholder="98.6" value={data.vital_temp||''} onChange={e=>update({vital_temp:e.target.value})}/></FormField>
                  <FormField label="RR (/min)"><input type="text" placeholder="18" value={data.vital_rr||''} onChange={e=>update({vital_rr:e.target.value})}/></FormField>
                  <FormField label="GRBS (mg/dL)"><input type="text" placeholder="110" value={data.vital_grbs||''} onChange={e=>update({vital_grbs:e.target.value})}/></FormField>
                </div>
              </div>
              <div><h3 style={{fontSize:12,fontWeight:600,color:'var(--primary)',display:'flex',alignItems:'center',gap:'var(--space-base)',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:'var(--space-md)'}}><span className="material-symbols-outlined" style={{fontSize:18}}>personal_injury</span> PHYSICAL EXAM</h3>
                <div className="rx-exam-toggle-wrap">{['Pallor','Icterus','Cyanosis','Clubbing','Edema'].map(exam=>{const key='ex_'+exam.toLowerCase();return(<label key={exam} className={'rx-exam-chip '+(data[key]?'active':'')}><input type="checkbox" checked={!!data[key]} onChange={()=>update({[key]:!data[key]})}/>{exam}</label>);})}</div></div>
              <div><h3 style={{fontSize:12,fontWeight:600,color:'var(--primary)',display:'flex',alignItems:'center',gap:'var(--space-base)',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:'var(--space-md)'}}><span className="material-symbols-outlined" style={{fontSize:18}}>body_system</span> SYSTEMIC EXAM</h3>
                <div className="rx-systemic-grid"><FormField label="Respiratory (RS)"><textarea rows={2} placeholder="Clear air entry..." value={data.exam_rs||''} onChange={e=>update({exam_rs:e.target.value})}/></FormField><FormField label="Cardiovascular (CVS)"><textarea rows={2} placeholder="S1 S2 heard..." value={data.exam_cvs||''} onChange={e=>update({exam_cvs:e.target.value})}/></FormField><FormField label="Central Nervous (CNS)"><textarea rows={2} placeholder="Conscious, oriented..." value={data.exam_cns||''} onChange={e=>update({exam_cns:e.target.value})}/></FormField><FormField label="Per Abdomen (PA)"><textarea rows={2} placeholder="Soft, non-tender..." value={data.exam_pa||''} onChange={e=>update({exam_pa:e.target.value})}/></FormField></div></div>
              <div><h3 style={{fontSize:12,fontWeight:600,color:'var(--primary)',display:'flex',alignItems:'center',gap:'var(--space-base)',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:'var(--space-md)'}}><span className="material-symbols-outlined" style={{fontSize:18}}>biotech</span> INVESTIGATIONS</h3><textarea rows={3} placeholder="Blood tests, X-ray, Scans..." value={data.investigations||''} onChange={e=>update({investigations:e.target.value})}/></div>
             </div>
            <div style={{display:'flex',flexDirection:'column',gap:'var(--space-lg)'}}>
              <div><h3 style={{fontSize:12,fontWeight:600,color:'var(--primary)',display:'flex',alignItems:'center',gap:'var(--space-base)',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:'var(--space-md)'}}><span className="material-symbols-outlined" style={{fontSize:18}}>medical_information</span> CHIEF COMPLAINTS</h3><textarea rows={4} placeholder="Describe symptoms..." value={data.chief_complaints||''} onChange={e=>update({chief_complaints:e.target.value})}/></div>
              <div><h3 style={{fontSize:12,fontWeight:600,color:'var(--primary)',display:'flex',alignItems:'center',gap:'var(--space-base)',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:'var(--space-md)'}}><span className="material-symbols-outlined" style={{fontSize:18}}>stethoscope</span> PROVISIONAL DIAGNOSIS</h3>
                <div className="chip-row">{DIAGNOSIS_CHIPS.map(chip=>(<button key={chip} className="chip" onClick={()=>update({provisional_diagnosis:data.provisional_diagnosis?data.provisional_diagnosis+'\n'+chip:chip})} type="button">{chip}</button>))}</div>
                <textarea rows={3} placeholder="Enter diagnosis..." value={data.provisional_diagnosis||''} onChange={e=>update({provisional_diagnosis:e.target.value})}/></div>
              <div><h3 style={{fontSize:12,fontWeight:600,color:'var(--primary)',display:'flex',alignItems:'center',gap:'var(--space-base)',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:'var(--space-md)'}}><span className="material-symbols-outlined" style={{fontSize:18}}>history</span> COMORBIDITIES & ADDICTIONS</h3>
                <div className="rx-comorbid-grid"><div className="rx-toggle-row">{COMORBIDITIES.map(c=>(<label key={c.key} className="rx-toggle-item"><input type="checkbox" checked={!!data[c.key]} onChange={()=>update({[c.key]:!data[c.key]})}/><span>{c.icon} {c.label}</span></label>))}</div>
                <div><div style={{display:'flex',flexDirection:'column',gap:'var(--space-base)'}}>{ADDICTIONS.map(a=><Switch key={a.key} label={a.label} checked={!!data[a.key]} onChange={(v)=>update({[a.key]:v})}/>)}</div></div></div>
                {COMORBIDITIES.filter(c=>data[c.key]).map(c=><ComorbidityDetail key={c.key} data={data} onChange={update} comorbidity={c}/>)}</div>
            </div>
          </div>
          <div className="rx-med-section">
            <div className="rx-med-header"><h2>Rx</h2><button className="btn btn-ghost" onClick={addMed} style={{color:'var(--primary)',fontWeight:700}}><span className="material-symbols-outlined">add_circle</span> Add Medication</button></div>
            <div className="rx-med-table-wrap"><table className="rx-med-table"><thead><tr><th>Drug Name</th><th>Dose</th><th style={{width:100}}>Route</th><th style={{width:140}}>Frequency</th><th style={{width:80}}>Dur.</th><th>Instructions</th><th style={{width:40}}></th></tr></thead>
              <tbody>{data.medications.map((med,i)=>(<tr key={i}><td><input type="text" placeholder="e.g. Paracetamol 500mg" value={med.drug_name} onChange={e=>updateMed(i,{drug_name:e.target.value})}/></td><td><input type="text" placeholder="1 Tab" value={med.dose} onChange={e=>updateMed(i,{dose:e.target.value})}/></td><td><select value={med.route} onChange={e=>updateMed(i,{route:e.target.value})}><option value="">Route</option>{ROUTE_OPTIONS.map(r=><option key={r} value={r}>{r}</option>)}</select></td><td><select value={med.frequency} onChange={e=>updateMed(i,{frequency:e.target.value})}><option value="">Freq</option>{FREQ_OPTIONS.map(f=><option key={f} value={f}>{f}</option>)}</select></td><td><input type="text" placeholder="5 Days" value={med.duration} onChange={e=>updateMed(i,{duration:e.target.value})}/></td><td><input type="text" placeholder="After food" value={med.instructions} onChange={e=>updateMed(i,{instructions:e.target.value})}/></td><td><button className="dash-action-btn default" onClick={()=>removeMed(i)} title="Remove"><span className="material-symbols-outlined" style={{fontSize:18}}>close</span></button></td></tr>))}
              <tr className="rx-med-empty"><td colSpan={7}></td></tr></tbody></table></div></div>
          <div className="rx-advice-section">
            <div><div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'var(--space-md)'}}><h3 style={{fontSize:12,fontWeight:600,color:'var(--primary)',display:'flex',alignItems:'center',gap:'var(--space-base)',textTransform:'uppercase',letterSpacing:'0.5px'}}><span className="material-symbols-outlined" style={{fontSize:18}}>lightbulb</span> ADVICE & REMARKS</h3>
              <div className="chip-row" style={{marginBottom:0}}>{ADVICE_PRESETS.map(p=>(<button key={p.label} className="chip chip-advice" onClick={()=>update({advice:data.advice?data.advice+'\n'+p.text:p.text})} type="button">{p.label}</button>))}</div></div>
              <textarea rows={4} placeholder="General instructions..." value={data.advice||''} onChange={e=>update({advice:e.target.value})}/></div>
            <div className="rx-signature-box"><div className="rx-sig-line"/><p className="rx-sig-label">Dr. Deepak Kumar</p><p className="rx-sig-sub">MBBS, MD (General Medicine) | Reg: BR/12345</p></div>
          </div>
        </div>
        <div className="rx-disclaimer"><p>Not for Medico-Legal Purposes • Valid for 7 Days</p></div>
      </div>
      <div style={{position:'sticky',bottom:0,zIndex:90,display:'flex',justifyContent:'center',gap:'var(--space-base)',padding:'var(--space-sm) var(--space-lg)',background:'var(--surface-container-lowest)',borderTop:'1px solid var(--outline-variant)',boxShadow:'var(--shadow-md)',flexWrap:'wrap',paddingBottom:'calc(10px + env(safe-area-inset-bottom, 0px))'}} className="no-print">
        <button className="btn btn-ghost" onClick={()=>setView('dashboard')}><span className="material-symbols-outlined" style={{fontSize:18}}>dashboard</span> Dashboard</button>
        <button className="btn btn-secondary" onClick={handleNew}><span className="material-symbols-outlined" style={{fontSize:18}}>add</span> New</button>
        <button className="btn btn-secondary" onClick={()=>setShowLoad(true)}><span className="material-symbols-outlined" style={{fontSize:18}}>folder_open</span> Load</button>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}><span className="material-symbols-outlined" style={{fontSize:18}}>save</span> {saving?'Saving...':'Save'}</button>
        <button className="btn btn-secondary" onClick={()=>setView('print')}><span className="material-symbols-outlined" style={{fontSize:18}}>print</span> Print</button>
        <button className="btn btn-danger" onClick={handleDelete}><span className="material-symbols-outlined" style={{fontSize:18}}>delete</span> Delete</button>
      </div>
    </div>
  );

  return (<><Toast />{showLoad && <LoadModal onLoad={handleLoad} onClose={()=>setShowLoad(false)} />}
    {view === 'print' ? renderView() : <AppShell activeView={view} onNavigate={handleNavigate} onNewConsultation={handleNewConsultation} user={user} backendAvailable={backendAvailable}>{renderView()}</AppShell>}</>);
}