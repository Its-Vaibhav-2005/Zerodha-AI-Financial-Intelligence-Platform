import sys
import os
import hashlib
import json
import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_bcrypt import Bcrypt

# Ensure the root folder is accessible for imports
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from analytics.marketData import normalize_symbol
from analytics.portfolioAnalytics import PortfolioAnalytics
from ai_workflows.insightGenerator import PortfolioInsightGenerator
from backend.db import get_db_connection, init_db

app = Flask(__name__)
# Enable CORS for frontend integration
CORS(app)

# JWT Secret Configuration
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "zerodha-ai-super-secret-key-2026")
jwt = JWTManager(app)
bcrypt = Bcrypt(app)

# Initialize database schema on startup
with app.app_context():
    try:
        init_db()
        print("[DB] Tables initialized successfully.")
    except Exception as e:
        print(f"[DB Warning] Could not auto-initialize DB: {e}")

# Sector mapping fallback dictionary for Zerodha CSV upload
SECTOR_LOOKUP = {
    "TCS": "Technology", "INFY": "Technology", "WIPRO": "Technology", "HCLTECH": "Technology", "TECHM": "Technology", "LTIM": "Technology",
    "RELIANCE": "Energy", "ONGC": "Energy", "BPCL": "Energy", "IOC": "Energy", "NTPC": "Energy", "POWERGRID": "Energy",
    "HDFCBANK": "Financial Services", "ICICIBANK": "Financial Services", "SBIN": "Financial Services", "KOTAKBANK": "Financial Services", "AXISBANK": "Financial Services",
    "TATAMOTORS": "Automobile", "M&M": "Automobile", "MARUTI": "Automobile", "HEROMOTOCO": "Automobile", "BAJAJ-AUTO": "Automobile",
    "ITC": "Consumer Goods", "HINDUNILVR": "Consumer Goods", "NESTLEIND": "Consumer Goods", "BRITANNIA": "Consumer Goods",
    "LT": "Construction", "ULTRACEMCO": "Construction",
    "SUNPHARMA": "Healthcare", "DRREDDY": "Healthcare", "CIPLA": "Healthcare",
    "ZOMATO": "Consumer Discretionary", "PAYTM": "Financial Technology"
}

def lookup_sector(raw_symbol: str) -> str:
    clean = raw_symbol.upper().replace(".NS", "").replace(".BO", "").strip()
    return SECTOR_LOOKUP.get(clean, "Diversified")

# --- AUTHENTICATION ROUTES ---

