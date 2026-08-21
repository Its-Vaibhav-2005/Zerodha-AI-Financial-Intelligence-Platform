# Frontend Deployment Guide (Vercel / Netlify)

## 1. Build Verification
```bash
cd frontend
npm install
npm run build
```

## 2. Deploy to Vercel
1. Push repository to GitHub.
2. Link repository in Vercel Dashboard.
3. Configure settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Set Environment Variables:
   - `VITE_API_BASE_URL`: `https://your-backend-service.onrender.com`
5. Click **Deploy**.
