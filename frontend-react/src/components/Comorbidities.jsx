import React from 'react';

// ── Reusable sub-components ───────────────────────────────────────────────────

function CheckChips({ flags, data, toggle }) {
    return (
        <div className="checkbox-grid compact">
            {flags.map(([key, label]) => (
                <label key={key} className={`chip-check ${data[key] ? 'active' : ''}`}>
                    <input type="checkbox" checked={!!data[key]} onChange={() => toggle(key)} />
                    {label}
                </label>
            ))}
        </div>
    );
}

function NotesField({ noteKey, data, set }) {
    return (
        <div className="field-group full-width notes-field">
            <label>Additional Notes <span className="optional-tag">optional</span></label>
            <textarea
                rows={2}
                placeholder="Any additional observations, recent reports, special considerations…"
                value={data[noteKey] || ''}
                onChange={e => set(noteKey, e.target.value)}
            />
        </div>
    );
}

function ExpandablePanel({ color, title, children }) {
    return (
        <div className="expandable-panel" style={{ borderColor: `${color}55`, background: `${color}08` }}>
            <div className="expandable-panel-title" style={{ color }}>{title}</div>
            {children}
        </div>
    );
}

// ── Disease-specific panels ───────────────────────────────────────────────────

const DM_COMPLICATIONS = [
    ['dm_neuropathy', 'Neuropathy'], ['dm_retinopathy', 'Retinopathy'],
    ['dm_nephropathy', 'Nephropathy'], ['dm_cad', 'CAD'], ['dm_foot', 'Diabetic Foot'],
];

function DiabetesPanel({ data, set, toggle }) {
    return (
        <ExpandablePanel color="#d29922" title="🍬 Diabetes Details">
            <div className="dm-grid">
                <div className="field-group">
                    <label>Duration (years)</label>
                    <input type="text" placeholder="e.g. 5" value={data.dm_duration || ''} onChange={e => set('dm_duration', e.target.value)} />
                </div>
                <div className="field-group">
                    <label>Treatment</label>
                    <select value={data.dm_treatment || ''} onChange={e => set('dm_treatment', e.target.value)}>
                        <option value="">Select</option>
                        <option>OHA (Oral Hypoglycemic Agents)</option>
                        <option>Insulin</option>
                        <option>Both</option>
                    </select>
                </div>
                <div className="field-group full-width">
                    <label>Current Drugs</label>
                    <input type="text" placeholder="e.g. Metformin 500mg, Glipizide 5mg" value={data.dm_drugs || ''} onChange={e => set('dm_drugs', e.target.value)} />
                </div>
                <div className="field-group">
                    <label>FBS (mg/dL)</label>
                    <input type="number" placeholder="Fasting Blood Sugar" value={data.dm_fbs || ''} onChange={e => set('dm_fbs', e.target.value ? parseFloat(e.target.value) : null)} />
                </div>
                <div className="field-group">
                    <label>PPBS (mg/dL)</label>
                    <input type="number" placeholder="Post-Prandial Blood Sugar" value={data.dm_ppbs || ''} onChange={e => set('dm_ppbs', e.target.value ? parseFloat(e.target.value) : null)} />
                </div>
                <div className="field-group">
                    <label>HbA1c (%)</label>
                    <input type="text" placeholder="e.g. 7.2" value={data.dm_hba1c || ''} onChange={e => set('dm_hba1c', e.target.value)} />
                </div>
                <div className="field-group full-width">
                    <label>Complications</label>
                    <CheckChips flags={DM_COMPLICATIONS} data={data} toggle={toggle} />
                </div>
                <NotesField noteKey="dm_notes" data={data} set={set} />
            </div>
        </ExpandablePanel>
    );
}

const HTN_EOD = [
    ['htn_lvh', 'LVH'], ['htn_ckd', 'CKD'], ['htn_retinopathy', 'Retinopathy'], ['htn_stroke', 'Stroke'],
];

