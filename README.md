# 🩺 आरोग्य क्लिनिक — Arogya Clinic Prescription Management System

A full-stack digital prescription management platform designed for **Dr. Deepak Kumar MD (General Medicine)** at **Arogya Clinic**. The system enables clinicians to create, manage, store, and print patient prescriptions electronically — mirroring the paper prescription format exactly for a seamless clinical workflow.

---

## 📖 Table of Contents

- [📦 Project Structure](#-project-structure)
- [🔧 Backend — FastAPI (Python)](#-backend--fastapi-python)
- [⚛️ Frontend — React (Vite)](#️-frontend--react-vite)
- [🎨 Design System](#-design-system)
- [📋 Form Features](#-form-features)
- [🖨️ Print View](#️-print-view)
- [📱 Dashboard](#-dashboard)
- [🔐 Environment Variables](#-environment-variables)
- [👨‍💻 Development Guide](#-development-guide)

---

## 📦 Project Structure

```
Form_web/
├── backend/                          # FastAPI (Python) backend
│   ├── main.py                       # Entry point — FastAPI app & route registration
│   ├── database.py                   # PostgreSQL connection & schema init
│   ├── models.py                     # Pydantic request/response schemas
│   ├── requirements.txt              # Python dependencies
│   ├── .env.example                  # Environment variable template
│   ├── render.yaml                   # Render.com deployment config
│   ├── routes/
│   │   ├── auth.py                   # Signup/Login (bcrypt-hashed passwords)
│   │   ├── prescriptions.py          # CRUD for prescriptions
│   │   ├── medicine.py               # PMBJP local medicine search
│   │   ├── csv_medicine.py           # In-memory CSV medicine search (faster)
│   │   └── dashboard.py              # Aggregated stats & analytics
│   └── scripts/
│       └── import_drugs.py           # Script to import drug CSV into DB
│
├── frontend/                         # Plain HTML/CSS/JS frontend (legacy)
│   ├── index.html
│   ├── style.css
│   └── app.js
│
├── frontend-react/                   # React + Vite frontend (recommended / active)
│   ├── index.html
│   ├── package.json
│   ├── vercel.json
│   ├── public/
│   │   └── vite.svg
│   └── src/
│       ├── main.jsx                  # React entry point
│       ├── App.jsx                   # Root component — ALL form UI inline
│       ├── api.js                    # All backend API calls
│       ├── index.css
│       ├── style.css                 # Complete design system & layout
│       └── components/
│           ├── Login.jsx             # Auth — signup/login form
│           ├── Dashboard.jsx         # Compact patient list + stat badges
│           ├── LoadModal.jsx         # Modal to search & load existing records
│           ├── PrescriptionPrint.jsx # A4 print layout matching PDF exactly
│           └── PrescriptionPrint.css # Print-specific styles
│
├── dr_deepak_kumar_prescription_template.pdf   # Reference template
└── .gitignore
```

---

## 🔧 Backend — FastAPI (Python)

### Tech Stack

| Layer       | Technology                         |
|-------------|------------------------------------|
| Framework   | FastAPI (Python 3.11+)             |
| Database    | PostgreSQL (with psycopg2)         |
| Auth        | bcrypt password hashing            |
| Medicine DB | Local PMBJP drug catalog           |
| Deployment  | Render.com (via `render.yaml`)     |

### Setup & Run

```bash
cd Form_web
python -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt

# Configure PostgreSQL connection
cp backend/.env.example backend/.env
# Edit backend/.env: DATABASE_URL=postgresql://user:pass@host:5432/prescriptions

uvicorn backend.main:app --reload --port 8000
```

### API Endpoints

| Method | Endpoint                          | Description                              |
|--------|-----------------------------------|------------------------------------------|
| GET    | `/health`                         | Health check                             |
| GET    | `/`                               | Root — links to docs                     |
| POST   | `/api/auth/signup`                | Register a new user                      |
| POST   | `/api/auth/login`                 | Login (returns user profile)             |
| GET    | `/api/auth/users`                 | List all users (admin utility)           |
| POST   | `/api/prescriptions`              | Create a new prescription                |
| GET    | `/api/prescriptions`              | List prescriptions (search, paginate)    |
| GET    | `/api/prescriptions/search`       | Search prescriptions by patient name     |
| GET    | `/api/prescriptions/{id}`         | Get single prescription with medications |
| PUT    | `/api/prescriptions/{id}`         | Update an existing prescription          |
| DELETE | `/api/prescriptions/{id}`         | Delete a prescription                    |
| GET    | `/api/medicine/search?name=...`   | Search PMBJP database by drug name       |
| GET    | `/api/medicine/detail?product_id=`| Get full details for a specific drug     |
| GET    | `/api/medicine/csv-search?q=...`  | Faster in-memory CSV search              |
| GET    | `/api/medicine/csv-groups`        | List all unique drug groups              |
| GET    | `/api/dashboard/stats`            | Aggregated stats & analytics             |

### Database Schema

**`prescriptions`** — Central table with all fields for clinic info, patient demographics, vitals, clinical assessment, physical exam, systemic exam, investigations, comorbidities (with detailed sub-fields for diabetes, hypertension, COPD, TB, thyroid, CAD, CKD, stroke), addictions, advice, and follow-up.

**`medications`** — Child table linked via `prescription_id` (CASCADE delete) with fields: `drug_name`, `dose`, `route`, `frequency`, `duration`, `instructions`.

**`users`** — Authentication table with `name`, `email`, `password_hash`, `role` (doctor/admin).

### Medicine Search

Two search backends:
1. **CSV Search** (`/api/medicine/csv-search`) — Fast in-memory search from a local Product List CSV. Supports prefix + substring matching (case-insensitive, accent-normalized).
2. **PMBJP DB Search** (`/api/medicine/search`) — Database-backed with pagination (24 results/page).

### Deployment

The `render.yaml` file provides a **Render.com** blueprint:
- **Build**: `pip install -r backend/requirements.txt`
- **Start**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`

---

## ⚛️ Frontend — React (Vite)

### Tech Stack

| Layer          | Technology                              |
|----------------|-----------------------------------------|
| Framework      | React 19                                |
| Build Tool     | Vite 7                                  |
| API Client     | Native `fetch()` — no Axios needed      |
| Styling        | Complete custom CSS design system       |
| State Mgmt     | React hooks (`useState`, `useEffect`)   |
| Print          | Native `window.print()` + CSS `@media print` |
| Deployment     | Vercel (via `vercel.json`)              |

### Setup & Run

```bash
cd Form_web/frontend-react
npm install
npm run dev          # → http://localhost:5173
npm run build        # Production build
```

### Component Architecture

```
App.jsx (Root) ← All inline form UI
├── Login                    # Auth gate
├── Dashboard                # Patient list + compact stat badges
│   └── LoadModal            # Search & load existing prescriptions
├── Form View (inline in App.jsx)
│   ├── Clinic Header        # Arogya Clinic letterhead
│   ├── Patient Details      # Name, Age, Sex, Weight, Date, OP No, Address, Follow-up
│   ├── Two-Column Layout
│   │   ├── LEFT COLUMN
│   │   │   ├── Vitals           # BP, Pulse, SpO₂, Temp, RR, GRBS
│   │   │   ├── Physical Exam    # Pallor, Icterus, Cyanosis, Clubbing, Edema
│   │   │   ├── Systemic Exam    # RS, CVS, CNS, PA textareas
│   │   │   └── Investigations   # Lab test textarea
│   │   └── RIGHT COLUMN
│   │       ├── Chief Complaints # Textarea
│   │       ├── Diagnosis        # Quick-fill chips + textarea
│   │       ├── Comorbidities    # Checkbox toggles + expandable detail drawers
│   │       └── Addictions       # Toggle toggles
│   ├── Prescription Table       # Drug/Dose/Route/Freq/Dur/Instructions
│   └── Advice                   # Preset templates + textarea
├── PrescriptionPrint        # A4 print view matching paper PDF
│   ├── Hindi letterhead
│   ├── Two-column clinical body
│   ├── Medication table
│   ├── Diet routine graphic
│   └── Doctor signature block
```

---

## 🎨 Design System

### Color Palette

| Token        | Hex       | Usage                               |
|-------------|-----------|--------------------------------------|
| Deep Teal   | `#0B6E8A` | Primary brand, headers, buttons      |
| Teal Dark   | `#08566E` | Hover states, active elements        |
| Teal Light  | `#E2F0F4` | Section backgrounds, hover areas     |
| Soft Blue   | `#F0F7FA` | Page background, subtle sections     |
| White       | `#FFFFFF` | Cards, inputs, form sections         |
| Red         | `#E63946` | Danger buttons, delete actions       |
| Green       | `#2D9A4C` | Success indicators, online status    |
| Amber       | `#F59E0B` | Warnings, age badge                  |
| Text        | `#1F2937` | Primary body text                    |
| Muted       | `#6B7280` | Secondary text, labels               |

### Typography

- **Font Family**: `Inter` (system stack fallback)
- **Clinic Header**: `Noto Sans Devanagari` for Hindi text
- **Print Font**: `Times New Roman` (standard medical prescription format)
- **Base Size**: 15px for inputs (≥16px prevents iOS zoom), 14px for buttons

### Spacing & Layout

- **Form Section**: White card with `8px` radius, subtle shadow, `#D1D5DB` border
- **Section Gaps**: 12px between sections, 8px between fields
- **Touch Targets**: Minimum 44×44px for interactive elements
- **Two-Column**: Flex layout collapsing to single column at ≤768px

---

## 📋 Form Features

### One Scrollable Page
The entire form is a single scrollable page — no tabs, no accordion navigation. The doctor fills from top to bottom mirroring the paper prescription.

### Clinic Header
- Hindi clinic name: **आरोग्य क्लिनिक**
- English name: **Arogya Clinic**
- Doctor name: **Dr. Deepak Kumar MD (General Medicine)**
- Editable: Address, Phone, Registration Number

### Patient Details
- Name (required), Age, Sex (dropdown), Weight, Date (auto-fills today), OP/UHID No, Address, Follow-up

### Vitals (Left Column)
- BP (text input for "120/80" format), Pulse (number), SpO₂ (number), Temp (decimal), RR (number), GRBS (number)

### Physical Exam (Left Column)
- Toggle buttons: Pallor, Icterus, Cyanosis, Clubbing, Edema
- Active state shown with teal highlight

### Systemic Exam (Left Column)
- Textareas: RS (Respiratory System), CVS (Cardiovascular System), CNS (Central Nervous System), PA (Per Abdomen)

### Investigations (Left Column)
- Free-text area for lab tests

### Chief Complaints (Right Column)
- Large textarea for patient symptoms

### Provisional Diagnosis (Right Column)
- **Quick-fill chips**: Viral Fever, HTN Review, DM Follow-up, URTI, Gastritis, Migraine, Back Pain, Anxiety, Hypothyroidism, Bronchial Asthma, UTI, Anaemia
- Tap a chip to append to diagnosis textarea

### Comorbidities (Right Column)
- **Checkbox toggles**: Diabetes (🍬), Hypertension (💊), COPD (🫁), TB (🦠), Thyroid (🔵), CAD (❤️), CKD (🫘), Stroke (🧠)
- When toggled ON, an **expandable drawer** appears below with detail fields (duration, treatment, drugs, lab values, complications, notes)
- Drawers are collapsed by default — doctor opens only when follow-up detail is needed

### Addictions (Right Column)
- Toggles: Smoking, Alcohol, Tobacco, IV Drug Use

### Prescription Table (Full Width)
- Columns: #, Drug/Generic Name, Dose, Route, Frequency, Duration, Instructions
- Remove button (✕) per row
- **+ Add Medication** button to append unlimited rows
- Tab-friendly: Enter drug → Tab → dose → Tab → route → etc.

### Advice (Full Width)
- **Preset templates** as green chips:
  - "Rest & Fluids" → "Rest, plenty of fluids, avoid cold food."
  - "Diet & Exercise" → "Low salt diet, regular exercise 30 min/day…"
  - "Follow-up" → "Follow up after 5 days if symptoms persist."
  - "Tab Timing" → "Take medicines after meals. Avoid self-medication."
- Tap a chip to append to advice textarea

### Bottom Sticky Bar
Always visible: Dashboard, New, Load, Save, Print, Delete

---

## 🖨️ Print View

The print layout exactly matches the paper prescription PDF:

### Clinic Letterhead
- Logo/icon area
- **आरोग्य क्लिनिक** (Hindi, large)
- **Arogya Clinic** (English, teal, uppercase)
- Dr. Deepak Kumar MD (General Medicine)
- Clinic address, phone, registration number
- Deep teal divider

### Patient Details Row
Inline display: Name, Age/Sex, Weight, Date, OP No, Address

### Two-Column Clinical Body
- **Left Column**: Vitals → Physical Exam → Systemic Exam → Comorbidities → Addictions → Investigations
- **Right Column**: Chief Complaints → Diagnosis

### Prescription Table
Full-width bordered table with Drug, Dose, Route, Frequency, Duration, Instructions columns

### Diet & Advice
- Bullet-list formatted advice text
- Follow-up note

### Diet Routine Graphic
Visual timeline with icons:
```
🌅 Morning (06–09 AM) → ☀️ Afternoon (12–02 PM) → 🌆 Evening (03–06 PM) → 🌙 Dinner (07–09 PM)
```
- Medicine Timing: 06 AM–09 AM & 03 PM–06 PM
- Validity: 21 Days

### Signature Block
- Treating doctor signature line: Dr. Deepak Kumar MD (General Medicine)
- Registration No
- Date
- Footer note: "This is a computer-generated prescription. Valid for 21 days from the date of issue."

### Print CSS
- `@media print` hides all UI chrome (header, bottom bar, toast, dashboard)
- A4 page size with `12mm × 10mm` margins
- Serif font (`Times New Roman`) for printed output

---

## 📱 Dashboard

Compact patient management dashboard:

### Header
- Arogya Clinic branding with Hindi name
- **New Prescription** button
- User profile chip (avatar, name, logout)

### Stats Badges
Small, left-accented badges instead of heavy charts:
- 👥 Total Patients (teal accent)
- 📅 Today's Count (green accent)
- 📊 This Week's Count (purple accent)
- 🎂 Average Age (amber accent)

### Patient List
- **Search bar**: Real-time filtering by name or diagnosis
- **Table columns**: #, Name, Age, Sex (color-coded badges), Diagnosis, Date, Action (Open button)
- Click **Open →** to load a patient's prescription into the form
- Gender badges: Male (blue), Female (pink)

### Load Modal
- Search by patient name
- Results show name, date, saved timestamp
- Load button populates the form

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

| Variable       | Required | Description                    |
|----------------|----------|--------------------------------|
| `DATABASE_URL` | ✅ Yes   | PostgreSQL connection string   |

### Frontend (`frontend-react/.env`)

| Variable         | Required | Default                     | Description               |
|------------------|----------|-----------------------------|---------------------------|
| `VITE_API_URL`   | ❌ No    | Detected from `window.location` | Backend API base URL |

---

## 🔄 Data Flow

```
User fills form → App.jsx (state) → 35+ child sections via inline rendering
       │
       ▼
Save button → api.js (savePrescription) → PUT /api/prescriptions/{id} or POST /api/prescriptions
       │
       ▼
Backend validates (Pydantic) → Upserts into PostgreSQL → Returns full record
       │
       ▼
App updates state with returned data → Toast success notification
```

---

## 👨‍💻 Development Guide

### Adding a New Field to the Form

1. **Database**: Add column to `prescriptions` table in `backend/database.py`
2. **Pydantic Model**: Add field to `PrescriptionIn` in `backend/models.py`
3. **Upsert Mapping**: Add column/value to `_upsert_cols_and_values()` in `backend/routes/prescriptions.py`
4. **Frontend**: Add field in the appropriate section of `App.jsx` (all inline)
5. **Print**: Update `PrescriptionPrint.jsx` to render the new field
6. **EMPTY default**: Add default value in the `EMPTY()` function in `App.jsx`

### Adding a New Comorbidity Type

1. Add toggle column + detail columns in `database.py`
2. Add model fields in `models.py`
3. Add upsert mapping in `prescriptions.py`
4. Add config to `COMORBIDITIES` array in `App.jsx`
5. Add dashboard query in `dashboard.py`

### Adding Diagnosis Quick-fill Chips

Edit the `DIAGNOSIS_CHIPS` array in `App.jsx`:
```js
const DIAGNOSIS_CHIPS = [
    'Viral Fever', 'Hypertension Review', 'DM Follow-up', ...
];
```

### Adding Advice Preset Templates

Edit the `ADVICE_PRESETS` array in `App.jsx`:
```js
const ADVICE_PRESETS = [
    { label: 'Rest & Fluids', text: 'Rest, plenty of fluids, avoid cold food.' },
    ...
];
```

### Adding a New CVS Structured Field

1. Add column in `database.py` (add to `new_cols` list)
2. Add to `models.py` → `PrescriptionIn`
3. Add to `_upsert_cols_and_values()` in `prescriptions.py`
4. Add input in the Systemic Exam section of `App.jsx`
5. Add rendering in `PrescriptionPrint.jsx`
6. Add default value in `EMPTY()` in `App.jsx`

---

## 🧪 Running Tests

```bash
cd Form_web
pytest backend/tests/                    # Backend tests
cd Form_web/frontend-react && npx vitest  # Frontend tests
```

*(Test directories can be added under `backend/tests/` and `frontend-react/src/__tests__/`)*

---

## 📄 License

Proprietary software developed for Dr. Deepak Kumar's clinical use at Arogya Clinic.