"""
routes/csv_medicine.py
---------------------
Fast in-memory medicine search from the pre-built medicine_index.json.
Combines data from:
1. Pre-built Lucene search indexes (data/medicine, data/generic, data/substance)
2. PMBJP Product List CSV

Loaded once at startup, searched with substring matching (case-insensitive).
"""
from __future__ import annotations
import json, os, unicodedata
from functools import lru_cache
from fastapi import APIRouter, Query

router = APIRouter(prefix="/api/medicine", tags=["Medicine Search"])

INDEX_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                          "medicine_index.json")


def _normalize(s: str) -> str:
    """Lowercase + strip accents for fuzzy matching."""
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return s.lower()


@lru_cache(maxsize=1)
def _load_drugs() -> list[dict]:
    """Load the pre-built medicine index. Returns empty list if not found."""
    if not os.path.exists(INDEX_PATH):
        return []
    with open(INDEX_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    drugs = data.get("data", [])
    # Pre-compute normalized names for faster searching
    for d in drugs:
        d["_norm"] = _normalize(d.get("name", ""))
    return drugs


@router.get("/csv-search")
def csv_search(
    q: str = Query(..., min_length=2, description="Search term"),
    limit: int = Query(20, le=50),
):
    """
    Real-time medicine search from the combined index.
    Returns up to `limit` results ordered by whether the name STARTS with the query.
    """
    needle = _normalize(q)
    drugs  = _load_drugs()

    starts: list[dict] = []
    contains: list[dict] = []

    for d in drugs:
        norm = d.get("_norm", "")
        if norm.startswith(needle):
            starts.append(d)
        elif needle in norm:
            contains.append(d)

    results = (starts + contains)[:limit]

    return {
        "query": q,
        "count": len(results),
        "data": [
            {
                "id":         r.get("id", ""),
                "name":       r.get("name", ""),
                "form":       r.get("form", ""),
                "group_name": r.get("group_name", ""),
                "mrp":        r.get("mrp", ""),
                "manufacturer": r.get("manufacturer", {"name": "Generic"}),
                "price":      r.get("price", {"mrp": "", "final_price": "", "discount_perc": 0}),
                "in_stock":   r.get("in_stock", True),
            }
            for r in results
        ],
    }


@router.get("/csv-groups")
def csv_groups():
    """Return all unique drug groups for filter UI."""
    drugs = _load_drugs()
    groups = sorted({d.get("group_name", "") for d in drugs if d.get("group_name")})
    return {"groups": groups}
