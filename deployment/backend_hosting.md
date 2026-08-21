# Backend Hosting Guide (Render / Railway / Docker)

## 1. Local Verification
```bash
pip install -r backend/requirements.txt
python backend/app.py
```

## 2. Deploy on Render
1. Create a **New Web Service** linked to your GitHub repo.
2. Settings:
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `gunicorn backend.app:app --bind 0.0.0.0:$PORT` (or `python backend/app.py`)
3. Environment Variables:
   - `GEMINI_API_KEY`: Your Google AI Studio API key
   - `NEON_DATABASE_URL`: Your PostgreSQL connection string
   - `JWT_SECRET_KEY`: Production secret string
