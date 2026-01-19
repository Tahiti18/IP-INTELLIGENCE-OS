import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import Dashboard from './components/Dashboard';
import { Globe, Radio, Signal, SignalLow } from 'lucide-react';

const App: React.FC = () => {
  const [health, setHealth] = useState<{ status: string; version: string } | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const data = await api.getHealth();
        setHealth(data);
        setIsDemo(data.version.includes('mock'));
      } catch (err) {
        setHealth(null);
        setIsDemo(true);
      }
    };
    
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200">
                <Globe className="text-white w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight text-slate-800 leading-none">
                  IP Intelligence
                </span>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-0.5">
                  Deal OS
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
                !health ? 'bg-slate-100 text-slate-500' : 
                isDemo ? 'bg-amber-50 text-amber-700 border border-amber-100' : 
                'bg-emerald-50 text-emerald-700 border border-emerald-100'
              }`}>
                {isDemo ? <SignalLow className="w-3.5 h-3.5" /> : <Signal className="w-3.5 h-3.5 animate-pulse" />}
                <span className="uppercase tracking-wide">
                  {!health ? 'Offline' : isDemo ? 'Demo Mode' : `Live v${health.version}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <Dashboard />
      </main>

      <footer className="border-t border-slate-200 bg-white py-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-slate-400 text-sm font-medium">
            &copy; {new Date().getFullYear()} IP Deal Intelligence OS
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest">Documentation</a>
            <a href="#" className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest">API Status</a>
            <a href="#" className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;