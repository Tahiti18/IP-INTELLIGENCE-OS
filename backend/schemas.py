from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, List

class IPAnalyzeRequest(BaseModel):
    cidr: str

class IPAssetBase(BaseModel):
    cidr: str
    ip_version: int
    num_addresses: int
    rir: Optional[str] = None
    asn: Optional[str] = None
    org_name: Optional[str] = None
    country: Optional[str] = None
    deal_score: float
    scoring_explanation: str
    status: str

class IPAssetResponse(IPAssetBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class DashboardStats(BaseModel):
    total_assets: int
    high_value_deals: int
    avg_deal_score: float
    top_rir: Optional[str] = None
