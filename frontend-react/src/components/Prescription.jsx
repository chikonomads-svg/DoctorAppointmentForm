import React, { useState, useRef, useEffect, useCallback } from 'react';
import { searchMedicines } from '../api';

const ROUTES = ['Oral', 'IV', 'IM', 'SC', 'Topical', 'Inhaled', 'Rectal', 'SL'];
const FREQUENCIES = [
    ['OD', 'OD (Once daily)'], ['BD', 'BD (Twice daily)'], ['TDS', 'TDS (Thrice daily)'],
    ['QID', 'QID (4× daily)'], ['HS', 'HS (At bedtime)'], ['SOS', 'SOS (As needed)'],
    ['STAT', 'STAT (Immediately)'], ['Weekly', 'Weekly'],
];

function MedRow({ idx, med, onChange, onRemove, backendAvailable }) {
    const [suggestions, setSuggestions] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const debounceRef = useRef(null);

    const handleDrugInput = (val) => {
        onChange({ ...med, drug_name: val });
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (val.length < 2 || !backendAvailable) { setSuggestions([]); setShowDropdown(false); return; }
        setLoading(true);
        debounceRef.current = setTimeout(async () => {
            const results = await searchMedicines(val);
            setSuggestions(results);
            setShowDropdown(results.length > 0);
            setLoading(false);
        }, 350);
    };

    const selectMed = (item) => {
        const dose = (item.form || '').match(/(\d+[\s]?(?:mg|ml|mcg|g|iu|IU|%|units))/i)?.[1] || '';
        onChange({ ...med, drug_name: item.name || '', dose: med.dose || dose });
        setSuggestions([]);
        setShowDropdown(false);
    };

    return (
        <tr>
            <td className="row-num">{idx + 1}</td>
            <td className="drug-cell" style={{ position: 'relative' }}>
                <input
                    type="text"
                    placeholder="Type drug name…"
                    value={med.drug_name || ''}
                    onChange={e => handleDrugInput(e.target.value)}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                    autoComplete="off"
                />
                {showDropdown && (
                    <div className="drug-autocomplete">
                        <div className="drug-autocomplete-header">
                            <span>Medicine Results</span>
                            <span className="powered-by">⚕️ PMBJP</span>
                        </div>
                        <ul className="drug-autocomplete-list">
                            {suggestions.map((s, i) => (
                                <li key={i} className="drug-option" onMouseDown={() => selectMed(s)}>
                                    <div className="drug-option-body">
                                        <div className="drug-option-name">{s.name}</div>
                                        <div className="drug-option-form">{s.form || s.unit_size || ''}</div>
                                    </div>
                                    {s.mrp ? <span className="drug-price">₹{s.mrp}</span> : null}
                                </li>
                            ))}
                        </ul>
                        <div className="drug-autocomplete-footer">
                            Powered by <a href="http://janaushadhi.gov.in" target="_blank" rel="noopener noreferrer">Jan Aushadhi</a>
                        </div>
                    </div>
                )}
                {loading && <span className="drug-loading">…</span>}
            </td>
            <td>
                <input
                    type="text"
                    placeholder="e.g. 500mg"
                    value={med.dose || ''}
                    onChange={e => onChange({ ...med, dose: e.target.value })}
                />
            </td>
            <td>
                <select value={med.route || ''} onChange={e => onChange({ ...med, route: e.target.value })}>
                    <option value="">Route</option>
                    {ROUTES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
            </td>
            <td>
                <select value={med.frequency || ''} onChange={e => onChange({ ...med, frequency: e.target.value })}>
                    <option value="">Frequency</option>
                    {FREQUENCIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
            </td>
            <td>
                <input
                    type="text"
                    placeholder="e.g. 5 days"
                    value={med.duration || ''}
                    onChange={e => onChange({ ...med, duration: e.target.value })}
                />
            </td>
            <td>
                <input
                    type="text"
                    placeholder="e.g. After food"
                    value={med.instructions || ''}
                    onChange={e => onChange({ ...med, instructions: e.target.value })}
                />
            </td>
            <td>
                <button type="button" className="remove-row-btn" onClick={onRemove} title="Remove">×</button>
            </td>
        </tr>
    );
}

const EMPTY_MED = () => ({ drug_name: '', dose: '', route: '', frequency: '', duration: '' });

export default function Prescription({ data, onChange, backendAvailable }) {
    const meds = data.medications || [];

    const updateMed = (i, updated) => {
        const next = [...meds];
        next[i] = updated;
        onChange({ ...data, medications: next });
    };

    const addRow = () => onChange({ ...data, medications: [...meds, EMPTY_MED()] });

    const removeRow = (i) => {
        const next = meds.filter((_, idx) => idx !== i);
        onChange({ ...data, medications: next });
    };

    return (
        <section className="form-section">
            <h2 className="section-title">Prescription (Rx)</h2>
            <div className="rx-table-wrapper">
                <table className="rx-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Drug Name</th>
                            <th>Dose</th>
                            <th>Route</th>
                            <th>Frequency</th>
                            <th>Duration</th>
                            <th>Instructions</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {meds.map((med, idx) => (
                            <MedRow
                                key={idx}
                                idx={idx}
                                med={med}
                                onChange={updated => updateMed(idx, updated)}
                                onRemove={() => removeRow(idx)}
                                backendAvailable={backendAvailable}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
            <button type="button" className="btn btn-secondary" onClick={addRow} style={{ marginTop: '0.5rem' }}>
                + Add Row
            </button>
        </section>
    );
}
