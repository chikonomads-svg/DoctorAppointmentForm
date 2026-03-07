import React, { useMemo } from 'react';

const S1S2_OPTIONS = ['Normal', 'Loud S1', 'Loud S2', 'Split S2'];
const MURMUR_TIMING = ['Systolic murmur', 'Diastolic murmur', 'Continuous murmur'];
const MURMUR_NATURE = [
    'Ejection systolic', 'Pansystolic', 'Mid systolic',
    'Early diastolic', 'Mid diastolic', 'Late diastolic', 'Machinery murmur',
];
const MURMUR_SITE = ['Aortic area', 'Pulmonary area', 'Tricuspid area', 'Mitral area (apex)'];
const MURMUR_RADIATION = ['None', 'To carotids', 'To axilla', 'To back', 'To neck'];
const MURMUR_GRADE = ['I/VI', 'II/VI', 'III/VI', 'IV/VI', 'V/VI', 'VI/VI'];

function buildCvsSummary(data) {
    if (data.cvs_normal) return 'S1 S2 normal, no murmur.';
    const parts = [];
    if (data.cvs_s1s2) parts.push(`S1 S2 ${data.cvs_s1s2.toLowerCase()}`);
    else parts.push('S1 S2 heard');
    if (!data.cvs_murmur) {
        parts.push('no murmur');
        return parts.join(', ') + '.';
    }
    let murmurDesc = '';
    if (data.cvs_murmur_grade) murmurDesc += `Grade ${data.cvs_murmur_grade} `;
    if (data.cvs_murmur_nature) murmurDesc += `${data.cvs_murmur_nature.toLowerCase()} `;
    murmurDesc += 'murmur';
    if (data.cvs_murmur_site) murmurDesc += ` heard at ${data.cvs_murmur_site.toLowerCase()}`;
    if (data.cvs_murmur_radiation && data.cvs_murmur_radiation !== 'None')
        murmurDesc += ` radiating ${data.cvs_murmur_radiation.toLowerCase()}`;
    parts.push(murmurDesc);
    return parts.join('. ') + '.';
}

const Radio = ({ name, options, value, onChange }) => (
    <div className="radio-group">
        {options.map(opt => (
            <label key={opt} className={`chip-radio ${value === opt ? 'active' : ''}`}>
                <input type="radio" name={name} value={opt} checked={value === opt} onChange={() => onChange(opt)} />
                {opt}
            </label>
        ))}
    </div>
);

