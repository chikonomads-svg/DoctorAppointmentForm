"""
database.py
-----------
PostgreSQL database setup for the Prescription Form backend.
"""

import psycopg2
from psycopg2.extras import DictCursor
import os
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))

DATABASE_URL = os.getenv("DATABASE_URL")

def get_connection():
    if not DATABASE_URL:
        raise ValueError("DATABASE_URL is not set in backend/.env")
    return psycopg2.connect(
        DATABASE_URL,
        cursor_factory=DictCursor,
        connect_timeout=10,
        keepalives=1,
        keepalives_idle=30,
        keepalives_interval=10,
        keepalives_count=5,
    )

def init_db() -> None:
    print("[DB] Initializing PostgreSQL database...")
    try:
        conn = get_connection()
    except Exception as e:
        print(f"[DB] WARNING: Could not connect to PostgreSQL: {e}")
        print("[DB] Running in limited mode — DB-dependent features (dashboard, save/load) unavailable.")
        return

    try:
        cursor = conn.cursor()

        # ── Users table ───────────────────────────────────────────────────────────
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id            VARCHAR(255) PRIMARY KEY,
                name          VARCHAR(255) NOT NULL,
                email         VARCHAR(255) NOT NULL UNIQUE,
                password_hash TEXT         NOT NULL,
                role          VARCHAR(50)  NOT NULL DEFAULT 'doctor',
                created_at    VARCHAR(255) NOT NULL
            )
        """)
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
        """)

        # ── Core table ────────────────────────────────────────────────────────────

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS prescriptions (
                id              VARCHAR(255) PRIMARY KEY,
                saved_at        VARCHAR(255) NOT NULL,
                clinic_address  TEXT,
                clinic_phone    VARCHAR(255),
                reg_no          VARCHAR(255),
                patient_date    VARCHAR(255),
                patient_name    VARCHAR(255) NOT NULL,
                patient_age     INTEGER,
                patient_sex     VARCHAR(50),
                patient_weight  REAL,
                patient_address TEXT,
                patient_uhid    VARCHAR(255),
                follow_up       TEXT,
                cb_diabetes     INTEGER DEFAULT 0,
                cb_hypertension INTEGER DEFAULT 0,
                cb_copd         INTEGER DEFAULT 0,
                cb_tb           INTEGER DEFAULT 0,
                cb_thyroid      INTEGER DEFAULT 0,
                cb_cad          INTEGER DEFAULT 0,
                cb_ckd          INTEGER DEFAULT 0,
                cb_stroke       INTEGER DEFAULT 0,
                cb_smoking      INTEGER DEFAULT 0,
                cb_alcohol      INTEGER DEFAULT 0,
                cb_tobacco      INTEGER DEFAULT 0,
                cb_iv_drug      INTEGER DEFAULT 0,
                vital_bp        VARCHAR(255),
                vital_pulse     VARCHAR(50),
                vital_spo2      VARCHAR(50),
                vital_temp      VARCHAR(50),
                vital_rr        VARCHAR(50),
                vital_grbs      VARCHAR(50),
                chief_complaints       TEXT,
                provisional_diagnosis  TEXT,
                investigations         TEXT,
                ex_pallor   INTEGER DEFAULT 0,
                ex_icterus  INTEGER DEFAULT 0,
                ex_cyanosis INTEGER DEFAULT 0,
                ex_clubbing INTEGER DEFAULT 0,
                ex_edema    INTEGER DEFAULT 0,
                exam_rs  TEXT,
                exam_cvs TEXT,
                exam_cns TEXT,
                exam_pa  TEXT,
                advice TEXT
            )
        """)

        # ── All new columns (safe to run multiple times) ──────────────────────────
        new_cols = [
            # Patient extras
            ("patient_uhid",  "VARCHAR(255)"),
            ("follow_up",     "TEXT"),
            # CVS
            ("cvs_normal",           "INTEGER DEFAULT 0"),
            ("cvs_s1s2",             "VARCHAR(100)"),
            ("cvs_murmur",           "INTEGER DEFAULT 0"),
            ("cvs_murmur_timing",    "VARCHAR(100)"),
            ("cvs_murmur_nature",    "VARCHAR(100)"),
            ("cvs_murmur_site",      "VARCHAR(100)"),
            ("cvs_murmur_radiation", "VARCHAR(100)"),
            ("cvs_murmur_grade",     "VARCHAR(20)"),
            # Diabetes
            ("dm_duration",    "VARCHAR(100)"),
            ("dm_treatment",   "VARCHAR(50)"),
            ("dm_drugs",       "TEXT"),
            ("dm_fbs",         "REAL"),
            ("dm_ppbs",        "REAL"),
            ("dm_hba1c",       "VARCHAR(20)"),
            ("dm_neuropathy",  "INTEGER DEFAULT 0"),
            ("dm_retinopathy", "INTEGER DEFAULT 0"),
            ("dm_nephropathy", "INTEGER DEFAULT 0"),
            ("dm_cad",         "INTEGER DEFAULT 0"),
            ("dm_foot",        "INTEGER DEFAULT 0"),
            ("dm_notes",       "TEXT"),
            # Hypertension
            ("htn_duration",    "VARCHAR(100)"),
            ("htn_treatment",   "VARCHAR(100)"),
            ("htn_drugs",       "TEXT"),
            ("htn_bp_control",  "VARCHAR(50)"),
            ("htn_lvh",         "INTEGER DEFAULT 0"),
            ("htn_ckd",         "INTEGER DEFAULT 0"),
            ("htn_retinopathy", "INTEGER DEFAULT 0"),
            ("htn_stroke",      "INTEGER DEFAULT 0"),
            ("htn_notes",       "TEXT"),
            # COPD
            ("copd_duration",         "VARCHAR(100)"),
            ("copd_severity",         "VARCHAR(20)"),
            ("copd_smoking_pack_yr",  "VARCHAR(50)"),
            ("copd_inhalers",         "TEXT"),
            ("copd_exacerbations_yr", "VARCHAR(20)"),
            ("copd_pht",              "INTEGER DEFAULT 0"),
            ("copd_cor_pulmonale",    "INTEGER DEFAULT 0"),
            ("copd_notes",            "TEXT"),
            # TB
            ("tb_type",     "VARCHAR(50)"),
            ("tb_site",     "VARCHAR(100)"),
            ("tb_status",   "VARCHAR(50)"),
            ("tb_duration", "VARCHAR(50)"),
            ("tb_ds",       "VARCHAR(50)"),
            ("tb_notes",    "TEXT"),
            # Thyroid
            ("thyroid_type",     "VARCHAR(50)"),
            ("thyroid_duration", "VARCHAR(100)"),
            ("thyroid_tsh",      "VARCHAR(20)"),
            ("thyroid_drugs",    "TEXT"),
            ("thyroid_notes",    "TEXT"),
            # CAD
            ("cad_type",     "VARCHAR(100)"),
            ("cad_duration", "VARCHAR(100)"),
            ("cad_lvef",     "VARCHAR(20)"),
            ("cad_drugs",    "TEXT"),
            ("cad_cabg",     "INTEGER DEFAULT 0"),
            ("cad_pci",      "INTEGER DEFAULT 0"),
            ("cad_stenting", "INTEGER DEFAULT 0"),
            ("cad_notes",    "TEXT"),
            # CKD
            ("ckd_stage",     "VARCHAR(20)"),
            ("ckd_egfr",      "VARCHAR(20)"),
            ("ckd_dialysis",  "INTEGER DEFAULT 0"),
            ("ckd_dial_type", "VARCHAR(50)"),
            ("ckd_duration",  "VARCHAR(100)"),
            ("ckd_drugs",     "TEXT"),
            ("ckd_notes",     "TEXT"),
            # Stroke
            ("stroke_type",     "VARCHAR(50)"),
            ("stroke_duration", "VARCHAR(100)"),
            ("stroke_deficit",  "VARCHAR(100)"),
            ("stroke_drugs",    "TEXT"),
            ("stroke_notes",    "TEXT"),
        ]

        for col, col_type in new_cols:
            cursor.execute(f"ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS {col} {col_type}")

        # ── Medications ───────────────────────────────────────────────────────────
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS medications (
                id              SERIAL PRIMARY KEY,
                prescription_id VARCHAR(255) NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
                row_order       INTEGER NOT NULL DEFAULT 0,
                drug_name       TEXT,
                dose            VARCHAR(255),
                route           VARCHAR(255),
                frequency       VARCHAR(255),
                duration        VARCHAR(255),
                instructions    TEXT
            )
        """)
        cursor.execute("ALTER TABLE medications ADD COLUMN IF NOT EXISTS instructions TEXT")
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_medications_prescription_id
            ON medications(prescription_id)
        """)

        conn.commit()
        conn.close()
        print("[DB] PostgreSQL database tables verified.")
    except Exception as e:
        print(f"[DB] ERROR during migration: {e}")
        try:
            conn.close()
        except Exception:
            pass
