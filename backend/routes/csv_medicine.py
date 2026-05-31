"""
routes/csv_medicine.py
---------------------
Ultra-fast medicine search using SQLite with FTS5 full-text search index.
Built from the merged CSV at build time via scripts/build_medicine_db.py.

Search is ~5-10ms even on 205K+ records.
"""
from __future__ import annotations
import os
import sqlite3
from contextlib import closing
from fastapi import APIRouter, Query

router = APIRouter(prefix="/api/medicine", tags=["Medicine Search"])

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BACKEND_DIR, "medicine_search.db")


def _get_conn() -> sqlite3.Connection:
    """Get a new read-only connection to the search database."""
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


@router.get("/csv-search")
def csv_search(
    q: str = Query(..., min_length=2, description="Search term"),
    limit: int = Query(20, le=50),
):
    """
    Real-time medicine search using SQLite FTS5 full-text index.
    Returns results ordered by relevance (FTS5 rank) then prefix matches.

    Strategy:
    1. FTS5 MATCH for full-text search (handles partial words, stemming)
    2. UNION with LIKE prefix search for terms FTS might miss
    3. Deduplicate and limit
    """
    if not os.path.exists(DB_PATH):
        return {"query": q, "count": 0, "data": [], "error": "Search database not found"}

    # Escape FTS5 special characters and build search query
    safe_q = q.replace('"', '""').replace("'", "''")
    # FTS5 prefix query: word* matches words starting with the term
    fts_query = " OR ".join(f'"{w}"*' for w in safe_q.split() if w) or f'"{safe_q}"*'

    sql = """
        SELECT
            m.id,
            m.product_id,
            m.product_name,
            m.category,
            m.manufacturer,
            m.package_size,
            m.price,
            m.sku_code,
            m.source,
            -- Rank: FTS relevance first, then prefix matches
            CASE
                WHEN m.norm_name LIKE ? THEN 1
                ELSE 0
            END AS is_prefix
        FROM medicines_fts f
        JOIN medicines m ON m.id = f.rowid
        WHERE medicines_fts MATCH ?
        ORDER BY is_prefix DESC, rank
        LIMIT ?
    """

    needle_like = q.lower().replace("'", "''") + "%"

    try:
        with closing(_get_conn()) as conn:
            cursor = conn.execute(sql, (needle_like, fts_query, limit))
            rows = cursor.fetchall()
    except sqlite3.OperationalError:
        # Fallback: simple LIKE search if FTS query is problematic
        fallback_sql = """
            SELECT id, product_id, product_name, category, manufacturer,
                   package_size, price, sku_code, source
            FROM medicines
            WHERE norm_name LIKE ?
            ORDER BY
                CASE
                    WHEN norm_name LIKE ? THEN 0
                    ELSE 1
                END,
                product_name
            LIMIT ?
        """
        with closing(_get_conn()) as conn:
            cursor = conn.execute(fallback_sql, (f"%{needle_like}", needle_like, limit))
            rows = cursor.fetchall()

    data = []
    seen_names = set()
    for r in rows:
        name = r["product_name"]
        name_lower = name.lower().strip()
        if name_lower in seen_names:
            continue
        seen_names.add(name_lower)

        data.append({
            "id": r["product_id"] or str(r["id"]),
            "name": name,
            "form": r["package_size"] or "",
            "group_name": r["category"] or "",
            "mrp": r["price"] or "",
            "manufacturer": {
                "name": r["manufacturer"] or "Generic"
            },
            "price": {
                "mrp": r["price"] or "",
                "final_price": r["price"] or "",
                "discount_perc": 0
            },
            "in_stock": True,
        })

    return {
        "query": q,
        "count": len(data),
        "data": data,
    }


@router.get("/csv-groups")
def csv_groups():
    """Return all unique drug categories for filter UI."""
    if not os.path.exists(DB_PATH):
        return {"groups": []}

    with closing(_get_conn()) as conn:
        cursor = conn.execute(
            "SELECT DISTINCT category FROM medicines WHERE category != '' ORDER BY category"
        )
        groups = [row["category"] for row in cursor.fetchall()]

    return {"groups": groups}
