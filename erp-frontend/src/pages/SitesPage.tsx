import React, { useState, useEffect } from 'react';
import { siteService } from '../modules/site/siteService';
import type { Site, SiteRequest } from '../modules/site/types';
import toast from 'react-hot-toast';

const SitesPage: React.FC = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [siteCode, setSiteCode] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // SHA-256 hash of the site admin password
  const SITE_PASSWORD_HASH = '9fb1467a88e89ff88e74d578a6cb3600bd0d9c857051d216c1bff5dd8f4c16eb';

  const handlePasswordSubmit = async () => {
    try {
      // Create SHA-256 hash of the input password
      const encoder = new TextEncoder();
      const data = encoder.encode(passwordInput);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const inputHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      if (inputHash === SITE_PASSWORD_HASH) {
        setIsAuthenticated(true);
        setPasswordInput('');
        setPasswordError('');
      } else {
        setPasswordError('Invalid password');
        setPasswordInput('');
      }
    } catch (err) {
      console.error('Hashing failed', err);
      setPasswordError('An error occurred. Please try again.');
    }
  };

  const handleBack = () => {
    setIsAuthenticated(false);
    window.location.hash = '#dashboard';
  };

  useEffect(() => {
    loadSites();
  }, []);

  const loadSites = async () => {
    try {
      const data = await siteService.getSites();
      setSites(data);
    } catch (error) {
      console.error('Failed to load sites', error);
      toast.error('Failed to load sites');
    } finally {
      setLoading(false);
    }
  };

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
      setSites(prev => [...prev, site]);
      resetForm();
      toast.success('Site added successfully');
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
      setSites(prev => prev.map(site => site.id === editingId ? updatedSite : site));
      resetForm();
      toast.success('Site updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update site');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (site: Site) => {
    setEditingId(site.id);
    setSiteCode(site.siteCode);
    setName(site.name);
    setAddress(site.address);
  };

  const toggleSiteStatus = async (site: Site) => {
    try {
      const updatedSite = await siteService.updateSite(site.id, { active: !site.active });
      setSites(prev => prev.map(s => s.id === site.id ? updatedSite : s));
      toast.success(`Site ${updatedSite.active ? 'activated' : 'deactivated'}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update site status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center">
        <div className="text-white">Loading sites...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="glass-card p-8 space-y-6 rounded-2xl border border-white/10">
            <div className="text-center">
              <div className="text-5xl mb-4">🔐</div>
              <h1 className="text-2xl font-black text-white mb-2">Site Management</h1>
              <p className="text-text-secondary text-sm">Enter password to access site management</p>
            </div>

            <div className="space-y-3">
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setPasswordError('');
                }}
                onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                placeholder="Enter password"
                autoFocus
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-text-secondary/50 outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/30 transition-all"
              />
              {passwordError && (
                <p className="text-red-400 text-sm font-medium">{passwordError}</p>
              )}
            </div>

            <button
              onClick={handlePasswordSubmit}
              className="w-full px-6 py-3 bg-accent-primary hover:bg-accent-primary/80 text-white font-bold rounded-lg shadow-lg transition-colors"
            >
              Unlock
            </button>

            <button
              onClick={() => window.location.hash = '#dashboard'}
              className="w-full px-6 py-2 bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white font-medium rounded-lg transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-main text-text-primary p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Go back to dashboard"
            >
              <svg className="w-6 h-6 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-3xl font-black text-white">Site Management</h1>
              <p className="text-text-secondary text-sm">Manage your construction sites and project locations</p>
            </div>
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="px-6 py-3 bg-accent-primary hover:bg-accent-primary/80 text-white font-bold rounded-xl shadow-lg transition-colors flex items-center gap-2"
          >
            <span>+</span>
            Add Site
          </button>
        </div>

        {/* Sites Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sites.map(site => (
            <div
              key={site.id}
              className={`glass-card p-6 ${site.active ? 'border-accent-primary/20' : 'border-red-500/20 opacity-75'}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{site.name}</h3>
                  <p className="text-sm text-accent-primary font-mono">{site.siteCode}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    site.active
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {site.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <p className="text-text-secondary text-sm mb-4 min-h-[3rem]">
                {site.address || 'No address provided'}
              </p>

              <div className="flex justify-between items-center">
                <button
                  onClick={() => toggleSiteStatus(site)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    site.active
                      ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
                      : 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
                  }`}
                >
                  {site.active ? 'Deactivate' : 'Activate'}
                </button>

                <button
                  onClick={() => startEdit(site)}
                  className="px-4 py-1.5 bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>

        {sites.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏗️</div>
            <h3 className="text-xl font-bold text-white mb-2">No sites yet</h3>
            <p className="text-text-secondary mb-6">Create your first construction site to get started</p>
            <button
              onClick={() => setIsAdding(true)}
              className="px-6 py-3 bg-accent-primary hover:bg-accent-primary/80 text-white font-bold rounded-xl shadow-lg transition-colors"
            >
              Add Your First Site
            </button>
          </div>
        )}

        {/* Add/Edit Modal */}
        {(isAdding || editingId) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
            <div className="bg-slate-900 border border-white/10 rounded-xl p-8 w-full max-w-md space-y-6">
              <h3 className="text-2xl font-bold text-white text-center">
                {editingId ? 'Edit Site' : 'Add New Site'}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Site Code *
                  </label>
                  <input
                    value={siteCode}
                    onChange={(e) => setSiteCode(e.target.value.toUpperCase())}
                    placeholder="e.g., SITE001"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-text-secondary/50 outline-none focus:border-accent-primary transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Site Name *
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Downtown Construction Site"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-text-secondary/50 outline-none focus:border-accent-primary transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Address
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Full address of the site"
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-text-secondary/50 outline-none focus:border-accent-primary transition-colors resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={resetForm}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={editingId ? handleEditSite : handleAddSite}
                  disabled={saving}
                  className="px-6 py-2 bg-accent-primary hover:bg-accent-primary/80 disabled:opacity-50 text-white font-bold rounded-lg transition-colors"
                >
                  {saving ? 'Saving...' : editingId ? 'Update Site' : 'Add Site'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SitesPage;