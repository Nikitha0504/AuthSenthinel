# AuthSentinel

> **Developer Authentication Debugging & Monitoring Platform**

AuthSentinel is a comprehensive, full-stack monitoring platform designed to ingest, analyze, and visualize authentication events in real-time. It transforms raw JWT metadata and logging structures into human-readable diagnostics to surface failure patterns and trigger intelligent alerts.

## 🌟 Key Features

- **Log Ingestion Engine:** REST API built with Node.js and Express to accept incoming auth logs system-wide.
- **Smart Error Analyzer:** A robust mapping engine that translates vague exception logs (`TOKEN_INVALID`) into distinct root causes and developer suggestions.
- **Rules-Based Alerting:** Sliding-window anomaly detection tracking Brute Force clusters, Token Floods, and Lockout Spikes.
- **Live Feed Dashboard:** Glassmorphic React/Vite interface connected via real-time `Socket.io` websockets that actively updates graphs and statistical cards instantly upon failure events.
- **JWT Inspector:** A localized, standalone token decoder designed to safely unpack JSON Web Tokens securely away from third-party networks.

## 🛠 Technology Stack

**Frontend:**
* React (Vite)
* Axios (Interceptors configured for automatic JWT refresh)
* Socket.io-client (Real-time architecture)
* Vanilla CSS (Glassmorphism design schema)
* Lucide-React (Iconography)

**Backend:**
* Node.js / Express
* MongoDB (Mongoose ORM + mongoose-memory-server)
* Socket.io (WebSocket streaming)
* JsonWebToken & Bcrypt (Security / hashing)

## 🚀 Getting Started Locally

Because the backend connects automatically to an in-memory database fallback to maximize portability, you do not need MongoDB manually installed on your machine to test the platform safely!

### 1. Boot up the Storage & API Layer
Open a terminal inside the project backend:
```bash
cd AuthSentinel/backend
npm install
npm run dev
```
*(The backend will auto-seed 200+ dummy events dynamically, initializing a demonstration brute-force attack alert instantly)*

### 2. Boot up the Dashboard
Open a secondary terminal:
```bash
cd AuthSentinel/frontend
npm install
npm run dev
```
Navigate to `http://localhost:5173/` in your browser.

**Default Administrator Sign In:**
* **Email:** `admin@authsentinel.local`
* **Password:** `password123`

## 🧠 System Architecture

- **`app.js`**: Initiates the API and bounds exactly to `socket.io` to mirror ingested logs up immediately.
- **`alertEngine.js`**: Replicates professional threat operations algorithms scanning aggregations to flag potential anomalies dynamically.
- **`AuthContext.jsx`**: Preserves instantaneous developer sessions utilizing Dual-Token (Access/Refresh) architecture seamlessly to avoid logging operators out natively if sessions expire passively.

---
*Built tightly adhering to elite Okta/Auth0 development philosophies simulating realistic Product Requirement protocols.*
