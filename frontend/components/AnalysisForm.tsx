import React, { useState } from 'react';
import { api } from '../services/api';
import { Search, Loader2, AlertCircle } from 'lucide-react';

interface AnalysisFormProps {
  onComplete: () => void;
}

const AnalysisForm: React.FC<AnalysisFormProps> = ({ onComplete }) => {
  const [cidr, setCidr] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cidr) return;

    setIsLoading(true);
    setError(null);

    try {
      await api.analyzeIP(cidr);
      setCidr('');
      onComplete();
    } catch (err: any) {
      setError(err.message || 'Failed to analyze CIDR');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-24">
      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        <Search className="w-5 h-5 text-indigo-600" />
        New Intelligence Inquiry
      </h3>
      <p className="text-sm text-slate-500 mb-6">
        Enter an IPv4/IPv6 address or CIDR block to trigger enrichment and deal scoring.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
            Target CIDR / Range
          </label>
          <input
            type="text"
            value={cidr}
            onChange={(e) => setCidr(e.target.value)}
            placeholder="e.g., 1.1.1.0/24"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-slate-700"
            disabled={isLoading}
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg flex items-center gap-2 border border-red-100">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !cidr}
          className="w-full bg-indigo-600 text-white font-semibold py-3 px-4 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            'Analyze Asset'
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-slate-100">
        <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Scoring Engine V1</h4>
        <ul className="space-y-2">
          {['Block Age & Scarcity', 'RIR Reputation', 'Historical Ownership', 'IP Connectivity Map'].map((item) => (
            <li key={item} className="flex items-center gap-2 text-xs text-slate-500">
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AnalysisForm;
