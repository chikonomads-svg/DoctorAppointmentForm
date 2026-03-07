"""
routes/ocr.py
-------------
Azure OpenAI GPT-4o vision OCR endpoint.
Extracts ALL prescription fields and maps them to the DB schema.
Extra info that doesn't map goes into specific notes columns.
"""
from __future__ import annotations
import base64, json, os, re
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(BASE_DIR, ".env"))

AZURE_ENDPOINT   = os.getenv("AZURE_OPENAI_ENDPOINT", "").rstrip("/")
AZURE_KEY        = os.getenv("AZURE_OPENAI_API_KEY") or os.getenv("AZURE_OPENAI_KEY", "")
AZURE_DEPLOYMENT = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME") or os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-4o")
AZURE_API_VER    = os.getenv("AZURE_OPENAI_API_VERSION", "2024-12-01-preview")
OPENAI_KEY       = os.getenv("OPENAI_API_KEY", "")

router = APIRouter(prefix="/api/ocr", tags=["OCR"])


class OCRRequest(BaseModel):
    image: str          # base64 encoded (data:image/... prefix or raw)
    mime_type: str = "image/jpeg"


# ── Prompt ────────────────────────────────────────────────────────────────────
EXTRACTION_PROMPT = """You are a clinical data extraction assistant for a doctor's prescription/patient form.

Analyze the image carefully and extract ALL visible information. Return a SINGLE JSON object with the following fields.
Leave any field as null if not visible. Do NOT add explanations outside the JSON.

{
  "patient_name":       string | null,
  "patient_age":        number | null,
  "patient_sex":        "Male" | "Female" | "Other" | null,
  "patient_weight":     number | null,
  "patient_address":    string | null,
  "patient_date":       string | null,
  "clinic_address":     string | null,
  "clinic_phone":       string | null,
  "reg_no":             string | null,

  "vital_bp":           string | null,
  "vital_pulse":        string | null,
  "vital_spo2":         string | null,
  "vital_temp":         string | null,
  "vital_rr":           string | null,
  "vital_grbs":         string | null,

  "chief_complaints":        string | null,
  "provisional_diagnosis":   string | null,
  "investigations":          string | null,
  "advice":                  string | null,

  "ex_pallor":    0 | 1,
  "ex_icterus":   0 | 1,
  "ex_cyanosis":  0 | 1,
  "ex_clubbing":  0 | 1,
  "ex_edema":     0 | 1,

  "exam_rs":   string | null,
  "exam_cvs":  string | null,
  "exam_cns":  string | null,
  "exam_pa":   string | null,

  "cb_diabetes":     0 | 1,
  "cb_hypertension": 0 | 1,
  "cb_copd":         0 | 1,
  "cb_tb":           0 | 1,
  "cb_thyroid":      0 | 1,
  "cb_cad":          0 | 1,
  "cb_ckd":          0 | 1,
  "cb_stroke":       0 | 1,
  "cb_smoking":      0 | 1,
  "cb_alcohol":      0 | 1,
  "cb_tobacco":      0 | 1,
  "cb_iv_drug":      0 | 1,

  "medications": [
    {
      "drug_name":  string,
      "dose":       string | null,
      "route":      string | null,
      "frequency":  string | null,
      "duration":   string | null
    }
  ],

  "extra_notes": string | null
}

Rules:
- For medications list ALL drugs/tablets/injections visible, even if partially legible.
- If you see additional information that doesn't fit any field above, place it in "extra_notes".
- Return ONLY the JSON object. No markdown, no commentary.
"""


def _extract_json(text: str) -> dict:
    """Robustly extract the first JSON object from a string."""
    text = text.strip()
    # strip markdown fences
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    try:
        return json.loads(text)
    except Exception:
        m = re.search(r"\{.*\}", text, re.DOTALL)
        if m:
            return json.loads(m.group())
        raise ValueError("No JSON found in response")


async def _call_azure(image_b64: str, mime: str) -> dict:
    import httpx
    url = (
        f"{AZURE_ENDPOINT}/openai/deployments/{AZURE_DEPLOYMENT}"
        f"/chat/completions?api-version={AZURE_API_VER}"
    )
    payload = {
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": EXTRACTION_PROMPT},
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:{mime};base64,{image_b64}"},
                    },
                ],
            }
        ],
        "max_tokens": 2000,
        "temperature": 0,
    }
    headers = {"api-key": AZURE_KEY, "Content-Type": "application/json"}
    async with httpx.AsyncClient(timeout=60) as client:
        r = await client.post(url, json=payload, headers=headers)
        r.raise_for_status()
        content = r.json()["choices"][0]["message"]["content"]
    return _extract_json(content)


async def _call_openai(image_b64: str, mime: str) -> dict:
    import httpx
    url = "https://api.openai.com/v1/chat/completions"
    payload = {
        "model": "gpt-4o",
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": EXTRACTION_PROMPT},
                    {"type": "image_url", "image_url": {"url": f"data:{mime};base64,{image_b64}"}},
                ],
            }
        ],
        "max_tokens": 2000,
        "temperature": 0,
    }
    headers = {"Authorization": f"Bearer {OPENAI_KEY}", "Content-Type": "application/json"}
    async with httpx.AsyncClient(timeout=60) as client:
        r = await client.post(url, json=payload, headers=headers)
        r.raise_for_status()
        content = r.json()["choices"][0]["message"]["content"]
    return _extract_json(content)


def _demo_response() -> dict:
    return {
        "patient_name": "Demo Patient",
        "patient_age": 45,
        "patient_sex": "Male",
        "patient_weight": 72,
        "patient_address": "123, Example Street, City",
        "patient_date": "2026-03-07",
        "vital_bp": "130/85",
        "vital_pulse": "82",
        "vital_spo2": "97",
        "vital_temp": "98.6",
        "vital_rr": "18",
        "vital_grbs": "126",
        "chief_complaints": "Headache, fatigue",
        "provisional_diagnosis": "Hypertension, Diabetes Mellitus Type 2",
        "investigations": "FBS, CBC, Lipid Profile",
        "advice": "Low salt diet, exercise 30 min/day",
        "cb_diabetes": 1,
        "cb_hypertension": 1,
        "medications": [
            {"drug_name": "Metformin 500mg", "dose": "500mg", "route": "Oral", "frequency": "BD", "duration": "30 days"},
            {"drug_name": "Amlodipine 5mg", "dose": "5mg", "route": "Oral", "frequency": "OD", "duration": "30 days"},
        ],
        "extra_notes": "Patient advised follow-up after 2 weeks",
        "_demo": True,
    }


@router.post("/extract")
async def extract_ocr(req: OCRRequest):
    # Strip data URL prefix if present
    image_b64 = req.image
    if "," in image_b64:
        image_b64 = image_b64.split(",", 1)[1]

    try:
        if AZURE_ENDPOINT and AZURE_KEY:
            data = await _call_azure(image_b64, req.mime_type)
        elif OPENAI_KEY:
            data = await _call_openai(image_b64, req.mime_type)
        else:
            data = _demo_response()
    except Exception as e:
        print(f"[OCR] Error: {e}")
        # Fallback to demo rather than failing hard
        data = _demo_response()
        data["_error"] = str(e)

    return JSONResponse(data)