export default function SystemicExam({ data, onChange }) {
    const set = (key, val) => onChange({ ...data, [key]: val });

    const summary = useMemo(() => buildCvsSummary(data), [
        data.cvs_normal, data.cvs_s1s2, data.cvs_murmur,
        data.cvs_murmur_timing, data.cvs_murmur_nature,
        data.cvs_murmur_site, data.cvs_murmur_radiation, data.cvs_murmur_grade,
    ]);

    const handleNormalCVS = () => {
        onChange({
            ...data,
            cvs_normal: true,
            cvs_s1s2: 'Normal',
            cvs_murmur: false,
            cvs_murmur_timing: '',
            cvs_murmur_nature: '',
            cvs_murmur_site: '',
            cvs_murmur_radiation: 'None',
            cvs_murmur_grade: '',
            exam_cvs: 'S1 S2 normal, no murmur.',
        });
    };

    // Auto-update exam_cvs whenever CVS structured fields change
    const handleCvsChange = (updates) => {
        const next = { ...data, ...updates };
        next.exam_cvs = buildCvsSummary(next);
        onChange(next);
    };

    return (
        <section className="form-section">
            <h2 className="section-title">Systemic Examination</h2>

            {/* RS */}
            <div className="field-group">
                <label>Respiratory System (RS)</label>
                <textarea
                    rows={2}
                    placeholder="e.g. NVBS, no added sounds"
                    value={data.exam_rs || ''}
                    onChange={e => set('exam_rs', e.target.value)}
                />
            </div>

            {/* ── CVS ───────────────────────────────────────────────────────────────── */}
            <div className="cvs-block">
                <div className="cvs-header">
                    <label className="subsection-label">Cardiovascular System (CVS)</label>
                    <button type="button" className="btn-normal-cvs" onClick={handleNormalCVS}>
                        ✓ CVS Normal
                    </button>
                </div>

                {/* Heart Sounds */}
                <div className="field-group">
                    <label>Heart Sounds (S1 S2)</label>
                    <Radio
                        name="cvs_s1s2"
                        options={S1S2_OPTIONS}
                        value={data.cvs_s1s2 || ''}
                        onChange={v => handleCvsChange({ cvs_s1s2: v, cvs_normal: false })}
                    />
                </div>

                {/* Murmur present/absent */}
                <div className="field-group">
                    <label>Murmur</label>
                    <div className="radio-group">
                        <label className={`chip-radio ${!data.cvs_murmur ? 'active' : ''}`}>
                            <input
                                type="radio"
                                checked={!data.cvs_murmur}
                                onChange={() => handleCvsChange({ cvs_murmur: false, cvs_normal: false })}
                            />
                            Absent
                        </label>
                        <label className={`chip-radio ${data.cvs_murmur ? 'active' : ''}`}>
                            <input
                                type="radio"
                                checked={!!data.cvs_murmur}
                                onChange={() => handleCvsChange({ cvs_murmur: true, cvs_normal: false })}
                            />
                            Present
                        </label>
                    </div>
                </div>

                {/* Murmur details — only when present */}
                {data.cvs_murmur && (
                    <div className="murmur-details">
                        <div className="field-group">
                            <label>Timing</label>
                            <Radio
                                name="murmur_timing"
                                options={MURMUR_TIMING}
                                value={data.cvs_murmur_timing || ''}
                                onChange={v => handleCvsChange({ cvs_murmur_timing: v })}
                            />
                        </div>
                        <div className="field-group">
                            <label>Nature / Character</label>
                            <Radio
                                name="murmur_nature"
                                options={MURMUR_NATURE}
                                value={data.cvs_murmur_nature || ''}
                                onChange={v => handleCvsChange({ cvs_murmur_nature: v })}
                            />
                        </div>
                        <div className="field-group">
                            <label>Site (Best heard at)</label>
                            <Radio
                                name="murmur_site"
                                options={MURMUR_SITE}
                                value={data.cvs_murmur_site || ''}
                                onChange={v => handleCvsChange({ cvs_murmur_site: v })}
                            />
                        </div>
                        <div className="field-group">
                            <label>Radiation</label>
                            <Radio
                                name="murmur_radiation"
                                options={MURMUR_RADIATION}
                                value={data.cvs_murmur_radiation || 'None'}
                                onChange={v => handleCvsChange({ cvs_murmur_radiation: v })}
                            />
                        </div>
                        <div className="field-group">
                            <label>Grade (Levine)</label>
                            <Radio
                                name="murmur_grade"
                                options={MURMUR_GRADE}
                                value={data.cvs_murmur_grade || ''}
                                onChange={v => handleCvsChange({ cvs_murmur_grade: v })}
                            />
                        </div>
                    </div>
                )}

                {/* Auto-summary */}
                <div className="cvs-summary">
                    <span className="cvs-summary-label">Auto-summary:</span>
                    <span className="cvs-summary-text">{summary}</span>
                </div>
            </div>

            {/* CNS */}
            <div className="field-group">
                <label>Central Nervous System (CNS)</label>
                <textarea
                    rows={2}
                    placeholder="e.g. Conscious, oriented, no focal deficit"
                    value={data.exam_cns || ''}
                    onChange={e => set('exam_cns', e.target.value)}
                />
            </div>

            {/* PA */}
            <div className="field-group">
                <label>Per Abdomen (PA)</label>
                <textarea
                    rows={2}
                    placeholder="e.g. Soft, non-tender, no organomegaly"
                    value={data.exam_pa || ''}
                    onChange={e => set('exam_pa', e.target.value)}
                />
            </div>
        </section>
    );
}