function HypertensionPanel({ data, set, toggle }) {
    return (
        <ExpandablePanel color="#58a6ff" title="💊 Hypertension Details">
            <div className="dm-grid">
                <div className="field-group">
                    <label>Duration (years)</label>
                    <input type="text" placeholder="e.g. 3" value={data.htn_duration || ''} onChange={e => set('htn_duration', e.target.value)} />
                </div>
                <div className="field-group">
                    <label>Treatment</label>
                    <select value={data.htn_treatment || ''} onChange={e => set('htn_treatment', e.target.value)}>
                        <option value="">Select</option>
                        <option>Monotherapy</option>
                        <option>Multiple drugs</option>
                        <option>Lifestyle only</option>
                    </select>
                </div>
                <div className="field-group full-width">
                    <label>Current Drugs</label>
                    <input type="text" placeholder="e.g. Amlodipine 5mg, Telmisartan 40mg" value={data.htn_drugs || ''} onChange={e => set('htn_drugs', e.target.value)} />
                </div>
                <div className="field-group full-width">
                    <label>BP Control</label>
                    <div className="radio-group">
                        {['Good', 'Moderate', 'Poor'].map(opt => (
                            <label key={opt} className={`chip-radio ${data.htn_bp_control === opt ? 'active' : ''}`}>
                                <input type="radio" checked={data.htn_bp_control === opt} onChange={() => set('htn_bp_control', opt)} />{opt}
                            </label>
                        ))}
                    </div>
                </div>
                <div className="field-group full-width">
                    <label>End Organ Damage</label>
                    <CheckChips flags={HTN_EOD} data={data} toggle={toggle} />
                </div>
                <NotesField noteKey="htn_notes" data={data} set={set} />
            </div>
        </ExpandablePanel>
    );
}

const COPD_COMP = [
    ['copd_pht', 'Pulmonary HTN'], ['copd_cor_pulmonale', 'Cor Pulmonale'],
];

function CopDPanel({ data, set, toggle }) {
    return (
        <ExpandablePanel color="#a371f7" title="🫁 COPD Details">
            <div className="dm-grid">
                <div className="field-group">
                    <label>Duration (years)</label>
                    <input type="text" placeholder="e.g. 8" value={data.copd_duration || ''} onChange={e => set('copd_duration', e.target.value)} />
                </div>
                <div className="field-group">
                    <label>Severity (GOLD)</label>
                    <select value={data.copd_severity || ''} onChange={e => set('copd_severity', e.target.value)}>
                        <option value="">Select</option>
                        <option>GOLD 1 (Mild)</option>
                        <option>GOLD 2 (Moderate)</option>
                        <option>GOLD 3 (Severe)</option>
                        <option>GOLD 4 (Very Severe)</option>
                    </select>
                </div>
                <div className="field-group">
                    <label>Smoking (Pack-years)</label>
                    <input type="text" placeholder="e.g. 20" value={data.copd_smoking_pack_yr || ''} onChange={e => set('copd_smoking_pack_yr', e.target.value)} />
                </div>
                <div className="field-group">
                    <label>Exacerbations/year</label>
                    <input type="text" placeholder="e.g. 2" value={data.copd_exacerbations_yr || ''} onChange={e => set('copd_exacerbations_yr', e.target.value)} />
                </div>
                <div className="field-group full-width">
                    <label>Current Inhalers / Drugs</label>
                    <input type="text" placeholder="e.g. Tiotropium, Budesonide/Formoterol" value={data.copd_inhalers || ''} onChange={e => set('copd_inhalers', e.target.value)} />
                </div>
                <div className="field-group full-width">
                    <label>Complications</label>
                    <CheckChips flags={COPD_COMP} data={data} toggle={toggle} />
                </div>
                <NotesField noteKey="copd_notes" data={data} set={set} />
            </div>
        </ExpandablePanel>
    );
}

