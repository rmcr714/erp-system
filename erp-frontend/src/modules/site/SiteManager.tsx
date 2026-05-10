import React, { useState } from 'react';
import { siteService } from './siteService';
import type { Site, SiteRequest } from './types';
import toast from 'react-hot-toast';

interface SiteManagerProps {
  sites: Site[];
  selectedSiteId: number | null;
  onSelect: (siteId: number) => void;
  onSitesChange: (sites: Site[]) => void;
}

const SiteManager: React.FC<SiteManagerProps> = ({ sites, selectedSiteId, onSelect, onSitesChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [siteCode, setSiteCode] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setSiteCode('');
    setName('');
    setAddress('');
    setIsAdding(false);
    setEditingId(null);
  };

  const handleAddSite = async () => {
    if (!siteCode.trim() || !name.trim()) {
      toast.error('Site code and name are required');
      return;
    }

    setSaving(true);
    try {
      const site = await siteService.addSite({ siteCode, name, address, active: true });
      onSitesChange([...sites, site]);
      onSelect(site.id);
      resetForm();
      toast.success('Site added');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add site');
    } finally {
      setSaving(false);
    }
  };

  const handleEditSite = async () => {
    if (!editingId || !siteCode.trim() || !name.trim()) {
      toast.error('Site code and name are required');
      return;
    }

    setSaving(true);
    try {
      const updatedSite = await siteService.updateSite(editingId, { siteCode, name, address });
      onSitesChange(sites.map(site => site.id === editingId ? updatedSite : site));
      resetForm();
      toast.success('Site updated');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update site');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSite = async (id: number) => {
    if (!confirm('Are you sure you want to delete this site?')) return;

    try {
      await siteService.deleteSite(id);
      const updatedSites = sites.filter(site => site.id !== id);
      onSitesChange(updatedSites);
      if (selectedSiteId === id) {
        const firstActive = updatedSites.find(site => site.active) || updatedSites[0];
        if (firstActive) onSelect(firstActive.id);
        else onSelect(null as any);
      }
      toast.success('Site deleted');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete site');
    }
  };

  const startEdit = (site: Site) => {
    setEditingId(site.id);
    setSiteCode(site.siteCode);
    setName(site.name);
    setAddress(site.address);
    setIsExpanded(true);
  };

  const activeSites = sites.filter(site => site.active);

  return (
    <div className="px-4 py-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-text-secondary hover:bg-white/[0.04] hover:text-text-primary transition-all duration-200 group"
      >
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-white/[0.03] group-hover:bg-white/[0.06] flex items-center justify-center text-base">
            🏗️
          </div>
          <span className="text-[14px] font-semibold">Sites</span>
        </div>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="mt-2 space-y-1">
          {activeSites.map(site => (
            <div
              key={site.id}
              className={`group relative flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer ${
                selectedSiteId === site.id
                  ? 'bg-accent-primary/[0.12] text-accent-primary'
                  : 'text-text-secondary hover:bg-white/[0.04] hover:text-text-primary'
              }`}
              onClick={() => onSelect(site.id)}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{site.name}</p>
                <p className="text-xs text-text-secondary/60 truncate">{site.siteCode}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  startEdit(site);
                }}
                className="opacity-0 group-hover:opacity-100 h-6 w-6 flex items-center justify-center rounded hover:bg-white/[0.1] transition-opacity"
                title="Edit site"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </div>
          ))}

          <button
            onClick={() => setIsAdding(true)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary hover:bg-white/[0.04] hover:text-accent-primary transition-all duration-200"
          >
            <div className="h-6 w-6 rounded flex items-center justify-center text-sm">
              +
            </div>
            <span className="text-sm font-medium">Add Site</span>
          </button>
        </div>
      )}

      {(isAdding || editingId) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-slate-900 border border-white/10 rounded-xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-bold text-white">
              {editingId ? 'Edit Site' : 'Add New Site'}
            </h3>

            <div className="space-y-3">
              <input
                value={siteCode}
                onChange={(e) => setSiteCode(e.target.value)}
                placeholder="Site code"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-sky-500"
              />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Site name"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-sky-500"
              />
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Address"
                className="w-full min-h-20 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={resetForm}
                className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-bold"
              >
                Cancel
              </button>
              <button
                onClick={editingId ? handleEditSite : handleAddSite}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-sm font-bold"
              >
                {saving ? 'Saving...' : editingId ? 'Update Site' : 'Add Site'}
              </button>
              {editingId && (
                <button
                  onClick={() => handleDeleteSite(editingId)}
                  className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-sm font-bold"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SiteManager;