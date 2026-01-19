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

## Taking the System Live (Step-by-Step)

By default, the frontend runs in **Demo Mode** using mock data if it cannot find the backend. Follow these steps to achieve a **Live Engine** state:

### 1. Provision Infrastructure (Railway)
- **Database**: Add a "PostgreSQL" service to your project.
- **Backend**:
  - Point the source to the `/backend` directory.
  - Railway will use the provided `Dockerfile` automatically.
  - **Critical Environment Variable**: `DATABASE_URL`. Ensure it uses `postgresql+asyncpg://` as the prefix.
- **Frontend**:
  - Point the source to the root (Vite/React).
  - **Environment Variable**: `VITE_API_URL` set to your Backend service's public URL.

### 2. Verify Connection
- Once deployed, open the Frontend dashboard.
- The top navigation should show a pulsing **Live** indicator.
- The dashboard will show an emerald-green banner confirming the engine is connected to the PostgreSQL database.

## Technical Details
- **Scoring Engine**: Evaluates assets based on IP version scarcity (IPv4 premium), block size routing efficiency (/24 aggregation), and RIR transfer complexity.
- **Async Workflow**: Backend uses `asyncpg` for non-blocking DB I/O, supporting high-concurrency analysis tasks.
- **Intelligence Enrichment**: Simulates WHOIS/ASN data ingestion (pluggable with commercial IPAM APIs).

## Troubleshooting "Demo Mode"
If the system stays in Demo Mode despite a backend deployment:
1. Check the Browser Console for "Failed to fetch" errors.
2. Verify the Backend Service has a Public Networking domain enabled.
3. Ensure `VITE_API_URL` on the frontend does **not** have a trailing slash.
4. Confirm the Backend logs show "Database initialized successfully".

---
*Built for scale. Designed for intelligence.*
