"""
routes/ocr.py
-------------
Camera / image OCR endpoint that uses an AI model to extract
patient data from a photo of a prescription or patient record.
"""

from __future__ import annotations

import base64
import os
import json
import re
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel

router = APIRouter(prefix="/api/ocr", tags=["OCR"])


class OCRRequest(BaseModel):
    image_base64: str   # raw base64, no data-URL prefix


def _call_openai_vision(b64: str) -> dict:
    """
    Try Azure OpenAI GPT-4V first, then fall back to standard openai lib.
    Returns a dict of extracted fields matching PrescriptionIn schema.
    """
    import openai

    # Azure OpenAI (preferred if env vars present)
    az_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
    az_key      = os.getenv("AZURE_OPENAI_KEY")
    az_deploy   = os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-4o")

    if az_endpoint and az_key:
        client = openai.AzureOpenAI(
            azure_endpoint=az_endpoint,
            api_key=az_key,
            api_version="2024-02-15-preview",
        )
        model = az_deploy
    else:
        api_key = os.getenv("OPENAI_API_KEY", "")
        client  = openai.OpenAI(api_key=api_key)
        model   = "gpt-4o"

    prompt = """You are a medical data extraction AI.
Analyse this image (a photo of a prescription, patient record, or clinical note) and extract all visible patient data.

Return ONLY a valid JSON object (no markdown, no extra text) with any of these keys you can confidently extract:
{
  "patient_name": "",
  "patient_age": null,
  "patient_sex": "",
  "patient_address": "",
  "patient_date": "",
  "patient_weight": null,
  "vital_bp": "",
  "vital_pulse": "",
  "vital_spo2": "",
  "vital_temp": "",
  "vital_grbs": "",
  "chief_complaints": "",
  "provisional_diagnosis": "",
  "investigations": "",
  "advice": "",
  "cb_diabetes": false,
  "cb_hypertension": false,
  "cb_copd": false,
  "cb_tb": false,
  "cb_thyroid": false,
  "cb_cad": false,
  "cb_ckd": false,
  "cb_stroke": false,
  "medications": []
}

For medications array use: [{"drug_name": "", "dose": "", "route": "", "frequency": "", "duration": ""}]
Set boolean comorbidity flags to true if mentioned in the document.
Only include keys you can see; omit keys with no data."""

    response = client.chat.completions.create(
        model=model,
        messages=[{
            "role": "user",
            "content": [
                {"type": "text", "text": prompt},
                {"type": "image_url", "image_url": {
                    "url": f"data:image/jpeg;base64,{b64}",
                    "detail": "high"
                }},
            ],
        }],
        max_tokens=1500,
    )

    raw = response.choices[0].message.content.strip()
    # Strip markdown code fences if present
    raw = re.sub(r"^```[a-z]*\n?", "", raw)
    raw = re.sub(r"\n?```$", "", raw)
    return json.loads(raw)


def _demo_extraction() -> dict:
    """
    Fallback when no AI API key is configured.
    Returns a clearly-labelled demo payload so the UI still works.
    """
    return {
        "patient_name": "Sample Patient (Demo)",
        "patient_age": 45,
        "patient_sex": "Male",
        "vital_bp": "130/80 mmHg",
        "vital_pulse": "78/min",
        "chief_complaints": "Fever, cough for 3 days",
        "provisional_diagnosis": "Viral URI",
        "cb_hypertension": True,
        "medications": [
            {"drug_name": "Paracetamol", "dose": "500mg", "route": "Oral",
             "frequency": "TDS", "duration": "5 days"},
            {"drug_name": "Cetirizine",  "dose": "10mg",  "route": "Oral",
             "frequency": "OD",  "duration": "5 days"},
        ],
        "_demo": True,
        "_note": "Configure AZURE_OPENAI_ENDPOINT + AZURE_OPENAI_KEY (or OPENAI_API_KEY) for real OCR"
    }


@router.post("/extract")
def extract_from_image(req: OCRRequest):
    if not req.image_base64:
        raise HTTPException(status_code=400, detail="image_base64 is required")

    # Validate it's plausible base64
    try:
        base64.b64decode(req.image_base64[:100])
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid base64 data")

    # Check if any AI backend is configured
    has_openai = bool(
        os.getenv("OPENAI_API_KEY") or
        (os.getenv("AZURE_OPENAI_ENDPOINT") and os.getenv("AZURE_OPENAI_KEY"))
    )

    if not has_openai:
        # Return demo data so dev can see the full UI flow
        return JSONResponse(_demo_extraction())

    try:
        result = _call_openai_vision(req.image_base64)
        return JSONResponse(result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI extraction failed: {str(e)}")
