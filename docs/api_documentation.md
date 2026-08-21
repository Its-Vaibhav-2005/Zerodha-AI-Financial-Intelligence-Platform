# API Contract & Endpoint Documentation

## Base URL
`http://localhost:5000` (Local) / `https://your-backend.onrender.com` (Production)

---

## 1. Authentication Endpoints

### `POST /api/auth/register`
Creates a new investor account.
- **Request Body**:
  ```json
  { "email": "investor@example.com", "password": "secure_password" }
  ```
- **Response**: `201 Created` with JWT access token.

### `POST /api/auth/login`
Authenticates existing investor and returns bearer token.

---

## 2. Portfolio & Ingestion Endpoints

### `GET /api/portfolios`
Fetches available portfolios for user or default sample portfolios.

### `POST /api/portfolio/upload`
Uploads a Zerodha/Kite holdings CSV or Excel export file (`multipart/form-data`).

---

## 3. Intelligence & Analytics Endpoints

### `GET /api/portfolio/{portfolio_id}/insights`
Main AI intelligence endpoint.
- **Query Params**:
  - `benchmark`: `^NSEI` | `^BSESN` | `^NSEBANK`
  - `refresh`: `true` | `false`
- **Response**: Returns structured executive summary, stock contributors, risk analysis, and 4 explainable recommendation cards.

### `POST /api/feedback`
Records investor feedback (`Helpful`, `Accurate`, `Needs Context`) with SHA-256 prompt hash.

---

## 4. Model Context Protocol (MCP) Endpoints

### `GET /api/mcp/tools`
Lists all registered MCP tools and JSON parameter schemas.

### `POST /api/mcp/tools/execute`
Executes an MCP tool through the governed backend dispatcher.
- **Request Body**:
  ```json
  {
    "tool_name": "compute_portfolio_metrics",
    "arguments": { "portfolio_id": "PORT-1001", "benchmark": "^NSEI" }
  }
  ```

---

## 5. Operations & Compliance Endpoints

### `GET /api/operations/health`
Returns system uptime, active database engine, MCP protocol stats, and availability.

### `GET /api/operations/metrics`
Returns API p50/p95 latency, error rates, feedback mix, and tool execution distribution.

### `GET /api/compliance/audit-trail`
Retrieves immutable prompt hashes, model versions, and policy verification records.

### `POST /api/compliance/review`
Submits compliance officer sign-off (`APPROVED` / `FLAGGED`) with reviewer notes.