@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json() or {}
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")

        if not email or not password:
            return jsonify({"status": "error", "message": "Email and password are required."}), 400

        password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
        
        conn, db_type = get_db_connection()
        cur = conn.cursor()

        if db_type == "postgres":
            cur.execute("SELECT id FROM users WHERE email = %s", (email,))
            if cur.fetchone():
                conn.close()
                return jsonify({"status": "error", "message": "Email is already registered."}), 409

            cur.execute(
                "INSERT INTO users (email, password_hash) VALUES (%s, %s) RETURNING id",
                (email, password_hash)
            )
            user_id = cur.fetchone()[0]
        else:
            cur.execute("SELECT id FROM users WHERE email = ?", (email,))
            if cur.fetchone():
                conn.close()
                return jsonify({"status": "error", "message": "Email is already registered."}), 409

            cur.execute(
                "INSERT INTO users (email, password_hash) VALUES (?, ?)",
                (email, password_hash)
            )
            user_id = cur.lastrowid

        conn.commit()
        conn.close()

        access_token = create_access_token(identity=str(user_id))
        return jsonify({
            "status": "success",
            "message": "User registered successfully.",
            "access_token": access_token,
            "user": {"id": user_id, "email": email}
        }), 201

    except Exception as e:
        print(f"[Auth Error] Registration failed: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json() or {}
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")

        if not email or not password:
            return jsonify({"status": "error", "message": "Email and password are required."}), 400

        conn, db_type = get_db_connection()
        cur = conn.cursor()

        if db_type == "postgres":
            cur.execute("SELECT id, password_hash FROM users WHERE email = %s", (email,))
            row = cur.fetchone()
        else:
            cur.execute("SELECT id, password_hash FROM users WHERE email = ?", (email,))
            row = cur.fetchone()

        conn.close()

        if not row:
            return jsonify({"status": "error", "message": "Invalid email or password."}), 401

        user_id, stored_hash = row[0], row[1]
        if not bcrypt.check_password_hash(stored_hash, password):
            return jsonify({"status": "error", "message": "Invalid email or password."}), 401

        access_token = create_access_token(identity=str(user_id))
        return jsonify({
            "status": "success",
            "access_token": access_token,
            "user": {"id": user_id, "email": email}
        }), 200

    except Exception as e:
        print(f"[Auth Error] Login failed: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500



@app.route('/api/portfolios', methods=['GET'])
def get_portfolios():
    try:
        user_id = request.args.get('user_id')
        conn, db_type = get_db_connection()
        cur = conn.cursor()

        if user_id:
            if db_type == "postgres":
                cur.execute("SELECT portfolio_id, investor_name, risk_profile FROM portfolios WHERE user_id = %s OR user_id IS NULL ORDER BY updated_at DESC", (user_id,))
            else:
                cur.execute("SELECT portfolio_id, investor_name, risk_profile FROM portfolios WHERE user_id = ? OR user_id IS NULL ORDER BY updated_at DESC", (user_id,))
        else:
            cur.execute("SELECT portfolio_id, investor_name, risk_profile FROM portfolios ORDER BY updated_at DESC")
        
        rows = cur.fetchall()
        conn.close()

        portfolios = []
        for r in rows:
            portfolios.append({
                "portfolio_id": r[0],
                "investor_name": r[1] or "Investor Portfolio",
                "risk_profile": r[2] or "Moderate"
            })

        # If DB is empty, provide default system portfolios
        if not portfolios:
            portfolios = [
                {"portfolio_id": "PORT-1001", "investor_name": "Vaibhav - Tech Growth", "risk_profile": "Aggressive"},
                {"portfolio_id": "PORT-1002", "investor_name": "Rahul - Moderate Bluechip", "risk_profile": "Moderate"},
                {"portfolio_id": "PORT-1003", "investor_name": "Ananya - High Beta Consumer", "risk_profile": "High Beta"}
            ]

        return jsonify({"status": "success", "portfolios": portfolios}), 200

    except Exception as e:
        print(f"[Portfolios Fetch Error] {e}")
        # Fallback default portfolios
        return jsonify({
            "status": "success",
            "portfolios": [
                {"portfolio_id": "PORT-1001", "investor_name": "Vaibhav - Tech Growth", "risk_profile": "Aggressive"},
                {"portfolio_id": "PORT-1002", "investor_name": "Rahul - Moderate Bluechip", "risk_profile": "Moderate"},
                {"portfolio_id": "PORT-1003", "investor_name": "Ananya - High Beta Consumer", "risk_profile": "High Beta"}
            ]
        }), 200


# --- PORTFOLIO INGESTION & CSV UPLOAD ROUTE ---

@app.route('/api/portfolio/upload', methods=['POST'])
def upload_portfolio_csv():
    try:
        if 'file' not in request.files:
            return jsonify({"status": "error", "message": "No file uploaded under form key 'file'."}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({"status": "error", "message": "Selected file is empty."}), 400

        user_id = request.form.get("user_id", "1")
        investor_name = request.form.get("investor_name", "Authenticated Investor")
        risk_profile = request.form.get("risk_profile", "Aggressive")
        portfolio_id = f"PORT-{user_id}"

        filename_lower = file.filename.lower()

        # Parse CSV or Excel (.xlsx, .xls) file
        if filename_lower.endswith('.csv'):
            df = pd.read_csv(file)
        elif filename_lower.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(file)
        else:
            return jsonify({"status": "error", "message": "Unsupported file format. Please upload a CSV (.csv) or Excel (.xlsx, .xls) file."}), 400
        
        # Clean column names
        df.columns = [str(c).strip().lower() for c in df.columns]
        
        # Determine column mappings for Zerodha / Kite exports & standard portfolios
        symbol_col = next((c for c in df.columns if any(k in c for k in ['instrument', 'symbol', 'ticker', 'stock'])), None)
        qty_col = next((c for c in df.columns if any(k in c for k in ['qty.', 'quantity', 'qty', 'shares'])), None)
        avg_price_col = next((c for c in df.columns if any(k in c for k in ['avg. cost', 'average price', 'avg price', 'buy price', 'avg_cost'])), None)
        cur_price_col = next((c for c in df.columns if any(k in c for k in ['cur. val', 'ltp', 'last price', 'current price', 'cur_val'])), None)

        if not symbol_col or not qty_col or not avg_price_col:
            return jsonify({
                "status": "error",
                "message": f"File missing required columns (Symbol/Instrument, Quantity, Avg Price). Detected columns: {list(df.columns)}"
            }), 400

        holdings = []
        for _, row in df.iterrows():
            raw_sym = str(row[symbol_col]).strip()
            if not raw_sym or raw_sym.lower() == 'nan':
                continue
            
            normalized_sym = normalize_symbol(raw_sym)
            qty = float(row[qty_col]) if pd.notnull(row[qty_col]) else 0.0
            avg_price = float(row[avg_price_col]) if pd.notnull(row[avg_price_col]) else 0.0
            cur_price = float(row[cur_price_col]) if cur_price_col and pd.notnull(row[cur_price_col]) else avg_price * 1.10
            
            holdings.append({
                "symbol": normalized_sym,
                "company_name": raw_sym.upper(),
                "shares": int(qty),
                "avg_buy_price": round(avg_price, 2),
                "current_price": round(cur_price, 2),
                "sector": lookup_sector(raw_sym)
            })

        # Persist holdings into NeonDB / SQLite portfolios table
        holdings_json = json.dumps(holdings)
        conn, db_type = get_db_connection()
        cur = conn.cursor()

        if db_type == "postgres":
            cur.execute("""
                INSERT INTO portfolios (portfolio_id, user_id, investor_name, risk_profile, holdings, updated_at)
                VALUES (%s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
                ON CONFLICT (portfolio_id) DO UPDATE SET
                    investor_name = EXCLUDED.investor_name,
                    risk_profile = EXCLUDED.risk_profile,
                    holdings = EXCLUDED.holdings,
                    updated_at = CURRENT_TIMESTAMP
            """, (portfolio_id, user_id, investor_name, risk_profile, holdings_json))
        else:
            cur.execute("""
                INSERT INTO portfolios (portfolio_id, user_id, investor_name, risk_profile, holdings)
                VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(portfolio_id) DO UPDATE SET
                    investor_name = excluded.investor_name,
                    risk_profile = excluded.risk_profile,
                    holdings = excluded.holdings
            """, (portfolio_id, user_id, investor_name, risk_profile, holdings_json))

        conn.commit()
        conn.close()

        return jsonify({
            "status": "success",
            "portfolio_id": portfolio_id,
            "holdings_count": len(holdings),
            "holdings": holdings
        }), 200

    except Exception as e:
        print(f"[Upload Error] {e}")
        return jsonify({"status": "error", "message": str(e)}), 500


# --- DYNAMIC INSIGHT & AUDIT FEEDBACK ROUTES ---

@app.route('/api/portfolio/<portfolio_id>/insights', methods=['GET'])
def get_portfolio_insights(portfolio_id):
    try:
        benchmark = request.args.get('benchmark', '^NSEI')
        refresh_str = request.args.get('refresh', 'false').lower()
        force_refresh = refresh_str in ['true', '1', 'yes']

        print(f"[API] Insight request for {portfolio_id} | Benchmark: {benchmark} | Force Refresh: {force_refresh}")
        
        # 1. Fetch data & calculate deterministic metrics with dynamic benchmark & force_refresh
        engine = PortfolioAnalytics(portfolio_id, benchmark=benchmark, force_refresh=force_refresh)
        payload = engine.generate_full_payload()
        
        # 2. Generate the AI Insight Card
        ai_generator = PortfolioInsightGenerator()
        insight_card = ai_generator.generate_insight_card(payload)
        
        # 3. Return payload to frontend
        return jsonify({
            "status": "success",
            "portfolio_id": portfolio_id,
            "benchmark": benchmark,
            "force_refresh": force_refresh,
            "insights": insight_card,
            "analytics": payload
        }), 200

    except Exception as e:
        print(f"[API Error] {e}")
        return jsonify({
            "status": "error", 
            "message": str(e)
        }), 500


@app.route('/api/feedback', methods=['POST'])
def record_feedback():
    try:
        data = request.get_json() or {}
        portfolio_id = data.get("portfolio_id", "PORT-1001")
        rating = data.get("rating", "Helpful")
        model_version = data.get("model_version", "gemini-3.5-flash")
        feedback_text = data.get("feedback_text", "")
        
        # Calculate prompt hash if not supplied
        prompt_hash = data.get("prompt_hash")
        if not prompt_hash:
            prompt_hash = hashlib.sha256(f"{portfolio_id}-{rating}-{model_version}".encode()).hexdigest()[:16]

        conn, db_type = get_db_connection()
        cur = conn.cursor()

        if db_type == "postgres":
            cur.execute("""
                INSERT INTO feedback_audit_logs (portfolio_id, model_version, prompt_hash, rating, feedback_text)
                VALUES (%s, %s, %s, %s, %s)
            """, (portfolio_id, model_version, prompt_hash, rating, feedback_text))
        else:
            cur.execute("""
                INSERT INTO feedback_audit_logs (portfolio_id, model_version, prompt_hash, rating, feedback_text)
                VALUES (?, ?, ?, ?, ?)
            """, (portfolio_id, model_version, prompt_hash, rating, feedback_text))

        conn.commit()
        conn.close()

        print(f"[Audit Log] Recorded rating '{rating}' for {portfolio_id} (Hash: {prompt_hash})")
        return jsonify({
            "status": "recorded",
            "rating": rating,
            "prompt_hash": prompt_hash
        }), 200

    except Exception as e:
        print(f"[Feedback Error] {e}")
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route('/api/market/overview', methods=['GET'])
def get_market_overview():
    try:
        import yfinance as yf
        selected_symbol = request.args.get('symbol', '^NSEI').upper()
        period = request.args.get('period', '1mo').lower()

        # Map display names & default symbols
        INDICES = [
            {"symbol": "^NSEI", "name": "NIFTY 50", "category": "NSE Benchmark"},
            {"symbol": "^BSESN", "name": "BSE SENSEX", "category": "BSE Benchmark"},
            {"symbol": "^NSEBANK", "name": "NIFTY BANK", "category": "Banking Sector"},
            {"symbol": "^CNXIT", "name": "NIFTY IT", "category": "Technology Sector"}
        ]

        # 1. Fetch Summary for Index Cards
        indices_data = []
        fallback_defaults = {
            "^NSEI": {"price": 22485.60, "change": 142.30, "change_pct": 0.64, "high_52w": 23110.00, "low_52w": 19120.00, "day_high": 22530.40, "day_low": 22350.10},
            "^BSESN": {"price": 74120.40, "change": 410.80, "change_pct": 0.56, "high_52w": 75900.00, "low_52w": 62800.00, "day_high": 74280.00, "day_low": 73700.00},
            "^NSEBANK": {"price": 47850.25, "change": -115.40, "change_pct": -0.24, "high_52w": 49250.00, "low_52w": 42100.00, "day_high": 48100.00, "day_low": 47650.00},
            "^CNXIT": {"price": 36940.10, "change": 580.20, "change_pct": 1.60, "high_52w": 39100.00, "low_52w": 28400.00, "day_high": 37120.00, "day_low": 36450.00}
        }

        for idx_info in INDICES:
            sym = idx_info["symbol"]
            idx_res = {
                "symbol": sym,
                "name": idx_info["name"],
                "category": idx_info["category"],
                "price": fallback_defaults[sym]["price"],
                "change": fallback_defaults[sym]["change"],
                "change_pct": fallback_defaults[sym]["change_pct"],
                "high_52w": fallback_defaults[sym]["high_52w"],
                "low_52w": fallback_defaults[sym]["low_52w"],
                "day_high": fallback_defaults[sym]["day_high"],
                "day_low": fallback_defaults[sym]["day_low"]
            }
            
            try:
                t = yf.Ticker(sym)
                info = t.fast_info
                last_price = float(info.last_price or 0.0)
                prev_close = float(info.previous_close or last_price)
                if last_price > 0:
                    chg = last_price - prev_close
                    chg_pct = (chg / prev_close * 100) if prev_close else 0.0
                    idx_res["price"] = round(last_price, 2)
                    idx_res["change"] = round(chg, 2)
                    idx_res["change_pct"] = round(chg_pct, 2)
                    if hasattr(info, 'year_high') and info.year_high:
                        idx_res["high_52w"] = round(info.year_high, 2)
                    if hasattr(info, 'year_low') and info.year_low:
                        idx_res["low_52w"] = round(info.year_low, 2)
                    if hasattr(info, 'day_high') and info.day_high:
                        idx_res["day_high"] = round(info.day_high, 2)
                    if hasattr(info, 'day_low') and info.day_low:
                        idx_res["day_low"] = round(info.day_low, 2)
            except Exception as e:
                print(f"[Market Data Warning] Live fetch failed for {sym}, using fallback: {e}")

            indices_data.append(idx_res)

        # 2. Fetch Candlestick OHLC Series for selected symbol & period
        candles = []
        try:
            target_symbol = selected_symbol if any(i["symbol"] == selected_symbol for i in INDICES) else "^NSEI"
            hist_df = yf.Ticker(target_symbol).history(period=period, interval="1d")
            
            if not hist_df.empty:
                for idx_dt, row in hist_df.iterrows():
                    dt_str = idx_dt.strftime('%Y-%m-%d')
                    op = float(row['Open'])
                    hi = float(row['High'])
                    lo = float(row['Low'])
                    cl = float(row['Close'])
                    vol = int(row['Volume']) if 'Volume' in row and pd.notnull(row['Volume']) else 0
                    
                    if pd.notnull(cl) and cl > 0:
                        candles.append({
                            "date": dt_str,
                            "open": round(op, 2),
                            "high": round(hi, 2),
                            "low": round(lo, 2),
                            "close": round(cl, 2),
                            "volume": vol
                        })
        except Exception as e:
            print(f"[Candle Fetch Error] {e}")

        # Fallback candles generator if yfinance candles fail or empty
        if not candles:
            import datetime
            base_p = fallback_defaults.get(selected_symbol, fallback_defaults["^NSEI"])["price"]
            today = datetime.date.today()
            num_days = 30 if period == '1mo' else (90 if period == '3mo' else (14 if period in ['1d', '1wk'] else 180))
            
            for i in range(num_days, -1, -1):
                d = today - datetime.timedelta(days=i)
                if d.weekday() >= 5: # skip weekends
                    continue
                dt_str = d.strftime('%Y-%m-%d')
                # Generate realistic random walk candle
                import math
                factor = math.sin(i * 0.3) * 150 + (hash(dt_str) % 100 - 45)
                c_close = round(base_p + factor, 2)
                c_open = round(c_close - (hash(dt_str + "op") % 80 - 40), 2)
                c_high = round(max(c_open, c_close) + abs(hash(dt_str + "hi") % 60), 2)
                c_low = round(min(c_open, c_close) - abs(hash(dt_str + "lo") % 60), 2)
                c_vol = int(1000000 + abs(hash(dt_str + "vol") % 3000000))
                candles.append({
                    "date": dt_str,
                    "open": c_open,
                    "high": c_high,
                    "low": c_low,
                    "close": c_close,
                    "volume": c_vol
                })

        # 3. Top Market Movers (Indian Bluechips)
        top_movers = [
            {"symbol": "RELIANCE", "name": "Reliance Industries", "price": 2980.50, "change_pct": 1.85, "type": "gainer", "sector": "Energy"},
            {"symbol": "TCS", "name": "Tata Consultancy Services", "price": 4120.00, "change_pct": 2.40, "type": "gainer", "sector": "Technology"},
            {"symbol": "INFY", "name": "Infosys Ltd", "price": 1640.20, "change_pct": 1.92, "type": "gainer", "sector": "Technology"},
            {"symbol": "HDFCBANK", "name": "HDFC Bank Ltd", "price": 1450.00, "change_pct": -0.65, "type": "loser", "sector": "Financials"},
            {"symbol": "ICICIBANK", "name": "ICICI Bank Ltd", "price": 1085.30, "change_pct": 0.45, "type": "gainer", "sector": "Financials"},
            {"symbol": "TATAMOTORS", "name": "Tata Motors Ltd", "price": 975.80, "change_pct": 3.10, "type": "gainer", "sector": "Automobile"},
            {"symbol": "PAYTM", "name": "One97 Communications", "price": 410.20, "change_pct": -2.15, "type": "loser", "sector": "Fintech"},
            {"symbol": "ITC", "name": "ITC Limited", "price": 435.50, "change_pct": 0.80, "type": "gainer", "sector": "Consumer Goods"}
        ]

        return jsonify({
            "status": "success",
            "indices": indices_data,
            "selected_symbol": selected_symbol,
            "period": period,
            "candles": candles,
            "top_movers": top_movers
        }), 200

    except Exception as e:
        print(f"[Market Overview Error] {e}")
        return jsonify({"status": "error", "message": str(e)}), 500


if __name__ == '__main__':

    print("Starting Zerodha AI Financial Intelligence API on port 5000...")
    app.run(port=5000, debug=True)