"""
Build a fast in-memory search index for medicines.
Combines data from:
1. Pre-built Lucene indexes (data/medicine, data/generic, data/substance)
2. PMBJP Product List CSV (if available)

Run once during deployment: python scripts/build_medicine_index.py
Output: medicine_index.json — loaded at runtime by csv_medicine.py
"""
import os, json, re, csv, unicodedata

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "data")
OUTPUT_PATH = os.path.join(BASE_DIR, "medicine_index.json")


def normalize(s: str) -> str:
    """Lowercase + strip accents."""
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return s.lower().strip()


def extract_strings_from_cfs(filepath):
    """Extract readable strings from Lucene compound file."""
    strings = set()
    if not os.path.exists(filepath):
        return strings
    with open(filepath, 'rb') as f:
        data = f.read()
    for m in re.finditer(rb'[\x20-\x7e]{3,}', data):
        s = m.group().decode('ascii', errors='replace').strip()
        if s and len(s) >= 3 and not s.startswith('Lucene') and not s.startswith('BlockTree'):
            strings.add(s)
    return strings


def main():
    seen = set()
    records = []

    # ── 1. Extract from Lucene indexes ──
    for subdir in ['medicine', 'generic', 'substance']:
        cfs_path = os.path.join(DATA_DIR, subdir, "_0.cfs")
        for s in extract_strings_from_cfs(cfs_path):
            s_clean = s.strip()
            if len(s_clean) < 3 or len(s_clean) > 120:
                continue
            if not any(c.isalpha() for c in s_clean):
                continue
            if any(kw in s_clean for kw in ['Fields', 'Postings', 'Norms', 'Terms', 'Meta', 'Idx', 'Segments']):
                continue
            norm = normalize(s_clean)
            if norm not in seen:
                seen.add(norm)
                records.append({
                    "id": f"lucene-{len(records)}",
                    "name": s_clean,
                    "form": "",
                    "mrp": "",
                    "group_name": "",
                    "manufacturer": {"name": "Generic"},
                    "price": {"mrp": "", "final_price": "", "discount_perc": 0},
                    "in_stock": True,
                    "_norm": norm,
                })

    # ── 2. Add PMBJP CSV data (with better metadata) ──
    csv_path = os.path.join(BASE_DIR, "Product List_5_3_2026 @ 20_4_46.csv")
    if os.path.exists(csv_path):
        with open(csv_path, newline='', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            for row in reader:
                name = row.get("Generic Name", "").strip()
                if not name:
                    continue
                norm = normalize(name)
                if norm not in seen:
                    seen.add(norm)
                    records.append({
                        "id": row.get("Drug Code", f"pmbjp-{len(records)}").strip(),
                        "name": name,
                        "form": row.get("Unit Size", "").strip(),
                        "mrp": row.get("MRP", "").strip(),
                        "group_name": row.get("Group Name", "").strip(),
                        "manufacturer": {"name": "PMBJP Generic"},
                        "price": {
                            "mrp": row.get("MRP", "").strip(),
                            "final_price": row.get("MRP", "").strip(),
                            "discount_perc": 0,
                        },
                        "in_stock": True,
                        "_norm": norm,
                    })

    # ── 3. Categorize Lucene-only names ──
    # Attempt to extract form info from name heuristics
    for r in records:
        if not r["form"]:
            # Extract form from name (e.g. "Tablets", "Capsules", "Injection", "Syrup")
            for kw in ["Tablets", "Capsules", "Injection", "Syrup", "Suspension",
                       "Cream", "Ointment", "Gel", "Lotion", "Drops", "Spray",
                       "Inhaler", "Patch", "Solution", "Liquid"]:
                if kw.lower() in r["name"].lower():
                    r["form"] = kw
                    break

    # ── 4. Write output ──
    # Strip internal _norm field from output
    output_data = []
    for r in records:
        output_data.append({k: v for k, v in r.items() if k != "_norm"})

    output = {"count": len(output_data), "data": output_data}
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"✅ Built medicine index: {len(output_data)} records")
    print(f"   Output: {OUTPUT_PATH}")
    print(f"   Size: {os.path.getsize(OUTPUT_PATH) / 1024:.1f} KB")

    # Print a few for verification
    print("\n📋 Sample entries:")
    for r in output_data[:15]:
        print(f"  • {r['name']} | {r.get('form', '')} | ₹{r.get('mrp', 'N/A')}")


if __name__ == "__main__":
    main()