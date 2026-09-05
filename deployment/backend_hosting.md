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

## 3. Deploy with Docker
```bash
# Build unified image
docker build -t zerodha-ai-platform .

# Run container (frontend + backend unified on port 5000)
docker run -d -p 5000:5000 --env-file .env --name zerodha-app zerodha-ai-platform
```
