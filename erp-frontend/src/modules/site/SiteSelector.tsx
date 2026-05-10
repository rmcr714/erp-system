import React, { useState } from 'react';
import { siteService } from './siteService';
import type { Site } from './types';
import toast from 'react-hot-toast';

interface SiteSelectorProps {
  sites: Site[];
  selectedSiteId: number | null;
  onSelect: (siteId: number) => void;
  onSiteAdded: (site: Site) => void;
}

const SiteSelector: React.FC<SiteSelectorProps> = ({ sites, selectedSiteId, onSelect, onSiteAdded }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [siteCode, setSiteCode] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAddSite = async () => {
    if (!siteCode.trim() || !name.trim()) {
      toast.error('Site code and name are required');
      return;
    }

    setSaving(true);
    try {
      const site = await siteService.addSite({ siteCode, name, address, active: true });
      onSiteAdded(site);
      onSelect(site.id);
      setSiteCode('');
      setName('');
      setAddress('');
      setIsAdding(false);
      toast.success('Site added');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add site');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[60] flex items-start gap-2">
      <div className="rounded-xl border border-white/10 bg-slate-950/90 backdrop-blur-xl p-2 shadow-2xl">
        <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold px-1 mb-1">
          Active Site
        </label>
        <select
          value={selectedSiteId ?? ''}
          onChange={(event) => onSelect(Number(event.target.value))}
          className="min-w-[220px] bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm font-bold text-white outline-none [&_option]:bg-slate-900"
        >
          <option value="" disabled>Select site</option>
          {sites.filter(site => site.active).map(site => (
            <option key={site.id} value={site.id}>
              {site.name}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={() => setIsAdding(prev => !prev)}
        className="h-[62px] px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-bold shadow-lg transition-colors"
      >
        + Site
      </button>

      {isAdding && (
        <div className="absolute top-[72px] right-0 w-[320px] rounded-xl border border-white/10 bg-slate-950 p-4 shadow-2xl space-y-3">
          <input
            value={siteCode}
            onChange={(event) => setSiteCode(event.target.value)}
            placeholder="Site code"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-sky-500"
          />
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Site name"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-sky-500"
          />
          <textarea
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            placeholder="Address"
            className="w-full min-h-20 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-sky-500"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsAdding(false)}
              className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-bold"
            >
              Cancel
            </button>
            <button
              onClick={handleAddSite}
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-sm font-bold"
            >
              {saving ? 'Saving...' : 'Save Site'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SiteSelector;
