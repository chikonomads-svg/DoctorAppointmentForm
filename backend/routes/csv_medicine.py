"""
routes/csv_medicine.py
----------------------
Fast in-memory medicine search from the local product CSV.
Loaded once on startup, searched with substring matching (case-insensitive).
"""
from __future__ import annotations
import csv, os, unicodedata
from functools import lru_cache
from fastapi import APIRouter, Query

router = APIRouter(prefix="/api/medicine", tags=["Medicine Search"])

CSV_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                        "Product List_5_3_2026 @ 20_4_46.csv")


def _normalize(s: str) -> str:
    """Lowercase + strip accents for fuzzy matching."""
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return s.lower()


@lru_cache(maxsize=1)
def _load_drugs() -> list[dict]:
    drugs: list[dict] = []
    if not os.path.exists(CSV_PATH):
        return drugs
    with open(CSV_PATH, newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            drugs.append({
                "id":         row.get("Drug Code", "").strip(),
                "name":       row.get("Generic Name", "").strip(),
                "form":       row.get("Unit Size", "").strip(),
                "group_name": row.get("Group Name", "").strip(),
                "mrp":        row.get("MRP", "").strip(),
                "_norm":      _normalize(row.get("Generic Name", "")),
            })
    return drugs


@router.get("/csv-search")
def csv_search(
    q: str = Query(..., min_length=2, description="Search term"),
    limit: int = Query(20, le=50),
):
    """
    Real-time search from the local Product List CSV.
    Returns up to `limit` results ordered by whether the name STARTS with the query.
    """
    needle = _normalize(q)
    drugs  = _load_drugs()

    starts: list[dict] = []
    contains: list[dict] = []

    for d in drugs:
        if d["_norm"].startswith(needle):
            starts.append(d)
        elif needle in d["_norm"]:
            contains.append(d)

    results = (starts + contains)[:limit]

    return {
        "query": q,
        "count": len(results),
        "data": [
            {
                "id":         r["id"],
                "name":       r["name"],
                "form":       r["form"],
                "group_name": r["group_name"],
                "mrp":        r["mrp"],
                "manufacturer": {"name": "PMBJP Generic"},
                "price": {"mrp": r["mrp"], "final_price": r["mrp"], "discount_perc": 0},
                "in_stock": True,
            }
            for r in results
        ],
    }


@router.get("/csv-groups")
def csv_groups():
    """Return all unique drug groups for filter UI."""
    drugs = _load_drugs()
    groups = sorted({d["group_name"] for d in drugs if d["group_name"]})
    return {"groups": groups}
