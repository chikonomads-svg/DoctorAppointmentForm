# 🚀 Deployment Guide — Dr. Deepak Kumar Prescription System

> **Production Architecture**
> - **Backend**: Deployed on [Render.com](https://render.com) (Python FastAPI + PostgreSQL)
> - **Frontend**: Deployed on [Vercel](https://vercel.com) (React + Vite)
> - **Database**: Render PostgreSQL (or any PostgreSQL provider like Neon, Supabase)

---

## 📋 Prerequisites

1. **GitHub Account** — To host the repository
2. **Render Account** — [Sign up free](https://render.com)
3. **Vercel Account** — [Sign up free](https://vercel.com) (use GitHub SSO)
4. **PostgreSQL Database** — Render provides one, or use [Neon](https://neon.tech) (free tier)

---

## 🔧 Step 1: Push Code to GitHub

```bash
# Make sure you're in the project root
cd Form_web

# Stage all files
git add .

# Commit
git commit -m "chore: add deployment config for Render + Vercel"

# Push to GitHub
git push origin main
```

> ⚠️ If you haven't connected the repo yet:
> ```bash
> git remote add origin https://github.com/YOUR_USERNAME/DoctorAppointmentForm.git
> git branch -M main
> git push -u origin main
> ```

---

## 🖥️ Step 2: Deploy Backend to Render

### 2.1 Create a PostgreSQL Database (Optional — Use Render's)

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** → **PostgreSQL**
3. Fill in:
   - **Name**: `dr-deepak-db`
   - **Instance Type**: Free
4. Click **Create Database**
5. Wait for provisioning (2–3 min)
6. Copy the **Internal Database URL** (starts with `postgresql://...`) — you'll need this

### 2.2 Deploy the Web Service

1. In Render Dashboard, click **New +** → **Web Service**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `dr-deepak-backend`
   - **Environment**: `Python`
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
     > 💡 `$PORT` is automatically provided by Render — don't replace it with a fixed number
   - **Instance Type**: Free
4. Add **Environment Variables**:

| Key | Value | Description |
|-----|-------|-------------|
| `PYTHON_VERSION` | `3.11.0` | Python runtime (✅ already set in `render.yaml`) |
| `DATABASE_URL` | `postgresql://...` | Your PostgreSQL connection string |
| `OPENAI_API_KEY` | *(optional)* | For OCR features |
| `JWT_SECRET` | *(optional)* | For token signing |

5. Click **Create Web Service**
6. Wait for build & deploy (3–5 min)
7. Once live, your URL will be: `https://dr-deepak-backend.onrender.com`
8. Verify: Visit `https://dr-deepak-backend.onrender.com/health` — should return `{"status": "ok"}`

---

## 🌐 Step 3: Deploy Frontend to Vercel

### 3.1 Link Repository

1. Go to [Vercel Dashboard](https://vercel.com)
2. Click **Add New** → **Project**
3. Import your GitHub repository (`DoctorAppointmentForm`)

### 3.2 Configure Project

- **Framework Preset**: `Vite`
- **Root Directory**: `frontend-react`
- **Build Command**: `npm run build` (auto-detected from `vercel.json`)
- **Output Directory**: `dist` (auto-detected from `vercel.json`)
- **Install Command**: `npm install`

### 3.3 Add Environment Variable

| Key | Value | Description |
|-----|-------|-------------|
| `VITE_API_URL` | `https://dr-deepak-backend.onrender.com` | Your Render backend URL |

### 3.4 Deploy

1. Click **Deploy**
2. Wait for build (1–2 min)
3. Once live, your URL will be: `https://arogya-clinic.vercel.app` (customizable in Vercel settings)

### 3.5 (Optional) Custom Domain

1. Go to Project → **Settings** → **Domains**
2. Add your custom domain (e.g., `arogya.clinic`)
3. Follow Vercel's DNS configuration instructions

---

## 🔗 Step 4: Connect Frontend to Backend

After deployment, the `api.js` file will automatically detect the environment:

- **Local development**: Connects to `http://localhost:8000`
- **Production (Vercel)**: Uses `VITE_API_URL` environment variable → your Render backend

No code changes needed — the logic in `api.js` handles this automatically:
```js
const BASE_HOST = isLocalhost
    ? 'http://localhost:8000'
    : (import.meta.env.VITE_API_URL || 'https://dr-deepak-backend.onrender.com');
```

---

## 🔐 Environment Variables Summary

### Backend (`backend/.env` — local / Render Dashboard)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | ✅ Yes | — | PostgreSQL connection string |
| `OPENAI_API_KEY` | ❌ No | — | For OCR / AI features |
| `JWT_SECRET` | ❌ No | Auto-generated | JWT token signing |

### Frontend (`frontend-react/.env` — local / Vercel Dashboard)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | ✅ Yes (prod) | Detected locally | Backend API base URL |

---

## ✅ Post-Deployment Checklist

- [ ] Backend `/health` endpoint returns `{"status": "ok"}`
- [ ] API docs accessible at `https://dr-deepak-backend.onrender.com/docs`
- [ ] Frontend loads without errors (check browser console)
- [ ] Login/Signup works
- [ ] Create a new prescription and save it
- [ ] Search and load an existing prescription
- [ ] Print preview works
- [ ] Dashboard loads with stats
- [ ] Medicine autocomplete works
- [ ] Mobile responsive layout works

---

## 🔄 Redeployment Triggers

| Action | Backend (Render) | Frontend (Vercel) |
|--------|-----------------|-------------------|
| Git push to `main` | ✅ Auto-deploy | ✅ Auto-deploy |
| Manual redeploy | Dashboard → Manual Deploy | Dashboard → Redeploy |
| Env var change | Dashboard → Environment | Dashboard → Environment |

---

## 🐛 Troubleshooting

### Backend Issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| Build fails: `pip install` error | Missing dependency | Check `requirements.txt` format |
| 500 error on API calls | Database connection issue | Verify `DATABASE_URL` is correct |
| Module not found error | Wrong `rootDir` | Set `Root Directory` to `backend` in Render |
| CORS error in browser | Backend CORS not configured | CORS is set to `["*"]` in production |

### Frontend Issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| Blank page on Vercel | Missing `vercel.json` | Already included — check it's present |
| API calls returning 404 | Wrong `VITE_API_URL` | Set to your Render backend URL (no trailing `/`) |
| Build fails | Missing `npm install` | Ensure `installCommand: "npm install"` in Vercel |
| Routes not working | SPA routing | `vercel.json` has rewrites for SPA |

### Database Issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| `psycopg2.OperationalError` | Wrong connection string | Check host/port/user/password |
| Table not found | Migration not run | Restart the service (Render triggers startup) |
| SSL error | Missing `sslmode=require` | Add `?sslmode=require` to URL |

---

## 📁 Project Structure for Deployment

```
Form_web/
├── backend/
│   ├── main.py              # FastAPI entry point
│   ├── database.py          # PostgreSQL connection & schema
│   ├── requirements.txt     # Python dependencies (incl. gunicorn)
│   ├── .env.example         # Environment variable template
│   ├── render.yaml          # Render blueprint (auto-config)
│   └── routes/              # API route handlers
├── frontend-react/
│   ├── index.html           # Vite HTML entry
│   ├── package.json         # Node dependencies
│   ├── vercel.json          # Vercel config (SPA rewrites)
│   ├── .env.example         # Frontend env template
│   └── src/
│       ├── main.jsx         # React entry point
│       ├── api.js           # API client (auto-detects env)
│       └── components/      # React components
├── .gitignore
├── DEPLOY.md                # ← You are here
└── README.md                # Full project documentation
```

---

## 💰 Cost Breakdown (Free Tier)

| Service | Free Tier Limit | Monthly Cost |
|---------|----------------|--------------|
| **Render Web Service** | 750 hours/month (1 instance) | $0 |
| **Render PostgreSQL** | 1 GB storage, 100 MB RAM | $0 |
| **Vercel** | 100 GB bandwidth, 6000 build mins | $0 |
| **Total** | — | **$0/month** |

> ⚠️ **Note**: The free Render instance spins down after 15 min of inactivity. First request after idle may take 30–60 seconds (cold start). Upgrade to a paid plan ($7/month) to keep it always-on.

---

## 🚀 Quick-Start Commands

```bash
# Local development
cd Form_web
cp backend/.env.example backend/.env    # Edit with your DB URL
cd backend && uvicorn main:app --reload --port 8000 &

cd ../frontend-react
cp .env.example .env                    # VITE_API_URL=http://localhost:8000
npm install && npm run dev
```

---

## 📞 Support

For deployment issues, check:
- [Render Docs](https://render.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [FastAPI Deployment Guide](https://fastapi.tiangolo.com/deployment/)