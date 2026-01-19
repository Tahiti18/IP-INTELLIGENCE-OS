import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import AnalysisForm from './AnalysisForm';
import AssetList from './AssetList';
import { TrendingUp, FileText, Award, Layers, AlertTriangle, Zap, CheckCircle2, ServerOff } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [assets, setAssets] = useState<any[]>([]);
  const [health, setHealth] = useState<any>(null);
  const [refreshToggle, setRefreshToggle] = useState(0);

  const fetchData = async () => {
    try {
      const [statsData, assetsData, healthData] = await Promise.all([
        api.getStats(),
        api.getAssets(),
        api.getHealth()
      ]);
      setStats(statsData);
      setAssets(assetsData);
      setHealth(healthData);
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshToggle]);

  const onAnalyzeComplete = () => {
    setRefreshToggle(prev => prev + 1);
  };

  const isDemoMode = health?.version?.includes('mock') || !health;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* System Status Banner */}
      {isDemoMode && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-full">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900">System Operating in Demo Mode</h4>
              <p className="text-xs text-amber-700">The backend engine is currently unreachable. You are viewing simulated IP intelligence data.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
            >
              Retry Connection
            </button>
            <a 
              href="https://railway.app/new" 
              target="_blank" 
              className="px-4 py-2 bg-white border border-amber-200 text-amber-700 text-xs font-bold rounded-xl hover:bg-amber-100 transition-colors"
            >
              Deploy Live Engine
            </a>
          </div>
        </div>
      )}

      {!isDemoMode && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-full">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-emerald-900">Live Engine Connected</h4>
              <p className="text-xs text-emerald-700 text-opacity-80">Real-time enrichment and PostgreSQL persistence active. v{health.version}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-emerald-600">
            <Zap className="w-4 h-4 animate-bounce" />
            <span className="text-[10px] font-black uppercase tracking-widest">High Performance</span>
          </div>
        </div>
      )}

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Assets" 
          value={stats?.total_assets ?? 0} 
          icon={<Layers className="w-5 h-5 text-indigo-600" />}
          subtext={isDemoMode ? "Simulated Dataset" : "Production Database"}
        />
        <StatCard 
          label="Avg Deal Score" 
          value={`${stats?.avg_deal_score ?? 0}%`} 
          icon={<Award className="w-5 h-5 text-amber-600" />}
          subtext="Portfolio strength"
        />
        <StatCard 
          label="High Value Deals" 
          value={stats?.high_value_deals ?? 0} 
          icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
          subtext="Score > 80"
        />
        <StatCard 
          label="Top Region" 
          value={stats?.top_rir || 'N/A'} 
          icon={<FileText className="w-5 h-5 text-blue-600" />}
          subtext="Active RIR"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form */}
        <div className="lg:col-span-1">
          <AnalysisForm onComplete={onAnalyzeComplete} />
        </div>

        {/* Right Column: List */}
        <div className="lg:col-span-2">
          <AssetList assets={assets} />
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string | number; icon: React.ReactNode; subtext?: string }> = ({ label, value, icon, subtext }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
    <div className="flex items-center justify-between mb-4">
      <div className="p-2 bg-slate-50 rounded-lg">{icon}</div>
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
    </div>
    <div className="text-3xl font-bold text-slate-800">{value}</div>
    {subtext && <div className="text-xs text-slate-500 mt-1">{subtext}</div>}
  </div>
);

export default Dashboard;
