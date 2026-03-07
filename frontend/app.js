// ============================================================
// app.js — Dr. Deepak Kumar Prescription Form
// Stores data in Python/SQLite backend via REST API.
// Falls back to IndexedDB when backend is not running.
// ============================================================

// ================================================================
// Database Architecture: SQLite (Backend) + IndexedDB (Local Fallback)
// 
// Determine backend URL based on environment (Vercel vs Local)
const isLocalhost = window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.protocol === "file:";

const API_BASE = isLocalhost
    ? "http://localhost:8000/api"
    : "https://your-render-backend-url.onrender.com/api"; // NOTE: Update this URL after Render deployment!

const LOCAL_DB_ONLY = false; // Set to true to disable backend and force IndexedDB only
// ================================================================

// ── Backend reachability ─────────────────────────────────────
let backendAvailable = false;

async function checkBackend() {
    try {
        const res = await fetch("http://localhost:8000/health", { signal: AbortSignal.timeout(2000) });
        backendAvailable = res.ok;
    } catch {
        backendAvailable = false;
    }
    updateBackendStatus();
}

function updateBackendStatus() {
    const dot = document.getElementById("backendDot");
    const label = document.getElementById("backendLabel");
    if (!dot) return;
    if (backendAvailable) {
        dot.style.background = "#10b981";
        dot.title = "Connected to Python backend";
        label.textContent = "SQLite";
    } else {
        dot.style.background = "#f59e0b";
        dot.title = "Backend offline — using local IndexedDB";
        label.textContent = "Local";
    }
}

// ── IndexedDB fallback ───────────────────────────────────────
const DB_NAME = "PrescriptionDB_v2";
const DB_VERSION = 1;
const STORE_NAME = "prescriptions";

function openDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
                store.createIndex("patient_name", "patient_name", { unique: false });
            }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

async function idb_save(data) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).put(data);
        tx.oncomplete = () => resolve(data);
        tx.onerror = () => reject(tx.error);
    });
}

async function idb_getAll() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const req = tx.objectStore(STORE_NAME).getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

