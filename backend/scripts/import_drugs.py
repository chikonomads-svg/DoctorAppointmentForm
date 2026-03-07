import csv
import psycopg2
import psycopg2.extras
import os

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "prescriptions.db")
# Using the specific file the user provided (now in the backend directory)
CSV_PATH = os.path.join(BASE_DIR, "Product List_5_3_2026 @ 20_4_46.csv")

def import_csv():
    if not os.path.exists(CSV_PATH):
        print(f"Error: CSV file not found at {CSV_PATH}")
        return

    DATABASE_URL = os.getenv("DATABASE_URL")
    if not DATABASE_URL:
        from dotenv import load_dotenv
        load_dotenv(os.path.join(BASE_DIR, ".env"))
        DATABASE_URL = os.getenv("DATABASE_URL")
    
    if not DATABASE_URL:
        print("DATABASE_URL not found!")
        return

    # Bypass Neon PgBouncer for migrations by removing "-pooler"
    direct_url = DATABASE_URL.replace("-pooler", "")

    print("Connecting to PostgreSQL database direct...")
    conn = psycopg2.connect(direct_url)
    conn.autocommit = True
    cursor = conn.cursor()

    # Create the PMBJP drugs table
    print("Creating pmbjp_drugs_v2 table...")
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS pmbjp_drugs_v2 (
        id SERIAL PRIMARY KEY,
        drug_code VARCHAR(255),
        generic_name VARCHAR(255) NOT NULL,
        unit_size VARCHAR(255),
        mrp REAL,
        group_name VARCHAR(255)
    )
    ''')

    # Create an index for faster searching
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_pmbjp_generic_name ON pmbjp_drugs_v2 (generic_name)')

    print(f"Reading CSV from {CSV_PATH}...")
    inserted_count = 0
    records = []
    
    with open(CSV_PATH, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        
        insert_query = '''
        INSERT INTO pmbjp_drugs_v2 (drug_code, generic_name, unit_size, mrp, group_name)
        VALUES %s
        '''
        
        for row in reader:
            drug_code = row.get("Drug Code", "")
            generic_name = row.get("Generic Name", "").strip()
            unit_size = row.get("Unit Size", "").strip()
            
            # Parse MRP carefully
            mrp_str = row.get("MRP", "0").strip()
            mrp = 0.0
            try:
                if mrp_str:
                    mrp = float(mrp_str)
            except ValueError:
                pass
            
            group_name = row.get("Group Name", "").strip()
            
            # Skip empty rows loosely
            if not generic_name:
                continue
                
            records.append((drug_code, generic_name, unit_size, mrp, group_name))
            inserted_count += 1
            
        print(f"Executing batch insert of {inserted_count} rows...")
        psycopg2.extras.execute_values(cursor, insert_query, records)

    conn.commit()
    conn.close()
    print(f"Successfully imported {inserted_count} PMBJP drugs into the local database.")

if __name__ == "__main__":
    import_csv()
