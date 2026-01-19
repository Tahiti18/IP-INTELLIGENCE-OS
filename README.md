# IP Deal Intelligence OS

IP Deal Intelligence OS is a production-ready platform for detecting, enriching, and scoring IP-related assets (IPv4/IPv6, CIDR blocks) for acquisition and leasing deals.

## Folder Structure
```
.
├── backend
│   ├── Dockerfile          # Production-ready slim container
│   ├── main.py             # FastAPI entrypoint & routes
│   ├── database.py         # Async SQLAlchemy 2.0 configuration
│   ├── models.py           # DB Schema
│   ├── schemas.py          # Pydantic V2 models
│   ├── requirements.txt    # Strict versioned dependencies
│   └── services
│       └── intelligence.py # Scoring Engine & Enrichment Logic
├── frontend
│   ├── index.html          # Shell
│   ├── index.tsx           # Mounting point
│   ├── App.tsx             # Root & Status Handler
│   ├── services
│   │   └── api.ts          # Robust API client with Demo Fallback
│   └── components
│       ├── Dashboard.tsx    # Live/Demo UI orchestrator
│       ├── AssetList.tsx    # Intelligence list with Premium badging
│       └── AnalysisForm.tsx # CIDR ingestion portal
└── README.md
```

## 🚀 Taking the System Live (The "Live Checklist")

If your dashboard shows **"System Operating in Demo Mode"**, it means the Frontend cannot reach a working Backend Engine. Follow these steps on Railway to fix this:

### 1. Provision the Database
- Add a **PostgreSQL** service to your Railway project.

### 2. Deploy the Backend Engine
- Create a new service from your GitHub repo.
- **Root Directory**: In service settings, set this to `/backend`. Railway will automatically find the `Dockerfile` inside.
- **Environment Variables**: 
  - `DATABASE_URL`: Link this to your PostgreSQL service (`${{Postgres.DATABASE_URL}}`).
- **Networking**: Generate a Public Domain (e.g., `https://api-engine.up.railway.app`).

### 3. Configure the Frontend
- Your existing frontend service needs to know where the API is.
- **Environment Variables**:
  - `VITE_API_URL`: Set this to the **Public Domain** of your Backend service created in Step 2.
- **Critical**: You **MUST** redeploy the frontend after setting this variable. Vite embeds environment variables at build time.

### 4. Verification
- Once both are deployed, refresh your dashboard.
- The top-right badge will turn **Emerald Green** and display **LIVE v1.0.0**.
- The system will transition from "Simulated Dataset" to "Production Database".

## Technical Details
- **Scoring Engine**: Evaluates assets based on IP version scarcity (IPv4 premium), block size routing efficiency (/24 aggregation), and RIR transfer complexity.
- **Async Workflow**: Backend uses `asyncpg` for non-blocking DB I/O, supporting high-concurrency analysis tasks.
- **Intelligence Enrichment**: Simulates WHOIS/ASN data ingestion (pluggable with commercial IPAM APIs).

---
*Built for scale. Designed for intelligence.*