from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List
import logging

import models
import schemas
from database import engine, get_db, init_db
from services.intelligence import IntelligenceService

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="IP Deal Intelligence OS")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    try:
        await init_db()
        logger.info("Database initialized successfully.")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        logger.warning("Application starting without functional database. Some endpoints will fail.")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}

@app.post("/analyze-ip", response_model=schemas.IPAssetResponse)
async def analyze_ip(request: schemas.IPAnalyzeRequest, db: AsyncSession = Depends(get_db)):
    # 1. Validate
    is_valid, normalized_cidr, version, count = IntelligenceService.validate_and_parse(request.cidr)
    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid IP or CIDR format")

    try:
        # 2. Check if already exists
        existing_query = await db.execute(select(models.IPAsset).where(models.IPAsset.cidr == normalized_cidr))
        existing = existing_query.scalar_one_or_none()
        if existing:
            return existing

        # 3. Enrich & Score
        metadata = IntelligenceService.enrich_data(normalized_cidr)
        score, explanation = IntelligenceService.calculate_deal_score(
            version, count, metadata["rir"], metadata["org_name"]
        )

        # 4. Save
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
        logger.error(f"Database error during analysis: {e}")
        raise HTTPException(status_code=503, detail="Database service unavailable")

@app.get("/assets", response_model=List[schemas.IPAssetResponse])
async def list_assets(db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(models.IPAsset).order_by(models.IPAsset.deal_score.desc()))
        return result.scalars().all()
    except Exception as e:
        logger.error(f"Database error listing assets: {e}")
        return [] # Return empty list if DB is down

@app.get("/assets/{asset_id}", response_model=schemas.IPAssetResponse)
async def get_asset(asset_id: int, db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(models.IPAsset).where(models.IPAsset.id == asset_id))
        asset = result.scalar_one_or_none()
        if not asset:
            raise HTTPException(status_code=404, detail="Asset not found")
        return asset
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Database error getting asset: {e}")
        raise HTTPException(status_code=503, detail="Database service unavailable")

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
        logger.error(f"Database error getting stats: {e}")
        return {
            "total_assets": 0,
            "high_value_deals": 0,
            "avg_deal_score": 0.0,
            "top_rir": None
        }
