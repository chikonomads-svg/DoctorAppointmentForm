"""
Build a fast in-memory search index for medicines.
Combines PMBJP Product List CSV into a JSON index loaded at runtime.

Run during deployment: python scripts/build_medicine_index.py
Output: medicine_index.json
"""
import os, json, csv, unicodedata

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT_PATH = os.path.join(BASE_DIR, "medicine_index.json")


def normalize(s: str) -> str:
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return s.lower().strip()


def main():
    seen = set()
    records = []

    csv_path = os.path.join(BASE_DIR, "Product List_5_3_2026 @ 20_4_46.csv")
    if not os.path.exists(csv_path):
        print(f"❌ CSV not found: {csv_path}")
        return

    with open(csv_path, newline='', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            name = row.get("Generic Name", "").strip()
            if not name:
                continue
            norm = normalize(name)
            if norm in seen:
                continue
            seen.add(norm)
            records.append({
                "id": row.get("Drug Code", "").strip(),
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

    output_data = []
    for r in records:
        output_data.append({k: v for k, v in r.items() if k != "_norm"})

    output = {"count": len(output_data), "data": output_data}
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"✅ Built medicine index: {len(output_data)} records")
    print(f"   Size: {os.path.getsize(OUTPUT_PATH) / 1024:.1f} KB")


if __name__ == "__main__":
    main()