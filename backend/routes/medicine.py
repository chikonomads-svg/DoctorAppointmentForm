"""
routes/medicine.py
------------------
Local PMBJP Medicine Database Search.
Queries the local SQLite database instead of external APIs.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from database import get_connection

router = APIRouter(prefix="/api/medicine", tags=["Medicine Search"])

@router.get("/search")
async def search_medicine(
    name: Optional[str] = Query(None, description="Medicine name to search"),
    page: int = Query(1, ge=1, description="Page number (24 results per page)"),
):
    """
    Search local PMBJP generic medicine catalog.
    """
    if not name:
        return {"data": []}

    limit = 24
    offset = (page - 1) * limit
    
    conn = get_connection()
    cursor = conn.cursor()
    
    # We do a LIKE match on the prefix. You could change this to '%{name}%' for anywhere match.
    search_term = f"{name}%"
    
    query = '''
        SELECT drug_code, generic_name, unit_size, mrp, group_name
        FROM pmbjp_drugs_v2
        WHERE generic_name ILIKE %s
        ORDER BY generic_name ASC
        LIMIT %s OFFSET %s
    '''
    
    try:
        cursor.execute(query, (search_term, limit, offset))
        rows = cursor.fetchall()
        
        results = []
        for r in rows:
            # Format to match the frontend's expected schema (which was originally myUpchar)
            results.append({
                "id": str(r["drug_code"]),
                "name": r["generic_name"],
                "form": r["unit_size"],
                "manufacturer": {"name": "PMBJP Generic"},
                "price": {
                    "mrp": r["mrp"],
                    "final_price": r["mrp"],
                    "discount_perc": 0
                },
                "in_stock": True,
                "group_name": r["group_name"]
            })
            
        return {"data": results}
    except Exception as e:
        print(f"Error querying PMBJP database: {e}")
        raise HTTPException(status_code=500, detail="Database query failed.")
    finally:
        conn.close()


@router.get("/detail")
async def get_medicine_detail(
    product_id: str = Query(..., description="Product ID from search results"),
):
    """Return full details for a PMBJP medicine."""
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
            SELECT drug_code, generic_name, unit_size, mrp, group_name
            FROM pmbjp_drugs_v2
            WHERE drug_code = %s
        ''', (product_id,))
        row = cursor.fetchone()
        
        if not row:
            raise HTTPException(status_code=404, detail="Medicine not found")
            
        return dict(row)
    finally:
        conn.close()
