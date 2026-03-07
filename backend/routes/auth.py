"""
routes/auth.py
--------------
Signup and login endpoints using the same PostgreSQL connection
as the rest of the app.  Passwords are bcrypt-hashed.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from database import get_connection

# Use bcrypt directly (avoids passlib/bcrypt version incompatibility)
try:
    import bcrypt as _bcrypt_lib

    def hash_password(pw: str) -> str:
        return _bcrypt_lib.hashpw(pw.encode('utf-8'), _bcrypt_lib.gensalt()).decode('utf-8')

    def verify_password(plain: str, hashed: str) -> bool:
        try:
            return _bcrypt_lib.checkpw(plain.encode('utf-8'), hashed.encode('utf-8'))
        except Exception:
            return False

except ImportError:
    import hashlib, hmac, os

    def hash_password(pw: str) -> str:          # type: ignore[misc]
        salt = os.urandom(16).hex()
        h = hashlib.sha256((salt + pw).encode()).hexdigest()
        return f"{salt}${h}"

    def verify_password(plain: str, hashed: str) -> bool:   # type: ignore[misc]
        try:
            salt, h = hashed.split("$", 1)
            return hmac.compare_digest(h, hashlib.sha256((salt + plain).encode()).hexdigest())
        except Exception:
            return False


router = APIRouter(prefix="/api/auth", tags=["Auth"])


# ── Pydantic models ────────────────────────────────────────────────────────────

class SignupRequest(BaseModel):
    name:  str
    email: str
    password: str
    role:  str = "doctor"    # doctor | admin

class LoginRequest(BaseModel):
    email:    str
    password: str


# ── Helper ────────────────────────────────────────────────────────────────────

def _safe_user(row: dict) -> dict:
    """Return user dict without the password hash."""
    return {
        "id":         row["id"],
        "name":       row["name"],
        "email":      row["email"],
        "role":       row["role"],
        "created_at": row["created_at"],
    }


# ── Signup ────────────────────────────────────────────────────────────────────

@router.post("/signup", status_code=status.HTTP_201_CREATED)
def signup(req: SignupRequest):
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")
    if not req.name.strip():
        raise HTTPException(status_code=400, detail="Name is required.")

    conn = get_connection()
    try:
        cur = conn.cursor()

        # Check duplicate email
        cur.execute("SELECT id FROM users WHERE email = %s", (req.email.lower().strip(),))
        if cur.fetchone():
            raise HTTPException(status_code=409, detail="An account with this email already exists.")

        uid = str(uuid.uuid4())
        created_at = datetime.now(timezone.utc).isoformat()
        pw_hash = hash_password(req.password)

        cur.execute(
            """
            INSERT INTO users (id, name, email, password_hash, role, created_at)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (uid, req.name.strip(), req.email.lower().strip(), pw_hash, req.role, created_at),
        )
        conn.commit()

        cur.execute("SELECT * FROM users WHERE id = %s", (uid,))
        user = dict(cur.fetchone())
        return JSONResponse(_safe_user(user), status_code=201)

    finally:
        conn.close()


# ── Login ─────────────────────────────────────────────────────────────────────

@router.post("/login")
def login(req: LoginRequest):
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute("SELECT * FROM users WHERE email = %s", (req.email.lower().strip(),))
        row = cur.fetchone()

        if not row:
            raise HTTPException(status_code=401, detail="Invalid email or password.")

        user = dict(row)
        if not verify_password(req.password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid email or password.")

        return JSONResponse(_safe_user(user))

    finally:
        conn.close()


# ── List users (admin utility) ────────────────────────────────────────────────

@router.get("/users")
def list_users():
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute("SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC")
        return [dict(r) for r in cur.fetchall()]
    finally:
        conn.close()
