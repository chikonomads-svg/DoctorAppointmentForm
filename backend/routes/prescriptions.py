"""
routes/prescriptions.py
------------------------
CRUD routes for the prescription form.
"""

from __future__ import annotations

import psycopg2
from datetime import datetime, timezone
from typing import List, Optional
import random
import string

from fastapi import APIRouter, HTTPException, Query, status

from database import get_connection
from models import PrescriptionIn, PrescriptionOut, PrescriptionSummary, MedicationOut

router = APIRouter(prefix="/api/prescriptions", tags=["Prescriptions"])


def _generate_id() -> str:
    ts = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
    suffix = "".join(random.choices(string.ascii_lowercase + string.digits, k=5))
    return f"{ts}-{suffix}"


def _row_to_prescription(conn, row) -> dict:
    data = dict(row)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM medications WHERE prescription_id = %s ORDER BY row_order",
        (data["id"],),
    )
    data["medications"] = [dict(m) for m in cursor.fetchall()]
    return data


def _save_medications(conn, prescription_id: str, medications: list) -> None:
    cur = conn.cursor()
    cur.execute("DELETE FROM medications WHERE prescription_id = %s", (prescription_id,))
    for i, med in enumerate(medications):
        cur.execute(
            """
            INSERT INTO medications
                (prescription_id, row_order, drug_name, dose, route, frequency, duration)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            """,
            (prescription_id, i, med.drug_name or "", med.dose or "",
             med.route or "", med.frequency or "", med.duration or ""),
        )


def _upsert_cols_and_values(p: PrescriptionIn, saved_at: str, record_id: str):
    """Return (column_names, values_tuple) for a full upsert."""
    cols = [
        "id", "saved_at",
        "clinic_address", "clinic_phone", "reg_no",
        "patient_date", "patient_name", "patient_age", "patient_sex",
        "patient_weight", "patient_address",
        # comorbidity flags
        "cb_diabetes", "cb_hypertension", "cb_copd", "cb_tb",
        "cb_thyroid", "cb_cad", "cb_ckd", "cb_stroke",
        # diabetes
        "dm_duration", "dm_treatment", "dm_drugs",
        "dm_fbs", "dm_ppbs", "dm_hba1c",
        "dm_neuropathy", "dm_retinopathy", "dm_nephropathy", "dm_cad", "dm_foot",
        "dm_notes",
        # hypertension
        "htn_duration", "htn_treatment", "htn_drugs", "htn_bp_control",
        "htn_lvh", "htn_ckd", "htn_retinopathy", "htn_stroke",
        "htn_notes",
        # copd
        "copd_duration", "copd_severity", "copd_smoking_pack_yr",
        "copd_inhalers", "copd_exacerbations_yr",
        "copd_pht", "copd_cor_pulmonale",
        "copd_notes",
        # tb
        "tb_type", "tb_site", "tb_status", "tb_duration", "tb_ds",
        "tb_notes",
        # thyroid
        "thyroid_type", "thyroid_duration", "thyroid_tsh", "thyroid_drugs",
        "thyroid_notes",
        # cad
        "cad_type", "cad_duration", "cad_lvef", "cad_drugs",
        "cad_cabg", "cad_pci", "cad_stenting",
        "cad_notes",
        # ckd
        "ckd_stage", "ckd_egfr", "ckd_dialysis", "ckd_dial_type",
        "ckd_duration", "ckd_drugs",
        "ckd_notes",
        # stroke
        "stroke_type", "stroke_duration", "stroke_deficit", "stroke_drugs",
        "stroke_notes",
        # addiction
        "cb_smoking", "cb_alcohol", "cb_tobacco", "cb_iv_drug",
        # vitals
        "vital_bp", "vital_pulse", "vital_spo2", "vital_temp", "vital_rr", "vital_grbs",
        # clinical
        "chief_complaints", "provisional_diagnosis", "investigations",
        # physical exam
        "ex_pallor", "ex_icterus", "ex_cyanosis", "ex_clubbing", "ex_edema",
        # systemic exam
        "exam_rs", "exam_cvs", "exam_cns", "exam_pa",
        # cvs structured
        "cvs_normal", "cvs_s1s2", "cvs_murmur",
        "cvs_murmur_timing", "cvs_murmur_nature", "cvs_murmur_site",
        "cvs_murmur_radiation", "cvs_murmur_grade",
        # advice
        "advice",
    ]

    vals = (
        record_id, saved_at,
        p.clinic_address, p.clinic_phone, p.reg_no,
        p.patient_date, p.patient_name, p.patient_age, p.patient_sex,
        p.patient_weight, p.patient_address,
        int(p.cb_diabetes), int(p.cb_hypertension), int(p.cb_copd), int(p.cb_tb),
        int(p.cb_thyroid), int(p.cb_cad), int(p.cb_ckd), int(p.cb_stroke),
        p.dm_duration, p.dm_treatment, p.dm_drugs,
        p.dm_fbs, p.dm_ppbs, p.dm_hba1c,
        int(p.dm_neuropathy), int(p.dm_retinopathy), int(p.dm_nephropathy),
        int(p.dm_cad), int(p.dm_foot),
        p.dm_notes,
        p.htn_duration, p.htn_treatment, p.htn_drugs, p.htn_bp_control,
        int(p.htn_lvh), int(p.htn_ckd), int(p.htn_retinopathy), int(p.htn_stroke),
        p.htn_notes,
        p.copd_duration, p.copd_severity, p.copd_smoking_pack_yr,
        p.copd_inhalers, p.copd_exacerbations_yr,
        int(p.copd_pht), int(p.copd_cor_pulmonale),
        p.copd_notes,
        p.tb_type, p.tb_site, p.tb_status, p.tb_duration, p.tb_ds,
        p.tb_notes,
        p.thyroid_type, p.thyroid_duration, p.thyroid_tsh, p.thyroid_drugs,
        p.thyroid_notes,
        p.cad_type, p.cad_duration, p.cad_lvef, p.cad_drugs,
        int(p.cad_cabg), int(p.cad_pci), int(p.cad_stenting),
        p.cad_notes,
        p.ckd_stage, p.ckd_egfr, int(p.ckd_dialysis), p.ckd_dial_type,
        p.ckd_duration, p.ckd_drugs,
        p.ckd_notes,
        p.stroke_type, p.stroke_duration, p.stroke_deficit, p.stroke_drugs,
        p.stroke_notes,
        int(p.cb_smoking), int(p.cb_alcohol), int(p.cb_tobacco), int(p.cb_iv_drug),
        p.vital_bp, p.vital_pulse, p.vital_spo2, p.vital_temp, p.vital_rr, p.vital_grbs,
        p.chief_complaints, p.provisional_diagnosis, p.investigations,
        int(p.ex_pallor), int(p.ex_icterus), int(p.ex_cyanosis),
        int(p.ex_clubbing), int(p.ex_edema),
        p.exam_rs, p.exam_cvs, p.exam_cns, p.exam_pa,
        int(p.cvs_normal), p.cvs_s1s2, int(p.cvs_murmur),
        p.cvs_murmur_timing, p.cvs_murmur_nature, p.cvs_murmur_site,
        p.cvs_murmur_radiation, p.cvs_murmur_grade,
        p.advice,
    )
    return cols, vals


