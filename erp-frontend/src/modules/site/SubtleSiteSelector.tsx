import React, { useState, useRef, useEffect } from 'react';
import type { Site } from './types';

interface SubtleSiteSelectorProps {
  sites: Site[];
  selectedSiteId: number | null;
  onSelect: (siteId: number) => void;
}

const SubtleSiteSelector: React.FC<SubtleSiteSelectorProps> = ({ sites, selectedSiteId, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const activeSites = sites.filter(site => site.active);
  const selectedSite = activeSites.find(site => site.id === selectedSiteId);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[60]" ref={dropdownRef}>
      <div className="relative">
        {/* Trigger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-4 px-5 py-2.5 rounded-full border transition-all duration-300 shadow-2xl backdrop-blur-xl ${
            isOpen 
              ? 'border-sky-400/50 bg-slate-800/90 ring-4 ring-sky-400/10' 
              : 'border-white/10 bg-slate-900/60 hover:border-white/30 hover:bg-slate-800/80 hover:scale-[1.02] active:scale-[0.98]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`h-2 w-2 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(0,0,0,0.4)] ${selectedSite ? 'bg-emerald-400 animate-pulse ring-2 ring-emerald-400/20' : 'bg-slate-500'}`}></div>
            <span className="text-[10px] text-slate-400 font-bold tracking-[0.15em] uppercase opacity-70">Site</span>
            <span className="text-[13px] font-bold text-white">
              {selectedSite?.name || 'Select Project'}
            </span>
          </div>
          
          <div className="flex items-center gap-2.5 pl-4 border-l border-white/10 ml-1">
            {selectedSite && (
              <span className="text-[11px] font-mono text-sky-300 font-black tracking-wider">
                {selectedSite.siteCode}
              </span>
            )}
            <svg 
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-500 ease-out ${isOpen ? 'rotate-180 text-sky-400' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-64 bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in zoom-in duration-300 origin-top">
            <div className="p-2">
              <div className="px-3 py-1.5 mb-1 flex items-center justify-between">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Active Sites</span>
                <span className="text-[9px] font-bold text-slate-600 bg-slate-800/50 px-1.5 py-0.5 rounded-md">{activeSites.length}</span>
              </div>
              
              <div className="max-h-[280px] overflow-y-auto custom-scrollbar pr-1">
                {activeSites.length === 0 ? (
                  <div className="px-3 py-6 text-center">
                    <p className="text-slate-500 text-xs italic">No active sites found</p>
                  </div>
                ) : (
                  <div className="grid gap-1">
                    {activeSites.map(site => (
                      <button
                        key={site.id}
                        onClick={() => {
                          onSelect(site.id);
                          setIsOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                          site.id === selectedSiteId 
                            ? 'bg-sky-500/15 text-sky-300 ring-1 ring-sky-500/30' 
                            : 'text-slate-300 hover:bg-white/[0.04] hover:text-white'
                        }`}
                      >
                        <div className="flex flex-col items-start gap-0.5 z-10">
                          <span className="text-xs font-bold tracking-tight">{site.name}</span>
                          <span className="text-[9px] font-medium text-slate-500 line-clamp-1 max-w-[120px] group-hover:text-slate-400 transition-colors">
                            {site.address || 'No address'}
                          </span>
                        </div>
                        
                        <div className="flex flex-col items-end gap-1 z-10">
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border transition-all ${
                             site.id === selectedSiteId 
                              ? 'border-sky-400/40 bg-sky-400/20 text-sky-300' 
                              : 'border-white/10 bg-white/5 text-slate-400 group-hover:border-white/20 group-hover:text-slate-200'
                          }`}>
                            {site.siteCode}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubtleSiteSelector;


