from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List
import logging
import sys

import models
import schemas
from database import engine, get_db, init_db
from services.intelligence import IntelligenceService

# Setup logging to stdout for Railway logs
logging.basicConfig(
    stream=sys.stdout,
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="IP Deal Intelligence OS",
    description="Live IP Analysis Engine",
    version="1.0.0"
)

# Enable CORS for frontend
# In production, you should ideally restrict this to your frontend's domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    logger.info("Starting up IP Intelligence Engine...")
    try:
        await init_db()
        logger.info("Database initialized successfully.")
    except Exception as e:
        logger.error(f"CRITICAL: Database initialization failed: {e}")
        # We don't exit so the health check can at least report status
        pass

@app.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    db_status = "connected"
    try:
        await db.execute(select(1))
    except Exception as e:
        logger.error(f"Health check DB failure: {e}")
        db_status = f"disconnected: {str(e)}"
    
    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "database": db_status,
        "version": "1.0.0"
    }

@app.post("/analyze-ip", response_model=schemas.IPAssetResponse)
async def analyze_ip(request: schemas.IPAnalyzeRequest, db: AsyncSession = Depends(get_db)):
    is_valid, normalized_cidr, version, count = IntelligenceService.validate_and_parse(request.cidr)
    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid IP or CIDR format")

    try:
        existing_query = await db.execute(select(models.IPAsset).where(models.IPAsset.cidr == normalized_cidr))
        existing = existing_query.scalar_one_or_none()
        if existing:
            return existing

        metadata = IntelligenceService.enrich_data(normalized_cidr)
        score, explanation = IntelligenceService.calculate_deal_score(
            version, count, metadata["rir"], metadata["org_name"]
        )

        new_asset = models.IPAsset(
            cidr=normalized_cidr,
            ip_version=version,
            num_addresses=count,
            rir=metadata["rir"],
            asn=metadata["asn"],
            org_name=metadata["org_name"],
            country=metadata["country"],
            deal_score=score,
            scoring_explanation=explanation
        )
        
        db.add(new_asset)
        await db.commit()
        await db.refresh(new_asset)
        return new_asset
    except Exception as e:
        logger.error(f"Error during IP analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/assets", response_model=List[schemas.IPAssetResponse])
async def list_assets(db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(models.IPAsset).order_by(models.IPAsset.deal_score.desc()))
        return result.scalars().all()
    except Exception as e:
        logger.error(f"Error fetching assets: {e}")
        return []

@app.get("/stats", response_model=schemas.DashboardStats)
async def get_stats(db: AsyncSession = Depends(get_db)):
    try:
        total_query = await db.execute(select(func.count(models.IPAsset.id)))
        high_value_query = await db.execute(select(func.count(models.IPAsset.id)).where(models.IPAsset.deal_score >= 80))
        avg_score_query = await db.execute(select(func.avg(models.IPAsset.deal_score)))
        top_rir_query = await db.execute(select(models.IPAsset.rir, func.count(models.IPAsset.id)).group_by(models.IPAsset.rir).order_by(func.count(models.IPAsset.id).desc()).limit(1))

        total = total_query.scalar() or 0
        high_value = high_value_query.scalar() or 0
        avg_score = avg_score_query.scalar() or 0.0
        top_rir_res = top_rir_query.first()
        top_rir = top_rir_res[0] if top_rir_res else None

        return {
            "total_assets": total,
            "high_value_deals": high_value,
            "avg_deal_score": round(float(avg_score), 2),
            "top_rir": top_rir
        }
    except Exception as e:
        logger.error(f"Error fetching stats: {e}")
        return {
            "total_assets": 0,
            "high_value_deals": 0,
            "avg_deal_score": 0.0,
            "top_rir": None
        }