function TBPanel({ data, set }) {
    return (
        <ExpandablePanel color="#3fb950" title="🦠 Tuberculosis Details">
            <div className="dm-grid">
                <div className="field-group">
                    <label>Type</label>
                    <select value={data.tb_type || ''} onChange={e => set('tb_type', e.target.value)}>
                        <option value="">Select</option>
                        <option>PTB (Pulmonary)</option>
                        <option>EPTB (Extrapulmonary)</option>
                    </select>
                </div>
                {data.tb_type === 'EPTB (Extrapulmonary)' && (
                    <div className="field-group">
                        <label>EPTB Site</label>
                        <input type="text" placeholder="e.g. Lymph node, Pleural, Spine" value={data.tb_site || ''} onChange={e => set('tb_site', e.target.value)} />
                    </div>
                )}
                <div className="field-group">
                    <label>Treatment Status</label>
                    <select value={data.tb_status || ''} onChange={e => set('tb_status', e.target.value)}>
                        <option value="">Select</option>
                        <option>New / On DOTS</option>
                        <option>Completed</option>
                        <option>Defaulter</option>
                        <option>Re-treatment</option>
                    </select>
                </div>
                <div className="field-group">
                    <label>Duration (months)</label>
                    <input type="text" placeholder="e.g. 6" value={data.tb_duration || ''} onChange={e => set('tb_duration', e.target.value)} />
                </div>
                <div className="field-group">
                    <label>Drug Sensitivity</label>
                    <select value={data.tb_ds || ''} onChange={e => set('tb_ds', e.target.value)}>
                        <option value="">Select</option>
                        <option>Drug Sensitive (DS-TB)</option>
                        <option>MDR-TB</option>
                        <option>XDR-TB</option>
                        <option>Pre-XDR</option>
                    </select>
                </div>
                <NotesField noteKey="tb_notes" data={data} set={set} />
            </div>
        </ExpandablePanel>
    );
}

function ThyroidPanel({ data, set }) {
    return (
        <ExpandablePanel color="#f78166" title="🔵 Thyroid Details">
            <div className="dm-grid">
                <div className="field-group">
                    <label>Type</label>
                    <select value={data.thyroid_type || ''} onChange={e => set('thyroid_type', e.target.value)}>
                        <option value="">Select</option>
                        <option>Hypothyroidism</option>
                        <option>Hyperthyroidism</option>
                        <option>Simple Goiter</option>
                        <option>Hashimoto's</option>
                        <option>Graves' Disease</option>
                    </select>
                </div>
                <div className="field-group">
                    <label>Duration (years)</label>
                    <input type="text" placeholder="e.g. 4" value={data.thyroid_duration || ''} onChange={e => set('thyroid_duration', e.target.value)} />
                </div>
                <div className="field-group">
                    <label>Latest TSH (mIU/L)</label>
                    <input type="text" placeholder="e.g. 5.2" value={data.thyroid_tsh || ''} onChange={e => set('thyroid_tsh', e.target.value)} />
                </div>
                <div className="field-group full-width">
                    <label>Current Drugs</label>
                    <input type="text" placeholder="e.g. Levothyroxine 50mcg OD" value={data.thyroid_drugs || ''} onChange={e => set('thyroid_drugs', e.target.value)} />
                </div>
                <NotesField noteKey="thyroid_notes" data={data} set={set} />
            </div>
        </ExpandablePanel>
    );
}

const CAD_INTERVENTIONS = [['cad_cabg', 'CABG'], ['cad_pci', 'PCI'], ['cad_stenting', 'Stenting']];

