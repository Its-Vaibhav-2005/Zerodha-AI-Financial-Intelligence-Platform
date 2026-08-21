# Zerodha: AI Financial Intelligence Platform

## **Project Requirements**
**Key Steps**

1. **Step 1: Portfolio Input & Validation**

    * Capture the user-selected portfolio, holdings snapshot, risk preference, timeframe, and target insight type.
    * Validate that the portfolio data is complete enough to support summary generation before invoking any AI analysis.    
    * Strictly separate personally identifiable or sensitive account data from the analytical context sent into the reasoning layer.
    * Set up static test portfolios (e.g., concentrated, diversified, volatile) for hands-on operational validation without exposing real customer data.

2. **Step 2: Data Fetch & MCP Unification**
    * Pull external and internal data, including market prices, corporate actions, and news signals.
    * Build a Model Context Protocol (MCP) server to act as a governed integration layer. Expose portfolio, market, risk, and news tools through strictly typed schemas to ensure the AI receives clean, structured data rather than noisy text.

3. **Step 3: Deterministic Analytics Computation**
    * Build an analytics engine to compute concrete, logical metrics before the AI processes anything.
    * Calculate realistic features like sector concentration, stock-level P&L contribution, volatility flags, drawdown, downside risk, and benchmark comparisons to ground the AI's reasoning in hard mathematical facts.

4. **Step 4: LLM Analysis**
    * Feed the LLM the structured context generated in the previous steps.
    * Task the model with explaining what changed in the portfolio, why it matters, and what specific signals need attention, avoiding generic market commentary.

5. **Step 5: Explainable Recommendations Generation**
    * Output highly structured, reviewable recommendation cards.
    * Every card must include a clear signal, data-backed rationale, risk note, data source, and confidence indicator.
    * Enforce strict guardrails so the output remains an educational insight or risk alert, completely avoiding unmanaged buy/sell execution commands.

6. **Step 6: Dashboard & Interface Development**
    * Develop the **Investor Portfolio Intelligence Hub** and **Risk & Exposure Panel** to display plain-language portfolio summaries, major movers, and concentration alerts.
    * Build the **Internal Operations Dashboard** and **Compliance & Audit Panel** for internal teams to monitor workflow health, average generation time, failed data fetches, and policy review flags.

7. **Step 7: Safety, Governance & Feedback Loop**
    * Implement a continuous feedback loop that tracks investor actions, ignored alerts, accepted recommendations, and reviewer notes to monitor model quality over time.
    * Ensure the system degrades gracefully and safely—if market data APIs time out or securities are suspended, the product must clearly explain that real-time signals are unavailable.

**Tech Stack**
| Component | Technology (Free Tier / Open Source) | Primary Function |
|---|---|---|
| Frontend | React (via Vite), Tailwind CSS | Building the investor and operations dashboards with rapid styling. |
| Backend | Python (Flask) | Serving REST API endpoints, handling authentication, and orchestrating logic. |
| Analytics Engine | Python (Pandas, NumPy) | Computing deterministic metrics (drawdown, P&L, sector concentration). |
| Relational Database | NeonDB (Serverless PostgreSQL) | Storing structured portfolio schemas, user data, and compliance audit logs. |
| Vector Database | Qdrant Cloud (Free Tier) | Storing and retrieving semantic context for the LLM. |
| LLM | Google Gemini 1.5 Flash | Fast, cost-effective model for generating explainable insight cards (via Google AI Studio). |
| Market Data API | yfinance (Python library) or Alpha Vantage | Fetching free stock prices, historical charts, and basic market news. |
| MCP Integration | Official MCP Python SDK | Standardizing the tools the LLM uses to fetch data. |
| Hosting (Deployment) | Vercel (Frontend) & Render (Backend) | Free-tier cloud hosting to make your project live for the final demonstration. |