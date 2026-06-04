"""
models.py
---------
Pydantic schemas for request / response validation.
"""

from __future__ import annotations
from typing import List, Optional
from pydantic import BaseModel, Field


# ── Medication row ────────────────────────────────────────────────────────────

class MedicationIn(BaseModel):
    drug_name:    Optional[str] = ""
    dose:         Optional[str] = ""
    route:        Optional[str] = ""
    frequency:    Optional[str] = ""
    duration:     Optional[str] = ""
    instructions: Optional[str] = ""


class MedicationOut(MedicationIn):
    id:        int
    row_order: int


# ── Prescription ──────────────────────────────────────────────────────────────

class PrescriptionIn(BaseModel):
    id: Optional[str] = None
    saved_at: Optional[str] = None

    # Clinic
    clinic_address: Optional[str] = ""
    clinic_phone:   Optional[str] = ""
    reg_no:         Optional[str] = ""

    # Patient
    patient_date:    Optional[str] = ""
    patient_name:    str = Field(..., min_length=1)
    patient_age:     Optional[str] = ""
    patient_sex:     Optional[str] = ""
    patient_weight:  Optional[str] = ""
    patient_address: Optional[str] = ""
    patient_uhid:    Optional[str] = ""
    follow_up:       Optional[str] = ""

    # ── Comorbidity flags ─────────────────────────────────────────────────────
    cb_diabetes:     bool = False
    cb_hypertension: bool = False
    cb_copd:         bool = False
    cb_tb:           bool = False
    cb_thyroid:      bool = False
    cb_cad:          bool = False
    cb_ckd:          bool = False
    cb_stroke:       bool = False

    # ── Diabetes detail ───────────────────────────────────────────────────────
    dm_duration:    Optional[str]   = ""
    dm_treatment:   Optional[str]   = ""
    dm_drugs:       Optional[str]   = ""
    dm_fbs:         Optional[str] = ""
    dm_ppbs:        Optional[str] = ""
    dm_hba1c:       Optional[str]   = ""
    dm_neuropathy:  bool = False
    dm_retinopathy: bool = False
    dm_nephropathy: bool = False
    dm_cad:         bool = False
    dm_foot:        bool = False
    dm_notes:       Optional[str] = ""   # free-text

    # ── Hypertension detail ───────────────────────────────────────────────────
    htn_duration:    Optional[str] = ""
    htn_treatment:   Optional[str] = ""   # Monotherapy / Multiple drugs
    htn_drugs:       Optional[str] = ""
    htn_bp_control:  Optional[str] = ""   # Good / Moderate / Poor
    htn_lvh:         bool = False
    htn_ckd:         bool = False
    htn_retinopathy: bool = False
    htn_stroke:      bool = False
    htn_notes:       Optional[str] = ""

    # ── COPD detail ───────────────────────────────────────────────────────────
    copd_duration:         Optional[str] = ""
    copd_severity:         Optional[str] = ""   # GOLD 1/2/3/4
    copd_smoking_pack_yr:  Optional[str] = ""
    copd_inhalers:         Optional[str] = ""
    copd_exacerbations_yr: Optional[str] = ""
    copd_pht:              bool = False
    copd_cor_pulmonale:    bool = False
    copd_notes:            Optional[str] = ""

    # ── TB detail ─────────────────────────────────────────────────────────────
    tb_type:      Optional[str] = ""
    tb_site:      Optional[str] = ""
    tb_status:    Optional[str] = ""
    tb_duration:  Optional[str] = ""
    tb_ds:        Optional[str] = ""
    tb_notes:     Optional[str] = ""

    # ── Thyroid detail ────────────────────────────────────────────────────────
    thyroid_type:     Optional[str] = ""
    thyroid_duration: Optional[str] = ""
    thyroid_tsh:      Optional[str] = ""
    thyroid_drugs:    Optional[str] = ""
    thyroid_notes:    Optional[str] = ""

    # ── CAD detail ────────────────────────────────────────────────────────────
    cad_type:      Optional[str] = ""
    cad_duration:  Optional[str] = ""
    cad_lvef:      Optional[str] = ""
    cad_drugs:     Optional[str] = ""
    cad_cabg:      bool = False
    cad_pci:       bool = False
    cad_stenting:  bool = False
    cad_notes:     Optional[str] = ""

    # ── CKD detail ────────────────────────────────────────────────────────────
    ckd_stage:     Optional[str] = ""
    ckd_egfr:      Optional[str] = ""
    ckd_dialysis:  bool = False
    ckd_dial_type: Optional[str] = ""
    ckd_duration:  Optional[str] = ""
    ckd_drugs:     Optional[str] = ""
    ckd_notes:     Optional[str] = ""

    # ── Stroke detail ─────────────────────────────────────────────────────────
    stroke_type:     Optional[str] = ""
    stroke_duration: Optional[str] = ""
    stroke_deficit:  Optional[str] = ""
    stroke_drugs:    Optional[str] = ""
    stroke_notes:    Optional[str] = ""

    # ── Addiction flags ───────────────────────────────────────────────────────
    cb_smoking:  bool = False
    cb_alcohol:  bool = False
    cb_tobacco:  bool = False
    cb_iv_drug:  bool = False

    # Vitals
    vital_bp:    Optional[str] = ""
    vital_pulse: Optional[str] = ""
    vital_spo2:  Optional[str] = ""
    vital_temp:  Optional[str] = ""
    vital_rr:    Optional[str] = ""
    vital_grbs:  Optional[str] = ""

    # Clinical
    chief_complaints:      Optional[str] = ""
    provisional_diagnosis: Optional[str] = ""
    investigations:        Optional[str] = ""

    # Physical Examination
    ex_pallor:   bool = False
    ex_icterus:  bool = False
    ex_cyanosis: bool = False
    ex_clubbing: bool = False
    ex_edema:    bool = False

    # Systemic Examination
    exam_rs:  Optional[str] = ""
    exam_cvs: Optional[str] = ""
    exam_cns: Optional[str] = ""
    exam_pa:  Optional[str] = ""

    # CVS structured fields
    cvs_normal:           bool = False
    cvs_s1s2:             Optional[str] = ""
    cvs_murmur:           bool = False
    cvs_murmur_timing:    Optional[str] = ""
    cvs_murmur_nature:    Optional[str] = ""
    cvs_murmur_site:      Optional[str] = ""
    cvs_murmur_radiation: Optional[str] = ""
    cvs_murmur_grade:     Optional[str] = ""

    # Advice
    advice: Optional[str] = ""

    # Medications (nested)
    medications: List[MedicationIn] = []


class PrescriptionOut(PrescriptionIn):
    id:       str
    saved_at: str
    medications: List[MedicationOut] = []


class PrescriptionSummary(BaseModel):
    id:           str
    patient_name: str
    patient_date: Optional[str]
    saved_at:     str
