/**
 * IP Deal Intelligence OS - API Service
 * Handles communication with the FastAPI backend with robust fallback logic.
 */

const getBaseUrl = (): string => {
  // 1. LocalStorage Manual override (highest priority for debugging)
  if (typeof window !== 'undefined') {
    const override = localStorage.getItem('API_BASE_URL');
    if (override) return override;
  }

  // 2. Production Environment Variables
  // Note: import.meta.env is specifically for Vite environments
  const env: any = (window as any).process?.env || {};
  let viteEnv: any = {};
  try {
    // @ts-ignore
    viteEnv = import.meta.env || {};
  } catch (e) {}

  const candidate = 
    viteEnv.VITE_API_URL || 
    viteEnv.VITE_API_BASE_URL ||
    env.NEXT_PUBLIC_API_BASE_URL || 
    env.ENGINE_GATEWAY_URL || 
    env.API_URL;

  if (candidate) return candidate;

  // 3. Local Development Default
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:8080';
  }

  // 4. Fallback (assumes same origin, which is rarely true on Railway for separate services)
  return typeof window !== 'undefined' ? window.location.origin : '';
};

const BASE_URL = getBaseUrl().replace(/\/$/, '');

// Mock data used ONLY if the health check fails or returns 'mock' version
const MOCK_ASSETS = [
  {
    id: 1,
    cidr: "104.16.0.0/12",
    ip_version: 4,
    num_addresses: 1048576,
    rir: "ARIN",
    asn: "AS13335",
    org_name: "Cloudflare, Inc.",
    country: "US",
    deal_score: 92.5,
    scoring_explanation: "Protocol Intelligence: Identified as IPv4. High market desirability due to absolute exhaustion of the IANA free pool. Scale Assessment: This is a major IPv4 allocation. Registry Intelligence: Registered via ARIN. Asset appears to be a 'Legacy' allocation.",
    status: "Active",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    isMock: true
  },
  {
    id: 2,
    cidr: "2a00:1450:4000::/37",
    ip_version: 6,
    num_addresses: 2147483648,
    rir: "RIPE",
    asn: "AS15169",
    org_name: "Google LLC",
    country: "IE",
    deal_score: 45.0,
    scoring_explanation: "Protocol Intelligence: Identified as IPv6. While IPv6 represents the future, its immediate secondary market trade value is currently lower than IPv4. Scale Assessment: Standard IPv6 unit (/24) detected.",
    status: "Active",
    created_at: new Date().toISOString(),
    isMock: true
  }
];

export const api = {
  async fetchWithFallback<T>(path: string, options?: RequestInit, mockData?: T): Promise<T> {
    const url = `${BASE_URL}${path}`;
    const controller = new AbortController();
    const timeout = path === '/health' ? 2000 : 15000;
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          ...(options?.headers || {})
        }
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (mockData !== undefined) {
        console.info(`[API] Engine Unreachable. Falling back to simulated data for ${path}`);
        return mockData;
      }
      
      throw error;
    }
  },

  getHealth: () => api.fetchWithFallback<{ status: string; version: string }>('/health', {}, { status: "demo", version: "1.0.0-mock" }),
  
  getAssets: () => api.fetchWithFallback<any[]>('/assets', {}, MOCK_ASSETS),
  
  getStats: () => api.fetchWithFallback<any>('/stats', {}, {
    total_assets: MOCK_ASSETS.length,
    high_value_deals: MOCK_ASSETS.filter(a => a.deal_score >= 80).length,
    avg_deal_score: 68.8,
    top_rir: "ARIN"
  }),
  
  analyzeIP: (cidr: string) => api.fetchWithFallback<any>('/analyze-ip', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cidr }),
  }),
};
