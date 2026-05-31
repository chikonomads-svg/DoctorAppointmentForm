import pandas as pd
import re

# ==========================
# File Paths
# ==========================
csv1_path = "../Product List_5_3_2026 @ 20_4_46.csv"
csv2_path = "../medicine_data.csv"

# ==========================
# Helper Function
# ==========================
def normalize_col(col):
    col = str(col).strip().lower()
    col = re.sub(r'[^a-z0-9]+', '_', col)
    return col.strip('_')

# ==========================
# Load CSVs
# ==========================
print("Loading CSV files...")

try:
    df1 = pd.read_csv(
        csv1_path,
        engine="python",
        on_bad_lines="skip"
    )
except Exception as e:
    print(f"Error reading CSV1: {e}")
    raise

try:
    df2 = pd.read_csv(
        csv2_path,
        engine="python",
        on_bad_lines="skip"
    )
except Exception as e:
    print(f"Error reading CSV2: {e}")
    raise

print("\n===== ORIGINAL SHAPES =====")
print("CSV1:", df1.shape)
print("CSV2:", df2.shape)

# ==========================
# Normalize Column Names
# ==========================
df1.columns = [normalize_col(c) for c in df1.columns]
df2.columns = [normalize_col(c) for c in df2.columns]

print("\nCSV1 Columns:")
print(df1.columns.tolist())

print("\nCSV2 Columns:")
print(df2.columns.tolist())

# ==========================
# Semantic Mapping
# ==========================
column_mapping = {
    "generic_name": "product_name",
    "medicine_name": "product_name",
    "drug_name": "product_name",

    "mrp": "price",
    "product_price": "price",

    "group_name": "category",
    "sub_category": "category",
    "subcategory": "category",

    "product_manufactured": "manufacturer",
    "manufacturer_name": "manufacturer",

    "drug_code": "sku_code",
    "product_code": "sku_code",

    "unit_size": "package_size",
    "pack_size": "package_size",

    "sr_no": "product_id",
    "id": "product_id"
}

df1.rename(columns=column_mapping, inplace=True)
df2.rename(columns=column_mapping, inplace=True)

# ==========================
# Add Source Column
# ==========================
df1["source"] = "Product_List"
df2["source"] = "medicine_data"

# ==========================
# Create Common Schema
# ==========================
all_columns = sorted(
    set(df1.columns.tolist()) |
    set(df2.columns.tolist())
)

for col in all_columns:
    if col not in df1.columns:
        df1[col] = pd.NA

    if col not in df2.columns:
        df2[col] = pd.NA

# Reorder Columns
df1 = df1[all_columns]
df2 = df2[all_columns]

# ==========================
# Clean Data
# ==========================
if "product_name" in df1.columns:
    df1["product_name"] = (
        df1["product_name"]
        .astype(str)
        .str.strip()
    )

if "product_name" in df2.columns:
    df2["product_name"] = (
        df2["product_name"]
        .astype(str)
        .str.strip()
    )

# Convert price columns if present
if "price" in df1.columns:
    df1["price"] = pd.to_numeric(df1["price"], errors="coerce")

if "price" in df2.columns:
    df2["price"] = pd.to_numeric(df2["price"], errors="coerce")

# ==========================
# Merge Data
# ==========================
merged_df = pd.concat(
    [df1, df2],
    ignore_index=True,
    sort=False
)

# ==========================
# Debug Information
# ==========================
print("\n===== AFTER MERGE =====")
print("CSV1 Rows:", len(df1))
print("CSV2 Rows:", len(df2))
print("Merged Rows:", len(merged_df))

if "product_name" in merged_df.columns:
    print(
        "Unique Product Names:",
        merged_df["product_name"].nunique()
    )

# ==========================
# Save Output
# ==========================
output_file = "../merged_medicine_catalog.csv"

merged_df.to_csv(
    output_file,
    index=False
)

print("\n===== SUCCESS =====")
print(f"Final Rows: {len(merged_df):,}")
print(f"Final Columns: {len(merged_df.columns)}")
print(f"Saved To: {output_file}")

print("\nFinal Columns:")
print(merged_df.columns.tolist())