function CAdPanel({ data, set, toggle }) {
    return (
        <ExpandablePanel color="#ff7b72" title="❤️ CAD Details">
            <div className="dm-grid">
                <div className="field-group">
                    <label>Type</label>
                    <select value={data.cad_type || ''} onChange={e => set('cad_type', e.target.value)}>
                        <option value="">Select</option>
                        <option>Stable Angina</option>
                        <option>Unstable Angina</option>
                        <option>STEMI</option>
                        <option>NSTEMI</option>
                        <option>Heart Failure</option>
                        <option>Post-CABG</option>
                        <option>Post-PCI</option>
                    </select>
                </div>
                <div className="field-group">
                    <label>Duration (years)</label>
                    <input type="text" placeholder="e.g. 2" value={data.cad_duration || ''} onChange={e => set('cad_duration', e.target.value)} />
                </div>
                <div className="field-group">
                    <label>LVEF (%)</label>
                    <input type="text" placeholder="e.g. 45" value={data.cad_lvef || ''} onChange={e => set('cad_lvef', e.target.value)} />
                </div>
                <div className="field-group full-width">
                    <label>Current Drugs</label>
                    <input type="text" placeholder="e.g. Aspirin 75mg, Atorvastatin 40mg, Metoprolol 25mg" value={data.cad_drugs || ''} onChange={e => set('cad_drugs', e.target.value)} />
                </div>
                <div className="field-group full-width">
                    <label>Past Interventions</label>
                    <CheckChips flags={CAD_INTERVENTIONS} data={data} toggle={toggle} />
                </div>
                <NotesField noteKey="cad_notes" data={data} set={set} />
            </div>
        </ExpandablePanel>
    );
}

function CKDPanel({ data, set, toggle }) {
    return (
        <ExpandablePanel color="#79c0ff" title="🫘 CKD Details">
            <div className="dm-grid">
                <div className="field-group">
                    <label>Stage</label>
                    <select value={data.ckd_stage || ''} onChange={e => set('ckd_stage', e.target.value)}>
                        <option value="">Select</option>
                        <option>Stage 1 (eGFR ≥90)</option>
                        <option>Stage 2 (eGFR 60-89)</option>
                        <option>Stage 3a (eGFR 45-59)</option>
                        <option>Stage 3b (eGFR 30-44)</option>
                        <option>Stage 4 (eGFR 15-29)</option>
                        <option>Stage 5 / ESRD (eGFR &lt;15)</option>
                    </select>
                </div>
                <div className="field-group">
                    <label>eGFR (mL/min)</label>
                    <input type="text" placeholder="e.g. 42" value={data.ckd_egfr || ''} onChange={e => set('ckd_egfr', e.target.value)} />
                </div>
                <div className="field-group">
                    <label>Duration (years)</label>
                    <input type="text" placeholder="e.g. 3" value={data.ckd_duration || ''} onChange={e => set('ckd_duration', e.target.value)} />
                </div>
                <div className="field-group full-width">
                    <label>Current Drugs</label>
                    <input type="text" placeholder="e.g. Amlodipine 5mg, Erythropoietin" value={data.ckd_drugs || ''} onChange={e => set('ckd_drugs', e.target.value)} />
                </div>
                <div className="field-group full-width">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <label className={`chip-check ${data.ckd_dialysis ? 'active' : ''}`} style={{ cursor: 'pointer' }}>
                            <input type="checkbox" checked={!!data.ckd_dialysis} onChange={() => toggle('ckd_dialysis')} />
                            On Dialysis
                        </label>
                        {data.ckd_dialysis && (
                            <select value={data.ckd_dial_type || ''} onChange={e => set('ckd_dial_type', e.target.value)} style={{ width: 'auto' }}>
                                <option value="">Type</option>
                                <option>Hemodialysis</option>
                                <option>Peritoneal Dialysis</option>
                            </select>
                        )}
                    </div>
                </div>
                <NotesField noteKey="ckd_notes" data={data} set={set} />
            </div>
        </ExpandablePanel>
    );
}

