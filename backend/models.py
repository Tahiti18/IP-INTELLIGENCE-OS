from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from sqlalchemy.sql import func
from database import Base

class IPAsset(Base):
    __tablename__ = "ip_assets"

    id = Column(Integer, primary_key=True, index=True)
    cidr = Column(String, unique=True, index=True, nullable=False)
    ip_version = Column(Integer, nullable=False)
    num_addresses = Column(Integer, nullable=False)
    rir = Column(String)  # ARIN, RIPE, etc.
    asn = Column(String)
    org_name = Column(String)
    country = Column(String)
    deal_score = Column(Float)
    scoring_explanation = Column(Text)
    status = Column(String, default="Active")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_enriched = Column(DateTime(timezone=True), onupdate=func.now())
