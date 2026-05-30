"""
Extract readable medicine data from Lucene search indexes.
Outputs a compact JSON file that can be used for fast in-memory search.
"""
import os, json, struct, re, sys

BASE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "data")
OUTPUT_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "medicine_index.json")

def extract_strings_from_cfs(filepath):
    """Extract readable ASCII/UTF-8 strings from a Lucene compound file."""
    strings = set()
    if not os.path.exists(filepath):
        return strings
    with open(filepath, 'rb') as f:
        data = f.read()
    # Find all readable strings >= 3 chars
    for m in re.finditer(rb'[\x20-\x7e]{3,}', data):
        s = m.group().decode('ascii', errors='replace').strip()
        if s and len(s) >= 3 and not s.startswith('Lucene') and not s.startswith('BlockTree'):
            strings.add(s)
    return strings

def extract_strings_from_si(filepath):
    """Extract segment info strings."""
    strings = set()
    if not os.path.exists(filepath):
        return strings
    with open(filepath, 'rb') as f:
        data = f.read()
    for m in re.finditer(rb'[\x20-\x7e]{4,}', data):
        s = m.group().decode('ascii', errors='replace').strip()
        if s and len(s) >= 4 and not any(kw in s for kw in ['Lucene', 'Segment', 'Entry']):
            strings.add(s)
    return strings

def main():
    all_medicines = set()
    
    # Try to extract from the medicine index
    cfs_path = os.path.join(BASE_DIR, "medicine", "_0.cfs")
    med_strings = extract_strings_from_cfs(cfs_path)
    
    # Filter to likely medicine names (contains letters, reasonable length)
    for s in med_strings:
        s_clean = s.strip()
        # Skip if too short, too long, or contains only numbers/special chars
        if len(s_clean) < 4 or len(s_clean) > 100:
            continue
        if not any(c.isalpha() for c in s_clean):
            continue
        # Skip metadata strings
        if any(kw in s_clean for kw in ['Fields', 'Postings', 'Norms', 'Terms', 'Meta', 'Idx']):
            continue
        all_medicines.add(s_clean)
    
    # Also try generic and substance indexes
    for subdir in ['generic', 'substance']:
        cfs_path = os.path.join(BASE_DIR, subdir, "_0.cfs")
        for s in extract_strings_from_cfs(cfs_path):
            s_clean = s.strip()
            if len(s_clean) < 3 or len(s_clean) > 100:
                continue
            if not any(c.isalpha() for c in s_clean):
                continue
            all_medicines.add(s_clean)
    
    # Build structured records
    records = []
    seen = set()
    for name in sorted(all_medicines):
        key = name.lower().strip()
        if key in seen:
            continue
        seen.add(key)
        records.append({
            "id": f"ix-{len(records)}",
            "name": name,
            "form": "",
            "mrp": "",
            "manufacturer": {"name": "Generic"},
            "price": {"mrp": "", "final_price": "", "discount_perc": 0},
            "in_stock": True,
            "source": "lucene_index"
        })
    
    # Also merge in CSV data if available
    csv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 
                           "Product List_5_3_2026 @ 20_4_46.csv")
    if os.path.exists(csv_path):
        import csv
        with open(csv_path, newline='', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            for row in reader:
                name = row.get("Generic Name", "").strip()
                if name and name.lower() not in seen:
                    seen.add(name.lower())
                    records.append({
                        "id": row.get("Drug Code", f"csv-{len(records)}").strip(),
                        "name": name,
                        "form": row.get("Unit Size", "").strip(),
                        "mrp": row.get("MRP", "").strip(),
                        "group_name": row.get("Group Name", "").strip(),
                        "manufacturer": {"name": "PMBJP Generic"},
                        "price": {"mrp": row.get("MRP", "").strip(), "final_price": row.get("MRP", "").strip(), "discount_perc": 0},
                        "in_stock": True,
                        "source": "pmbjp_csv"
                    })
    
    # Write output
    output = {"count": len(records), "data": records}
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    
    print(f"Extracted {len(records)} medicine records")
    print(f"Written to: {OUTPUT_PATH}")
    
    # Print first 20 for verification
    for r in records[:20]:
        print(f"  {r['name']} | {r.get('form', '')} | ₹{r.get('mrp', 'N/A')}")

if __name__ == "__main__":
    main()