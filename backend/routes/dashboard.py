"""
routes/dashboard.py
-------------------
Dashboard stats endpoint – aggregates key metrics from the prescriptions table.
"""
from __future__ import annotations
from fastapi import APIRouter
from database import get_connection

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/stats")
def get_stats():
    conn = get_connection()
    try:
        cur = conn.cursor()

        # Total prescriptions
        cur.execute("SELECT COUNT(*) as total FROM prescriptions")
        total = cur.fetchone()["total"]

        # Today's count (saved_at contains ISO date string)
        cur.execute("""
            SELECT COUNT(*) as today
            FROM prescriptions
            WHERE saved_at LIKE %s
        """, (f"2026-03-07%",))  # dynamic in real use - see below
        # Actually do it properly with current date substring
        cur.execute("""
            SELECT COUNT(*) as today FROM prescriptions
            WHERE saved_at >= NOW()::date::text
        """)
        today = 0
        try:
            today = cur.fetchone()["today"]
        except Exception:
            pass

        # This week
        cur.execute("""
            SELECT COUNT(*) as week FROM prescriptions
            WHERE saved_at >= (NOW() - INTERVAL '7 days')::date::text
        """)
        week = 0
        try:
            week = cur.fetchone()["week"]
        except Exception:
            pass

        # Comorbidity counts
        comorbidities = {}
        for col, label in [
            ("cb_diabetes", "Diabetes"), ("cb_hypertension", "Hypertension"),
            ("cb_copd", "COPD"), ("cb_tb", "TB"), ("cb_thyroid", "Thyroid"),
            ("cb_cad", "CAD"), ("cb_ckd", "CKD"), ("cb_stroke", "Stroke"),
        ]:
            cur.execute(f"SELECT COUNT(*) as c FROM prescriptions WHERE {col} = 1")
            comorbidities[label] = cur.fetchone()["c"]

        # Sex distribution
        cur.execute("""
            SELECT patient_sex, COUNT(*) as c
            FROM prescriptions
            WHERE patient_sex IS NOT NULL AND patient_sex != ''
            GROUP BY patient_sex
        """)
        sex_dist = {r["patient_sex"]: r["c"] for r in cur.fetchall()}

        # Age groups
        cur.execute("""
            SELECT
                COUNT(CASE WHEN patient_age < 18 THEN 1 END) as child,
                COUNT(CASE WHEN patient_age BETWEEN 18 AND 40 THEN 1 END) as young_adult,
                COUNT(CASE WHEN patient_age BETWEEN 41 AND 60 THEN 1 END) as middle_aged,
                COUNT(CASE WHEN patient_age > 60 THEN 1 END) as senior
            FROM prescriptions WHERE patient_age IS NOT NULL
        """)
        age_row = cur.fetchone()
        age_groups = {
            "<18":   age_row["child"],
            "18-40": age_row["young_adult"],
            "41-60": age_row["middle_aged"],
            ">60":   age_row["senior"],
        } if age_row else {}

        # Average age
        cur.execute("SELECT AVG(patient_age) as avg_age FROM prescriptions WHERE patient_age IS NOT NULL")
        avg_age_row = cur.fetchone()
        avg_age = round(avg_age_row["avg_age"], 1) if avg_age_row and avg_age_row["avg_age"] else None

        # Recent 10 patients
        cur.execute("""
            SELECT id, patient_name, patient_age, patient_sex, provisional_diagnosis,
                   saved_at, cb_diabetes, cb_hypertension, cb_copd, cb_cad, cb_ckd
            FROM prescriptions
            ORDER BY saved_at DESC
            LIMIT 10
        """)
        recent = [dict(r) for r in cur.fetchall()]

        return {
            "total_patients":  total,
            "today":           today,
            "this_week":       week,
            "avg_age":         avg_age,
            "comorbidities":   comorbidities,
            "sex_distribution": sex_dist,
            "age_groups":      age_groups,
            "recent_patients": recent,
        }
    finally:
        conn.close()