# ── CREATE ────────────────────────────────────────────────────────────────────

@router.post("", response_model=PrescriptionOut, status_code=status.HTTP_201_CREATED)
def create_prescription(payload: PrescriptionIn):
    record_id = payload.id or _generate_id()
    saved_at  = payload.saved_at or datetime.now(timezone.utc).isoformat()

    cols, vals = _upsert_cols_and_values(payload, saved_at, record_id)
    placeholders = ", ".join(["%s"] * len(cols))
    col_names    = ", ".join(cols)

    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute(f"INSERT INTO prescriptions ({col_names}) VALUES ({placeholders})", vals)
        _save_medications(conn, record_id, payload.medications)
        conn.commit()
        cur.execute("SELECT * FROM prescriptions WHERE id = %s", (record_id,))
        return _row_to_prescription(conn, cur.fetchone())
    except psycopg2.IntegrityError:
        conn.rollback()
        raise HTTPException(status_code=409, detail=f"Prescription '{record_id}' already exists.")
    finally:
        conn.close()


# ── LIST ──────────────────────────────────────────────────────────────────────

@router.get("", response_model=List[PrescriptionSummary])
def list_prescriptions(
    search: Optional[str] = Query(None),
    limit:  int           = Query(100, ge=1, le=500),
    offset: int           = Query(0, ge=0),
):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        if search:
            cursor.execute(
                "SELECT id, patient_name, patient_date, saved_at FROM prescriptions WHERE patient_name ILIKE %s ORDER BY saved_at DESC LIMIT %s OFFSET %s",
                (f"%{search}%", limit, offset),
            )
        else:
            cursor.execute(
                "SELECT id, patient_name, patient_date, saved_at FROM prescriptions ORDER BY saved_at DESC LIMIT %s OFFSET %s",
                (limit, offset),
            )
        return [dict(row) for row in cursor.fetchall()]
    finally:
        conn.close()


# ── SEARCH ────────────────────────────────────────────────────────────────────

@router.get("/search", response_model=List[PrescriptionSummary])
def search_prescriptions(q: str = Query(..., min_length=1)):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, patient_name, patient_date, saved_at FROM prescriptions WHERE patient_name ILIKE %s ORDER BY saved_at DESC LIMIT 50",
            (f"%{q}%",),
        )
        return [dict(row) for row in cursor.fetchall()]
    finally:
        conn.close()


# ── GET SINGLE ────────────────────────────────────────────────────────────────

@router.get("/{prescription_id}", response_model=PrescriptionOut)
def get_prescription(prescription_id: str):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM prescriptions WHERE id = %s", (prescription_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Prescription not found")
        return _row_to_prescription(conn, row)
    finally:
        conn.close()


# ── UPDATE ────────────────────────────────────────────────────────────────────

@router.put("/{prescription_id}", response_model=PrescriptionOut)
def update_prescription(prescription_id: str, payload: PrescriptionIn):
    saved_at = payload.saved_at or datetime.now(timezone.utc).isoformat()
    cols, vals = _upsert_cols_and_values(payload, saved_at, prescription_id)

    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM prescriptions WHERE id = %s", (prescription_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Prescription not found")

        set_clause = ", ".join(f"{c} = %s" for c in cols if c != "id")
        # vals without record_id for SET, plus prescription_id for WHERE
        update_vals = tuple(v for c, v in zip(cols, vals) if c != "id") + (prescription_id,)
        cursor.execute(f"UPDATE prescriptions SET {set_clause} WHERE id = %s", update_vals)
        _save_medications(conn, prescription_id, payload.medications)
        conn.commit()

        cursor.execute("SELECT * FROM prescriptions WHERE id = %s", (prescription_id,))
        return _row_to_prescription(conn, cursor.fetchone())
    finally:
        conn.close()


# ── DELETE ────────────────────────────────────────────────────────────────────

@router.delete("/{prescription_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_prescription(prescription_id: str):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM prescriptions WHERE id = %s", (prescription_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Prescription not found")
        cursor.execute("DELETE FROM prescriptions WHERE id = %s", (prescription_id,))
        conn.commit()
    finally:
        conn.close()
