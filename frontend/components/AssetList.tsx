import React, { useState, useMemo } from 'react';
import { Database, Info, ExternalLink, ShieldCheck, Zap, Search, Filter, X, Crown, Star, EyeOff } from 'lucide-react';

interface AssetListProps {
  assets: any[];
}

type SortOption = 'score_desc' | 'score_asc' | 'date_desc' | 'date_asc' | 'v4_first' | 'v6_first';

const AssetList: React.FC<AssetListProps> = ({ assets }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('score_desc');

  // Filter and Sort Logic
  const processedAssets = useMemo(() => {
    let result = [...assets];

    // 1. Search Filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(asset => 
        asset.cidr.toLowerCase().includes(lowerSearch) || 
        (asset.org_name && asset.org_name.toLowerCase().includes(lowerSearch)) ||
        (asset.country && asset.country.toLowerCase().includes(lowerSearch)) ||
        (asset.rir && asset.rir.toLowerCase().includes(lowerSearch))
      );
    }

    // 2. Sorting
    result.sort((a, b) => {
      switch (sortOption) {
        case 'score_desc':
          return b.deal_score - a.deal_score;
        case 'score_asc':
          return a.deal_score - b.deal_score;
        case 'date_desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'date_asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'v4_first':
          return a.ip_version - b.ip_version;
        case 'v6_first':
          return b.ip_version - a.ip_version;
        default:
          return 0;
      }
    });

    return result;
  }, [assets, searchTerm, sortOption]);

  if (assets.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-20 flex flex-col items-center justify-center text-center">
        <div className="p-4 bg-slate-50 rounded-full mb-4">
          <Database className="w-10 h-10 text-slate-300" />
        </div>
        <h3 className="text-lg font-semibold text-slate-600">No Assets Analyzed</h3>
        <p className="text-slate-400 text-sm max-w-xs mt-2">
          Start by entering a CIDR block in the panel to populate your intelligence dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-bold text-slate-800">
            Monitored Assets <span className="text-slate-400 font-normal ml-1">({processedAssets.length})</span>
          </h3>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Box */}
          <div className="relative group flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Filter by CIDR, Org, or RIR..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X className="w-3 h-3 text-slate-500" />
              </button>
            )}
          </div>

          {/* Sort Selection */}
          <div className="relative flex items-center gap-2">
            <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl">
              <Filter className="w-4 h-4 text-slate-400" />
            </div>
            <select 
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="bg-slate-50 border border-slate-200 text-sm font-medium text-slate-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all cursor-pointer appearance-none pr-8"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem' }}
            >
              <option value="score_desc">Score: High to Low</option>
              <option value="score_asc">Score: Low to High</option>
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="v4_first">IPv4 First</option>
              <option value="v6_first">IPv6 First</option>
            </select>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {processedAssets.map((asset) => (
          <AssetItem key={asset.id} asset={asset} />
        ))}
      </div>
    </div>
  );
};

const AssetItem: React.FC<{ asset: any }> = ({ asset }) => {
  const isPremium = asset.deal_score >= 80;
  const isExceptional = asset.deal_score >= 95;
  const isMock = asset.isMock === true;
  
  const scoreColor = isPremium ? 'text-indigo-600' : 
                     asset.deal_score >= 50 ? 'text-amber-600' : 'text-slate-500';
  
  const scoreBg = isPremium ? 'bg-indigo-50' : 
                   asset.deal_score >= 50 ? 'bg-amber-50' : 'bg-slate-100';

  return (
    <div className={`bg-white rounded-2xl border transition-all group relative overflow-hidden ${
      isPremium 
        ? 'border-indigo-200 shadow-lg shadow-indigo-100/50 ring-1 ring-indigo-50/50' 
        : 'border-slate-200 shadow-sm'
    } hover:border-indigo-400`}>
      {/* Premium Accent Bar & Glow */}
      {isPremium && (
        <>
          <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-indigo-500 via-violet-500 to-indigo-600 z-10" />
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full" />
        </>
      )}

      {/* Mock Badge */}
      {isMock && (
        <div className="absolute top-0 right-0 px-2 py-1 bg-slate-100 text-slate-400 text-[9px] font-black uppercase tracking-widest flex items-center gap-1 rounded-bl-xl border-l border-b border-slate-200 z-20">
          <EyeOff className="w-2.5 h-2.5" />
          Simulated Data
        </div>
      )}
      
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-1.5">
              <span className="text-lg font-mono font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                {asset.cidr}
              </span>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-bold uppercase border border-slate-200">
                IPv{asset.ip_version}
              </span>
              
              {/* Premium Badge Indicators */}
              {isPremium && (
                <div className="flex items-center gap-1.5">
                  <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase shadow-sm ${
                    isExceptional 
                      ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white' 
                      : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white'
                  }`}>
                    {isExceptional ? <Star className="w-3 h-3 fill-current" /> : <Crown className="w-3 h-3 fill-current" />}
                    {isExceptional ? 'Exceptional' : 'Premium Deal'}
                  </span>
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
              <span className="flex items-center gap-1"><GlobeIcon className="w-3 h-3" /> {asset.country}</span>
              <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> {asset.rir}</span>
              <span className="flex items-center gap-1 font-medium text-slate-700">{asset.org_name}</span>
              <span className="text-xs text-slate-400">({asset.num_addresses.toLocaleString()} IPs)</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Deal Score</div>
              <div className={`text-2xl font-black ${scoreColor} tabular-nums`}>
                {Math.round(asset.deal_score)}<span className="text-sm font-normal">%</span>
              </div>
            </div>
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${scoreBg} transition-all duration-300 group-hover:scale-105 shadow-inner border border-white/50`}>
                <div className={`w-10 h-10 rounded-full border-4 border-white flex items-center justify-center relative shadow-sm`}>
                    <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 40 40">
                        <circle
                            cx="20" cy="20" r="16"
                            fill="transparent"
                            stroke="currentColor"
                            strokeWidth="4"
                            className="text-slate-200/50"
                        />
                        <circle
                            cx="20" cy="20" r="16"
                            fill="transparent"
                            stroke="currentColor"
                            strokeWidth="4"
                            strokeDasharray={`${(asset.deal_score / 100) * 100.5} 100.5`}
                            className={`${scoreColor} transition-all duration-700 ease-out`}
                        />
                    </svg>
                    {isPremium ? (
                      <Zap className={`w-4 h-4 ${scoreColor} ${isExceptional ? 'animate-pulse' : ''}`} />
                    ) : (
                      <span className={`text-[10px] font-bold ${scoreColor}`}>
                        {Math.round(asset.deal_score)}
                      </span>
                    )}
                </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-50 flex flex-col md:flex-row justify-between gap-4">
          <div className="text-xs text-slate-500 italic max-w-xl flex gap-2 leading-relaxed">
            <Info className="w-4 h-4 text-slate-300 flex-shrink-0 mt-0.5" />
            <span className="line-clamp-2 md:line-clamp-none">
              {asset.scoring_explanation}
            </span>
          </div>
          <div className="flex items-end">
            <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 whitespace-nowrap px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-all active:scale-95">
              View Deep Intelligence <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const GlobeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2h1.5a3.5 3.5 0 013.5 3.5V19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-2a2 2 0 00-2-2h-2a2 2 0 00-2 2v0a2 2 0 012 2v1m18-13a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);

export default AssetList;