async function idb_get(id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const req = tx.objectStore(STORE_NAME).get(id);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

async function idb_delete(id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

// ── Storage abstraction (API or IndexedDB) ───────────────────

/** Save (create or update) a prescription. */
async function storageSave(data) {
    if (backendAvailable) {
        // Try PUT (update) first, then POST (create) if 404
        let res = await fetch(`${API_BASE}/${data.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (res.status === 404) {
            res = await fetch(API_BASE, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
        }
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || `Server error: ${res.status}`);
        }
        return await res.json();
    } else {
        return await idb_save(data);
    }
}

/** List all prescriptions (summary only). */
async function storageList(search = "") {
    if (backendAvailable) {
        const url = search
            ? `${API_BASE}?search=${encodeURIComponent(search)}`
            : API_BASE;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch list");
        const rows = await res.json();
        // Normalize API snake_case → camelCase for display
        return rows.map(r => ({
            id: r.id,
            patientNameDisplay: r.patient_name,
            date: r.patient_date || "",
            savedAt: r.saved_at,
        }));
    } else {
        let items = await idb_getAll();
        if (search) {
            const q = search.toLowerCase();
            items = items.filter(p =>
                (p.patient_name || p.patientName || "").toLowerCase().includes(q)
            );
        }
        items.sort((a, b) => new Date(b.savedAt || b.saved_at) - new Date(a.savedAt || a.saved_at));
        return items.map(r => ({
            id: r.id,
            patientNameDisplay: r.patient_name || r.patientName || "Unnamed",
            date: r.patient_date || r.patientDate || "",
            savedAt: r.savedAt || r.saved_at || "",
        }));
    }
}

/** Get a single full prescription. */
async function storageGet(id) {
    if (backendAvailable) {
        const res = await fetch(`${API_BASE}/${id}`);
        if (res.status === 404) return null;
        if (!res.ok) throw new Error("Failed to fetch prescription");
        return await res.json();
    } else {
        return await idb_get(id);
    }
}

/** Delete a prescription. */
async function storageDelete(id) {
    if (backendAvailable) {
        const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
        if (res.status === 404) return; // already gone
        if (!res.ok) throw new Error("Failed to delete");
    } else {
        await idb_delete(id);
    }
}

// ── Toast Notifications ──────────────────────────────────────

function showToast(message, type = "info") {
    const container = document.getElementById("toastContainer");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    const icons = { success: "✅", error: "❌", info: "ℹ️" };
    toast.innerHTML = `<span>${icons[type] || ""}</span> ${message}`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add("toast-exit");
        toast.addEventListener("animationend", () => toast.remove());
    }, 2800);
}

// ── Rx Table — Dynamic Rows ──────────────────────────────────

let rxRowCount = 0;

function addRxRow(data = {}) {
    rxRowCount++;
    const tbody = document.getElementById("rxTableBody");
    const tr = document.createElement("tr");
    tr.setAttribute("data-rx-row", rxRowCount);
    tr.innerHTML = `
    <td class="row-num">${rxRowCount}</td>
    <td class="drug-cell">
      <input type="text" name="rxDrug_${rxRowCount}" class="drug-input" placeholder="Type drug name…" value="${data.drug_name || data.drug || ""}" autocomplete="off" data-row="${rxRowCount}" />
      <!-- autocomplete dropdown injected by JS -->
    </td>
    <td><input type="text" name="rxDose_${rxRowCount}" placeholder="e.g. 500mg" value="${data.dose || ""}" /></td>
    <td>
      <select name="rxRoute_${rxRowCount}">
        <option value="">Route</option>
        ${["Oral", "IV", "IM", "SC", "Topical", "Inhaled", "Rectal", "SL"].map(r =>
        `<option value="${r}" ${(data.route || "") === r ? "selected" : ""}>${r}</option>`
    ).join("")}
      </select>
    </td>
    <td>
      <select name="rxFreq_${rxRowCount}">
        <option value="">Frequency</option>
        ${[
            ["OD", "OD (Once daily)"], ["BD", "BD (Twice daily)"], ["TDS", "TDS (Thrice daily)"],
            ["QID", "QID (4× daily)"], ["HS", "HS (At bedtime)"], ["SOS", "SOS (As needed)"],
            ["STAT", "STAT (Immediately)"], ["Weekly", "Weekly"]
        ].map(([v, l]) =>
            `<option value="${v}" ${(data.frequency || "") === v ? "selected" : ""}>${l}</option>`
        ).join("")}
      </select>
    </td>
    <td><input type="text" name="rxDuration_${rxRowCount}" placeholder="e.g. 5 days" value="${data.duration || ""}" /></td>
    <td><button type="button" class="remove-row-btn" title="Remove">&times;</button></td>
  `;
    tbody.appendChild(tr);
    tr.querySelector(".remove-row-btn").addEventListener("click", () => {
        tr.remove();
        renumberRxRows();
    });
}

function renumberRxRows() {
    const rows = document.querySelectorAll("#rxTableBody tr");
    rows.forEach((row, i) => { row.querySelector(".row-num").textContent = i + 1; });
    rxRowCount = rows.length;
}

function clearRxTable() {
    document.getElementById("rxTableBody").innerHTML = "";
    rxRowCount = 0;
}

function getRxData() {
    const rows = document.querySelectorAll("#rxTableBody tr");
    const meds = [];
    rows.forEach((row) => {
        const inputs = row.querySelectorAll("input, select");
        const drug_name = inputs[0]?.value?.trim();
        if (drug_name) {
            meds.push({
                drug_name,
                dose: inputs[1]?.value?.trim() || "",
                route: inputs[2]?.value || "",
                frequency: inputs[3]?.value || "",
                duration: inputs[4]?.value?.trim() || "",
            });
        }
    });
    return meds;
}

// ── Field definitions (for serialise/deserialise) ────────────

const TEXT_FIELDS = [
    "clinicAddress", "clinicPhone", "regNo",
    "patientDate", "patientName", "patientAddress",
    "vitalBP", "vitalPulse", "vitalSpO2", "vitalTemp", "vitalRR", "vitalGRBS",
    "chiefComplaints", "provisionalDiagnosis", "investigations",
    "examRS", "examCVS", "examCNS", "examPA", "advice",
];
const NUMBER_FIELDS = ["patientAge", "patientWeight"];
const SELECT_FIELDS = ["patientSex"];
const CHECKBOX_FIELDS = [
    "cbDiabetes", "cbHypertension", "cbCOPD", "cbTB", "cbThyroid", "cbCAD", "cbCKD", "cbStroke",
    "cbSmoking", "cbAlcohol", "cbTobacco", "cbIVDrug",
    "exPallor", "exIcterus", "exCyanosis", "exClubbing", "exEdema",
];

// Map camelCase HTML id → snake_case API field
const FIELD_MAP = {
    clinicAddress: "clinic_address",
    clinicPhone: "clinic_phone",
    regNo: "reg_no",
    patientDate: "patient_date",
    patientName: "patient_name",
    patientAge: "patient_age",
    patientSex: "patient_sex",
    patientWeight: "patient_weight",
    patientAddress: "patient_address",
    vitalBP: "vital_bp",
    vitalPulse: "vital_pulse",
    vitalSpO2: "vital_spo2",
    vitalTemp: "vital_temp",
    vitalRR: "vital_rr",
    vitalGRBS: "vital_grbs",
    chiefComplaints: "chief_complaints",
    provisionalDiagnosis: "provisional_diagnosis",
    investigations: "investigations",
    cbDiabetes: "cb_diabetes",
    cbHypertension: "cb_hypertension",
    cbCOPD: "cb_copd",
    cbTB: "cb_tb",
    cbThyroid: "cb_thyroid",
    cbCAD: "cb_cad",
    cbCKD: "cb_ckd",
    cbStroke: "cb_stroke",
    cbSmoking: "cb_smoking",
    cbAlcohol: "cb_alcohol",
    cbTobacco: "cb_tobacco",
    cbIVDrug: "cb_iv_drug",
    exPallor: "ex_pallor",
    exIcterus: "ex_icterus",
    exCyanosis: "ex_cyanosis",
    exClubbing: "ex_clubbing",
    exEdema: "ex_edema",
    examRS: "exam_rs",
    examCVS: "exam_cvs",
    examCNS: "exam_cns",
    examPA: "exam_pa",
    advice: "advice",
};
const REVERSE_MAP = Object.fromEntries(Object.entries(FIELD_MAP).map(([k, v]) => [v, k]));

// ── Form Serialization ───────────────────────────────────────

function collectFormData(existingId) {
    const id = existingId || (Date.now().toString(36) + "-" + Math.random().toString(36).substring(2, 7));
    const saved_at = new Date().toISOString();
    const data = { id, saved_at };

    TEXT_FIELDS.forEach(htmlId => {
        const el = document.getElementById(htmlId);
        data[FIELD_MAP[htmlId] || htmlId] = el ? el.value : "";
    });
    NUMBER_FIELDS.forEach(htmlId => {
        const el = document.getElementById(htmlId);
        const v = el ? parseFloat(el.value) : null;
        data[FIELD_MAP[htmlId] || htmlId] = isNaN(v) ? null : v;
    });
    SELECT_FIELDS.forEach(htmlId => {
        const el = document.getElementById(htmlId);
        data[FIELD_MAP[htmlId] || htmlId] = el ? el.value : "";
    });
    CHECKBOX_FIELDS.forEach(htmlId => {
        const el = document.getElementById(htmlId);
        data[FIELD_MAP[htmlId] || htmlId] = el ? el.checked : false;
    });
    data.medications = getRxData();
    return data;
}

function populateForm(data) {
    // Helper: get value from data using snake_case or camelCase key
    const get = (htmlId) => {
        const snakeKey = FIELD_MAP[htmlId];
        return data[snakeKey] !== undefined ? data[snakeKey] : data[htmlId];
    };

    TEXT_FIELDS.forEach(htmlId => {
        const el = document.getElementById(htmlId);
        if (el) el.value = get(htmlId) || "";
    });
    NUMBER_FIELDS.forEach(htmlId => {
        const el = document.getElementById(htmlId);
        if (el) el.value = get(htmlId) ?? "";
    });
    SELECT_FIELDS.forEach(htmlId => {
        const el = document.getElementById(htmlId);
        if (el) el.value = get(htmlId) || "";
    });
    CHECKBOX_FIELDS.forEach(htmlId => {
        const el = document.getElementById(htmlId);
        if (el) el.checked = !!get(htmlId);
    });

    clearRxTable();
    const meds = data.medications || [];
    if (meds.length > 0) {
        meds.forEach(m => addRxRow(m));
    } else {
        for (let i = 0; i < 5; i++) addRxRow();
    }
}

function resetForm() {
    TEXT_FIELDS.forEach(id => { const el = document.getElementById(id); if (el) el.value = ""; });
    NUMBER_FIELDS.forEach(id => { const el = document.getElementById(id); if (el) el.value = ""; });
    SELECT_FIELDS.forEach(id => { const el = document.getElementById(id); if (el) el.value = ""; });
    CHECKBOX_FIELDS.forEach(id => { const el = document.getElementById(id); if (el) el.checked = false; });
    clearRxTable();
    for (let i = 0; i < 5; i++) addRxRow();
    document.getElementById("patientDate").value = new Date().toISOString().split("T")[0];
    currentPrescriptionId = null;
}

// ── Current prescription ─────────────────────────────────────
let currentPrescriptionId = null;

// ── Save ─────────────────────────────────────────────────────
async function handleSave() {
    const nameEl = document.getElementById("patientName");
    const dateEl = document.getElementById("patientDate");

    if (!nameEl.value.trim()) {
        nameEl.focus();
        showToast("Please enter patient name", "error");
        return;
    }
    if (!dateEl.value) {
        dateEl.focus();
        showToast("Please select a date", "error");
        return;
    }

    try {
        const data = collectFormData(currentPrescriptionId);
        const saved = await storageSave(data);
        currentPrescriptionId = saved.id || data.id;
        document.querySelector(".app-container").classList.add("save-flash");
        setTimeout(() => document.querySelector(".app-container").classList.remove("save-flash"), 700);
        const dest = backendAvailable ? "SQLite database" : "local storage";
        showToast(`Saved to ${dest}!`, "success");
    } catch (err) {
        console.error(err);
        showToast("Failed to save: " + err.message, "error");
    }
}

// ── Load Modal ───────────────────────────────────────────────
async function openLoadModal() {
    document.getElementById("loadModal").classList.add("active");
    await renderPrescriptionList();
}

function closeLoadModalFn() {
    document.getElementById("loadModal").classList.remove("active");
}

async function renderPrescriptionList(search = "") {
    const list = document.getElementById("prescriptionList");
    try {
        const items = await storageList(search);

        if (items.length === 0) {
            list.innerHTML = `
        <div class="empty-state">
          <div class="icon">📭</div>
          <p>${search ? "No matching prescriptions." : "No saved prescriptions yet."}</p>
        </div>`;
            return;
        }

        list.innerHTML = items.map(p => `
      <li class="prescription-list-item" data-id="${p.id}">
        <div class="info">
          <span class="name">${escapeHtml(p.patientNameDisplay || "Unnamed")}</span>
          <span class="meta">${p.date || "No date"} · ${formatTimestamp(p.savedAt)}</span>
        </div>
        <div class="actions">
          <button class="btn btn-secondary btn-icon load-item-btn" title="Load" data-id="${p.id}">📂</button>
          <button class="btn btn-danger btn-icon delete-item-btn" title="Delete" data-id="${p.id}">🗑️</button>
        </div>
      </li>
    `).join("");

        list.querySelectorAll(".load-item-btn").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                e.stopPropagation();
                await loadPrescription(btn.dataset.id);
                closeLoadModalFn();
            });
        });

        list.querySelectorAll(".delete-item-btn").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                e.stopPropagation();
                if (confirm("Delete this prescription permanently?")) {
                    await storageDelete(btn.dataset.id);
                    if (currentPrescriptionId === btn.dataset.id) currentPrescriptionId = null;
                    showToast("Prescription deleted", "info");
                    await renderPrescriptionList(document.getElementById("searchPrescriptions").value);
                }
            });
        });

        list.querySelectorAll(".prescription-list-item").forEach(li => {
            li.addEventListener("click", async () => {
                await loadPrescription(li.dataset.id);
                closeLoadModalFn();
            });
        });
    } catch (err) {
        console.error(err);
        list.innerHTML = '<div class="empty-state"><p>Error loading prescriptions.</p></div>';
    }
}

async function loadPrescription(id) {
    try {
        const data = await storageGet(id);
        if (!data) { showToast("Prescription not found", "error"); return; }
        populateForm(data);
        currentPrescriptionId = data.id;
        const name = data.patient_name || data.patientName || "Unknown";
        showToast(`Loaded: ${name}`, "success");
    } catch (err) {
        console.error(err);
        showToast("Failed to load prescription", "error");
    }
}

// ── Delete current ───────────────────────────────────────────
async function handleDelete() {
    if (!currentPrescriptionId) {
        showToast("No prescription to delete. Save first.", "info");
        return;
    }
    if (!confirm("Are you sure you want to delete this prescription?")) return;
    try {
        await storageDelete(currentPrescriptionId);
        showToast("Prescription deleted", "info");
        resetForm();
    } catch (err) {
        console.error(err);
        showToast("Failed to delete", "error");
    }
}

// ── Helpers ──────────────────────────────────────────────────
function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

function formatTimestamp(iso) {
    try {
        return new Date(iso).toLocaleDateString("en-IN", {
            day: "2-digit", month: "short", year: "numeric"
        }) + " " + new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    } catch { return ""; }
}

// ── Init ─────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
    // Default Rx rows
    for (let i = 0; i < 5; i++) addRxRow();
    document.getElementById("patientDate").value = new Date().toISOString().split("T")[0];

    // Check backend connectivity
    await checkBackend();
    // Re-check every 30s
    setInterval(checkBackend, 30000);

    document.getElementById("addRxRow").addEventListener("click", () => addRxRow());

    document.getElementById("btnSave").addEventListener("click", handleSave);
    document.getElementById("btnSaveBottom").addEventListener("click", handleSave);

    const newFn = () => {
        if (confirm("Start a new prescription? Unsaved changes will be lost.")) {
            resetForm();
            showToast("New prescription started", "info");
        }
    };
    document.getElementById("btnNew").addEventListener("click", newFn);
    document.getElementById("btnNewBottom").addEventListener("click", newFn);

    document.getElementById("btnLoad").addEventListener("click", openLoadModal);
    document.getElementById("btnLoadBottom").addEventListener("click", openLoadModal);

    document.getElementById("closeModal").addEventListener("click", closeLoadModalFn);
    document.getElementById("loadModal").addEventListener("click", (e) => {
        if (e.target === e.currentTarget) closeLoadModalFn();
    });

    document.getElementById("searchPrescriptions").addEventListener("input", (e) => {
        renderPrescriptionList(e.target.value);
    });

    document.getElementById("btnPrint").addEventListener("click", () => window.print());
    document.getElementById("btnPrintBottom").addEventListener("click", () => window.print());
    document.getElementById("btnDeleteBottom").addEventListener("click", handleDelete);

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "s") { e.preventDefault(); handleSave(); }
        if ((e.ctrlKey || e.metaKey) && e.key === "p") { e.preventDefault(); window.print(); }
        if (e.key === "Escape") closeLoadModalFn();
    });
});

// ================================================================
// PMBJP Generic Medicine Autocomplete
// Attaches to every .drug-input inside #rxTableBody.
// Uses the backend proxy: GET /api/medicine/search?name=...
// ================================================================

const MEDICINE_API = "http://localhost:8000/api/medicine/search";
const MEDICINE_DETAIL_API = "http://localhost:8000/api/medicine/detail";

/** Debounce helper */
function debounce(fn, ms) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

/** Close ALL open autocomplete dropdowns */
function closeAllDropdowns() {
    document.querySelectorAll(".drug-autocomplete").forEach(d => d.remove());
}

/** Render price block for a medicine result */
function renderPrice(price) {
    if (!price) return "";
    const { mrp = 0, final_price = 0, discount_perc = 0 } = price;
    return `
    <div class="drug-option-price">
      <div class="drug-price-final">₹${final_price.toFixed(0)}</div>
      ${mrp !== final_price ? `<div class="drug-price-mrp">₹${mrp.toFixed(0)}</div>` : ""}
      ${discount_perc ? `<div class="drug-price-disc">${discount_perc}% off</div>` : ""}
    </div>`;
}

/**
 * Build and show the autocomplete dropdown below a drug input.
 * @param {HTMLInputElement} input
 * @param {Array} results - medicine results from myUpchar API
 */
function showDropdown(input, results) {
    closeAllDropdowns();
    const cell = input.closest(".drug-cell");
    if (!cell) return;

    const dropdown = document.createElement("div");
    dropdown.className = "drug-autocomplete";
    dropdown.innerHTML = `
    <div class="drug-autocomplete-header">
      <span>Medicine Results</span>
      <span class="powered-by">⚕️ PMBJP</span>
    </div>
    <ul class="drug-autocomplete-list" id="drugDropdownList"></ul>
    <div class="drug-autocomplete-footer">
      Powered by <a href="http://janaushadhi.gov.in" target="_blank" rel="noopener">Jan Aushadhi</a>
    </div>`;

    const list = dropdown.querySelector("#drugDropdownList");

    results.forEach((med, idx) => {
        const inStock = med.in_stock !== false;
        const imgSrc = med.image || "";
        const li = document.createElement("li");
        li.className = "drug-option";
        li.setAttribute("data-idx", idx);
        li.innerHTML = `
      ${imgSrc ? `<img class="drug-option-img" src="${imgSrc}" alt="med" onerror="this.style.display='none'">` : ""}
      <div class="drug-option-body">
        <div class="drug-option-name">${escapeHtml(med.name || "")}</div>
        <div class="drug-option-form">${escapeHtml(med.form || "")}</div>
        <div class="drug-mfr-tag">${escapeHtml(med.manufacturer?.name || "")}</div>
      </div>
      ${renderPrice(med.price)}
      <span class="drug-stock-badge ${inStock ? "in-stock" : "out-stock"}">${inStock ? "✓" : "✗"}</span>`;

        li.addEventListener("mousedown", (e) => {
            e.preventDefault(); // don't blur the input before we handle the click
            selectDrugOption(input, med);
        });
        list.appendChild(li);
    });

    cell.appendChild(dropdown);

    // Keyboard navigation state for this dropdown
    let activeIdx = -1;
    const options = () => list.querySelectorAll(".drug-option");

    function navigate(dir) {
        const opts = options();
        opts.forEach(o => o.classList.remove("active"));
        activeIdx = Math.max(0, Math.min(activeIdx + dir, opts.length - 1));
        opts[activeIdx]?.classList.add("active");
        opts[activeIdx]?.scrollIntoView({ block: "nearest" });
    }

    // Store reference on input for keyboard handler
    input._dropdownKeyHandler = (e) => {
        if (!cell.querySelector(".drug-autocomplete")) return;
        if (e.key === "ArrowDown") { e.preventDefault(); navigate(1); }
        if (e.key === "ArrowUp") { e.preventDefault(); navigate(-1); }
        if (e.key === "Enter") {
            e.preventDefault();
            const opts = options();
            if (activeIdx >= 0 && opts[activeIdx]) {
                selectDrugOption(input, results[activeIdx]);
            }
        }
        if (e.key === "Escape") { closeAllDropdowns(); }
    };
    input.removeEventListener("keydown", input._dropdownKeyHandler);
    input.addEventListener("keydown", input._dropdownKeyHandler);
}

/** Show a loading or info status in the dropdown */
function showDropdownStatus(input, message, isLoading = false) {
    closeAllDropdowns();
    const cell = input.closest(".drug-cell");
    if (!cell) return;
    const dropdown = document.createElement("div");
    dropdown.className = "drug-autocomplete";
    dropdown.innerHTML = `
    <div class="drug-autocomplete-header">
      <span>Medicine Search</span>
      <span class="powered-by">⚕️ PMBJP</span>
    </div>
    <div class="drug-autocomplete-status ${isLoading ? "loading" : ""}">${message}</div>`;
    cell.appendChild(dropdown);
}

/**
 * Fill an Rx row with the selected drug's data.
 * @param {HTMLInputElement} input  - the drug name input
 * @param {Object} med              - myUpchar medicine object
 */
function selectDrugOption(input, med) {
    input.value = med.name || "";
    closeAllDropdowns();

    // Try to fill in the dose field from the "form" string
    const row = input.closest("tr");
    if (!row) return;
    const doseInput = row.querySelector("input[name^='rxDose']");
    if (doseInput && !doseInput.value) {
        // Extract first dosage-like token from form string (e.g. "500mg Tablet")
        const match = (med.form || "").match(/(\d+[\s]?(?:mg|ml|mcg|g|iu|IU|%|units))/i);
        if (match) doseInput.value = match[1];
    }

    showToast(`Selected: ${med.name}`, "success");
}

/**
 * Fetch medicine suggestions from the backend proxy and show them.
 * Gracefully handles missing API key (503) with a helpful message.
 */
const fetchSuggestions = debounce(async (input, query) => {
    if (!backendAvailable) {
        showDropdownStatus(input, "Backend offline — start the server to search medicines");
        return;
    }
    showDropdownStatus(input, "Searching…", true);
    try {
        const res = await fetch(`${MEDICINE_API}?name=${encodeURIComponent(query)}&page=1`);
        if (res.status === 503) {
            const err = await res.json();
            showDropdownStatus(input, "⚠️ " + (err.detail || "Database Error"));
            return;
        }
        if (!res.ok) {
            showDropdownStatus(input, "Search failed (status " + res.status + ")");
            return;
        }
        const data = await res.json();
        const results = data?.data || [];
        if (results.length === 0) {
            showDropdownStatus(input, `No medicines found for "${escapeHtml(query)}"`);
        } else {
            showDropdown(input, results);
        }
    } catch (err) {
        console.warn("Medicine search error:", err);
        showDropdownStatus(input, "Search unavailable");
    }
}, 350);

/**
 * Attach autocomplete to a drug input field.
 * Called once per row after the row is added to the DOM.
 */
function attachDrugAutocomplete(input) {
    input.addEventListener("input", () => {
        const q = input.value.trim();
        if (q.length < 2) { closeAllDropdowns(); return; }
        fetchSuggestions(input, q);
    });

    input.addEventListener("blur", () => {
        // Small delay so mousedown on an option fires first
        setTimeout(closeAllDropdowns, 200);
    });

    input.addEventListener("focus", () => {
        const q = input.value.trim();
        if (q.length >= 2) fetchSuggestions(input, q);
    });
}

/**
 * Patch addRxRow to also attach autocomplete after each row is inserted.
 * We observe the Rx table body for new rows using MutationObserver.
 */
function initMedicineAutocomplete() {
    // Attach to any rows already in the table
    document.querySelectorAll("#rxTableBody .drug-input").forEach(attachDrugAutocomplete);

    // Watch for new rows
    const observer = new MutationObserver((mutations) => {
        mutations.forEach(m => {
            m.addedNodes.forEach(node => {
                if (node.nodeType !== 1) return;
                const inputs = node.querySelectorAll
                    ? node.querySelectorAll(".drug-input")
                    : [];
                inputs.forEach(attachDrugAutocomplete);
                if (node.classList?.contains("drug-input")) attachDrugAutocomplete(node);
            });
        });
    });

    const tbody = document.getElementById("rxTableBody");
    if (tbody) observer.observe(tbody, { childList: true, subtree: true });

    // Close dropdowns when clicking elsewhere
    document.addEventListener("click", (e) => {
        if (!e.target.closest(".drug-cell")) closeAllDropdowns();
    });
}

// Init autocomplete after page load (DOMContentLoaded already ran addRxRow rows)
document.addEventListener("DOMContentLoaded", () => {
    // Small delay so addRxRow rows are rendered first
    setTimeout(initMedicineAutocomplete, 100);
});