function StrokePanel({ data, set }) {
    return (
        <ExpandablePanel color="#e3b341" title="🧠 Stroke Details">
            <div className="dm-grid">
                <div className="field-group">
                    <label>Type</label>
                    <select value={data.stroke_type || ''} onChange={e => set('stroke_type', e.target.value)}>
                        <option value="">Select</option>
                        <option>Ischemic</option>
                        <option>Hemorrhagic</option>
                        <option>TIA</option>
                    </select>
                </div>
                <div className="field-group">
                    <label>Duration since event</label>
                    <input type="text" placeholder="e.g. 2 months / 1 year" value={data.stroke_duration || ''} onChange={e => set('stroke_duration', e.target.value)} />
                </div>
                <div className="field-group">
                    <label>Residual Deficit</label>
                    <select value={data.stroke_deficit || ''} onChange={e => set('stroke_deficit', e.target.value)}>
                        <option value="">Select</option>
                        <option>None</option>
                        <option>Hemiplegia</option>
                        <option>Hemiparesis</option>
                        <option>Aphasia</option>
                        <option>Dysphagia</option>
                        <option>Visual field defect</option>
                        <option>Multiple deficits</option>
                    </select>
                </div>
                <div className="field-group full-width">
                    <label>Current Drugs / Anticoagulation</label>
                    <input type="text" placeholder="e.g. Aspirin 150mg, Atorvastatin 40mg, Warfarin" value={data.stroke_drugs || ''} onChange={e => set('stroke_drugs', e.target.value)} />
                </div>
                <NotesField noteKey="stroke_notes" data={data} set={set} />
            </div>
        </ExpandablePanel>
    );
}

// ── Main Comorbidities component ──────────────────────────────────────────────

const COMORBIDITIES = [
    ['cb_diabetes', '🍬 Diabetes', '#d29922'],
    ['cb_hypertension', '💊 Hypertension', '#58a6ff'],
    ['cb_copd', '🫁 COPD', '#a371f7'],
    ['cb_tb', '🦠 TB', '#3fb950'],
    ['cb_thyroid', '🔵 Thyroid', '#f78166'],
    ['cb_cad', '❤️ CAD', '#ff7b72'],
    ['cb_ckd', '🫘 CKD', '#79c0ff'],
    ['cb_stroke', '🧠 Stroke', '#e3b341'],
];

const ADDICTIONS = [
    ['cb_smoking', '🚬 Smoking'], ['cb_alcohol', '🍺 Alcohol'],
    ['cb_tobacco', '🌿 Tobacco'], ['cb_iv_drug', '💉 IV Drug'],
];

export default function Comorbidities({ data, onChange }) {
    const set = (key, val) => onChange({ ...data, [key]: val });
    const toggle = (key) => onChange({ ...data, [key]: !data[key] });

    return (
        <section className="form-section">
            <h2 className="section-title">Comorbidities &amp; Addictions</h2>

            <div className="subsection-label">Comorbidities</div>
            <div className="checkbox-grid">
                {COMORBIDITIES.map(([key, label, color]) => (
                    <label
                        key={key}
                        className={`chip-check ${data[key] ? 'active' : ''}`}
                        style={data[key] ? { borderColor: color + '88', background: color + '18', color } : {}}
                    >
                        <input type="checkbox" checked={!!data[key]} onChange={() => toggle(key)} />
                        {label}
                    </label>
                ))}
            </div>

            {data.cb_diabetes && <DiabetesPanel data={data} set={set} toggle={toggle} />}
            {data.cb_hypertension && <HypertensionPanel data={data} set={set} toggle={toggle} />}
            {data.cb_copd && <CopDPanel data={data} set={set} toggle={toggle} />}
            {data.cb_tb && <TBPanel data={data} set={set} />}
            {data.cb_thyroid && <ThyroidPanel data={data} set={set} />}
            {data.cb_cad && <CAdPanel data={data} set={set} toggle={toggle} />}
            {data.cb_ckd && <CKDPanel data={data} set={set} toggle={toggle} />}
            {data.cb_stroke && <StrokePanel data={data} set={set} />}

            <div className="subsection-label" style={{ marginTop: '1.25rem' }}>Addiction History</div>
            <div className="checkbox-grid">
                {ADDICTIONS.map(([key, label]) => (
                    <label key={key} className={`chip-check ${data[key] ? 'active' : ''}`}>
                        <input type="checkbox" checked={!!data[key]} onChange={() => toggle(key)} />
                        {label}
                    </label>
                ))}
            </div>
        </section>
    );
}
