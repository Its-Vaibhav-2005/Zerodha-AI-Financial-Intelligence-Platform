# =========================================================
# Step 1: Build Frontend Single Page Application (React / Vite)
# =========================================================
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Install dependencies
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci || npm install

# Copy frontend source code and compile production build
COPY frontend/ ./
RUN npm run build

# =========================================================
# Step 2: Build Python Backend & Package Full-Stack Image
# =========================================================
FROM python:3.11-slim AS runtime

# Set environment defaults
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=5000 \
    HOST=0.0.0.0 \
    PYTHONPATH=/app

WORKDIR /app

# Install system dependencies (curl for healthcheck, build tools for optional C extensions)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r backend/requirements.txt

# Copy application modules and source
COPY backend/ /app/backend/
COPY analytics/ /app/analytics/
COPY ai_workflows/ /app/ai_workflows/
COPY mcp_server/ /app/mcp_server/
COPY data/ /app/data/
COPY sample.csv /app/sample.csv

# Copy compiled frontend assets into /app/frontend/dist for Flask static serving
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Ensure data directory exists and has proper permissions
RUN mkdir -p /app/data

# Expose unified web & API port
EXPOSE 5000

# Healthcheck to verify server is responding
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:5000/api/operations/health || exit 1

# Start production WSGI server (Gunicorn)
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "2", "--threads", "4", "--timeout", "120", "backend.app:app"]
