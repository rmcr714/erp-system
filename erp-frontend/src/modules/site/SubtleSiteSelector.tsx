import React, { useState, useRef, useEffect } from 'react';
import type { Site } from './types';

import { getSiteTheme } from './siteTheme';

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

  const selectedTheme = getSiteTheme(selectedSiteId);

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
          className={`flex items-center gap-4 px-5 py-2.5 rounded-full border transition-all duration-500 shadow-2xl backdrop-blur-xl ${
            isOpen 
              ? 'border-white/30 bg-slate-800/90 ring-4 ring-white/5' 
              : 'border-white/10 bg-slate-900/60 hover:border-white/30 hover:bg-slate-800/80 hover:scale-[1.02] active:scale-[0.98]'
          }`}
          style={isOpen && selectedTheme ? { borderColor: `${selectedTheme.main}40` } : {}}
        >
          <div className="flex items-center gap-3">
            <div 
              className={`h-2 w-2 rounded-full transition-all duration-300 ${selectedSite ? '' : 'bg-slate-500'}`}
              style={selectedSite && selectedTheme ? { 
                backgroundColor: selectedTheme.main
              } : {}}
            ></div>
            <span className="text-[10px] text-slate-400 font-bold tracking-[0.15em] uppercase opacity-70">Site</span>
            <span className="text-[13px] font-bold text-white">
              {selectedSite?.name || 'Select Project'}
            </span>
          </div>
          
          <div className="flex items-center gap-2.5 pl-4 border-l border-white/10 ml-1">
            {selectedSite && selectedTheme && (
              <span 
                className={`text-[11px] font-mono font-black tracking-wider px-2 py-0.5 rounded bg-white/5 border border-white/10 ${selectedTheme.text}`}
              >
                {selectedSite.siteCode}
              </span>
            )}
            <svg 
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-500 ease-out ${isOpen ? 'rotate-180' : ''}`} 
              style={isOpen && selectedTheme ? { color: selectedTheme.main } : {}}
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
          <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 w-64 bg-slate-900/95 backdrop-blur-3xl border border-white/10 rounded-[24px] shadow-[0_25px_50px_rgba(0,0,0,0.6)] overflow-hidden animate-in fade-in zoom-in duration-300 origin-top">
            <div className="p-2.5">
              <div className="px-3 py-2 mb-1 flex items-center justify-between border-b border-white/5">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Active Sites</span>
                <span className="text-[9px] font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded-full">{activeSites.length} Projects</span>
              </div>
              
              <div className="max-h-[320px] overflow-y-auto custom-scrollbar pr-1 mt-1">
                {activeSites.length === 0 ? (
                  <div className="px-3 py-8 text-center">
                    <p className="text-slate-500 text-xs italic">No active sites found</p>
                  </div>
                ) : (
                  <div className="grid gap-1.5">
                    {activeSites.map(site => {
                      const theme = getSiteTheme(site.id);
                      const isSelected = site.id === selectedSiteId;
                      
                      return (
                        <button
                          key={site.id}
                          onClick={() => {
                            onSelect(site.id);
                            setIsOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3.5 py-3 rounded-[16px] transition-all duration-300 group relative ${
                            isSelected 
                              ? 'bg-white/5' 
                              : 'hover:bg-white/[0.04]'
                          }`}
                          style={isSelected && theme ? { border: `1px solid ${theme.main}30`, backgroundColor: `${theme.main}08` } : {}}
                        >
                          <div className="flex flex-col items-start gap-1 z-10">
                            <span className={`text-sm font-bold tracking-tight transition-colors ${isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                              {site.name}
                            </span>
                            <span className="text-[10px] font-medium text-slate-500 line-clamp-1 max-w-[130px] group-hover:text-slate-400 transition-colors">
                              {site.address || 'No address provided'}
                            </span>
                          </div>
                          
                          <div className="flex flex-col items-end gap-1.5 z-10">
                            {theme && (
                              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border transition-all duration-500 ${
                                isSelected 
                                  ? `${theme.text} ${theme.bg} ${theme.border}` 
                                  : 'border-white/10 bg-white/5 text-slate-500 group-hover:border-white/20 group-hover:text-slate-300'
                              }`}>
                                {site.siteCode}
                              </span>
                            )}
                            {isSelected && theme && (
                              <div className="h-1 w-1 rounded-full" style={{ backgroundColor: theme.main }}></div>
                            )}
                          </div>
                        </button>
                      );
                    })}
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


