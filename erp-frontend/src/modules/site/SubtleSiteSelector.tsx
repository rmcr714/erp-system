import React from 'react';
import type { Site } from './types';

interface SubtleSiteSelectorProps {
  sites: Site[];
  selectedSiteId: number | null;
  onSelect: (siteId: number) => void;
}

const SubtleSiteSelector: React.FC<SubtleSiteSelectorProps> = ({ sites, selectedSiteId, onSelect }) => {
  const activeSites = sites.filter(site => site.active);
  const selectedSite = activeSites.find(site => site.id === selectedSiteId);

  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[60]">
      <div className="group relative">
        <div className="flex items-center gap-3 px-5 py-3 rounded-full border border-white/20 bg-gradient-to-r from-slate-900/80 to-slate-800/80 backdrop-blur-md shadow-2xl hover:shadow-xl hover:border-sky-400/40 transition-all duration-300 cursor-pointer">
          <div className="flex items-center gap-3 flex-1">
            <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-xs text-slate-300 font-semibold tracking-wider uppercase">Site</span>
            <select
              value={selectedSiteId ?? ''}
              onChange={(event) => onSelect(Number(event.target.value))}
              className="bg-transparent text-sm font-bold text-white outline-none border-none cursor-pointer hover:text-sky-300 transition-colors"
            >
              <option value="" disabled className="bg-slate-900">Select site</option>
              {activeSites.map(site => (
                <option key={site.id} value={site.id} className="bg-slate-900 text-white">
                  {site.name}
                </option>
              ))}
            </select>
          </div>
          {selectedSite && (
            <div className="flex items-center gap-2 pl-3 border-l border-white/15 group-hover:border-sky-400/30 transition-colors">
              <span className="text-xs font-mono text-sky-300 font-bold tracking-wide">
                {selectedSite.siteCode}
              </span>
              <div className="h-1.5 w-1.5 rounded-full bg-sky-400 group-hover:bg-sky-300 transition-colors"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubtleSiteSelector;