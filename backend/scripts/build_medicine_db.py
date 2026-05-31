"""
scripts/build_medicine_db.py
----------------------------
Reads merged_medicine_catalog.csv and creates a SQLite database with FTS5
full-text search index for ultra-fast medicine lookups.

Used at build/deploy time to generate the search database.
Run:  python scripts/build_medicine_db.py
"""
import csv
import os
import sqlite3
import sys

# Paths relative to this script
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(SCRIPT_DIR)
CSV_PATH = os.path.join(BACKEND_DIR, "merged_medicine_catalog.csv")
DB_PATH = os.path.join(BACKEND_DIR, "medicine_search.db")


def normalize(s: str) -> str:
    """Lowercase + strip accents for searching."""
    import unicodedata
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return s.lower()


def build():
    if not os.path.exists(CSV_PATH):
        print(f"ERROR: CSV not found at {CSV_PATH}")
        sys.exit(1)

    # Remove old DB if exists
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)
        print(f"Removed old database at {DB_PATH}")

    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA journal_mode = OFF")
    conn.execute("PRAGMA synchronous = OFF")
    conn.execute("PRAGMA cache_size = -64000")  # 64MB cache

    # Create main table
    conn.execute("""
        CREATE TABLE IF NOT EXISTS medicines (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id TEXT,
            product_name TEXT NOT NULL,
            category TEXT DEFAULT '',
            manufacturer TEXT DEFAULT '',
            package_size TEXT DEFAULT '',
            price TEXT DEFAULT '',
            sku_code TEXT DEFAULT '',
            source TEXT DEFAULT '',
            norm_name TEXT NOT NULL
        )
    """)

    # Create FTS5 virtual table for full-text search
    conn.execute("""
        CREATE VIRTUAL TABLE IF NOT EXISTS medicines_fts USING fts5(
            product_name,
            category,
            manufacturer,
            content='medicines',
            content_rowid='id',
            tokenize='unicode61 remove_diacritics 2'
        )
    """)

    # Create B-tree index on norm_name for prefix search (LIKE queries)
    conn.execute("CREATE INDEX IF NOT EXISTS idx_norm_name ON medicines(norm_name)")

    # Also create index on product_name for direct lookups
    conn.execute("CREATE INDEX IF NOT EXISTS idx_product_name ON medicines(product_name)")

    print(f"Reading CSV: {CSV_PATH}")
    total_rows = 0
    batch = []

    with open(CSV_PATH, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)

        for row in reader:
            name = (row.get("product_name") or "").strip()
            if not name:
                continue

            norm = normalize(name)
            batch.append((
                row.get("product_id", "").strip(),
                name,
                (row.get("category") or "").strip(),
                (row.get("manufacturer") or "").strip(),
                (row.get("package_size") or "").strip(),
                (row.get("price") or "").strip(),
                (row.get("sku_code") or "").strip(),
                (row.get("source") or "").strip(),
                norm,
            ))
            total_rows += 1

            # Insert in batches of 5000
            if len(batch) >= 5000:
                conn.executemany(
                    "INSERT INTO medicines (product_id, product_name, category, manufacturer, package_size, price, sku_code, source, norm_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    batch,
                )
                batch = []

        # Flush remaining batch
        if batch:
            conn.executemany(
                "INSERT INTO medicines (product_id, product_name, category, manufacturer, package_size, price, sku_code, source, norm_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                batch,
            )

    conn.commit()

    # Now populate FTS index from the medicines table
    print("Building FTS index...")
    conn.execute("INSERT INTO medicines_fts(medicines_fts) VALUES('rebuild')")
    conn.commit()

    # Verify
    cursor = conn.execute("SELECT COUNT(*) FROM medicines")
    count = cursor.fetchone()[0]
    cursor = conn.execute("SELECT COUNT(*) FROM medicines_fts")
    fts_count = cursor.fetchone()[0]

    conn.close()

    # Get file size
    db_size = os.path.getsize(DB_PATH)
    db_size_mb = db_size / (1024 * 1024)

    print(f"\n===== SUCCESS =====")
    print(f"Total medicines inserted: {count:,}")
    print(f"FTS5 indexed entries:    {fts_count:,}")
    print(f"Database size:           {db_size_mb:.1f} MB")
    print(f"Saved to:                {DB_PATH}")

    return count


if __name__ == "__main__":
    build()