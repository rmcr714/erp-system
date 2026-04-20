import React, { useState, useEffect } from 'react';
import type { Laborer } from '../modules/labor/types/laborer';
import { laborService } from '../modules/labor/services/laborService';
import Sidebar from '../components/common/Sidebar';
import LaborerTable from '../modules/labor/components/LaborerTable';
import AddLaborerModal from '../modules/labor/components/AddLaborerModal';
import ViewLaborerModal from '../modules/labor/components/ViewLaborerModal';

interface SearchCriteria {
  name: string;
  grNo: string;
  designation: string;
  idProofNumber: string;
}

const INDIAN_DESIGNATIONS = [
  'Unskilled',
  'Carpenter',
  'Steel fitter',
  'Block mason',
  'Plaster mason',
  'Other'
];

const LaborersPage: React.FC = () => {
  const [laborers, setLaborers] = useState<Laborer[]>([]);
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({
    name: '',
    grNo: '',
    designation: '',
    idProofNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedLaborer, setSelectedLaborer] = useState<Laborer | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Load all laborers on initial page load only
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const data = await laborService.getAllLaborers({});
        setLaborers(data);
      } catch (err) {
        console.error("Error fetching laborers:", err);
      } finally {
        setLoading(false);
        setInitialLoad(false);
      }
    };

    if (initialLoad) {
      fetchInitialData();
    }
  }, [initialLoad]);

  const handleSearchChange = (field: keyof SearchCriteria, value: string) => {
    setSearchCriteria(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setSearchCriteria({
      name: '',
      grNo: '',
      designation: '',
      idProofNumber: ''
    });
  };

  const hasActiveFilters = Object.values(searchCriteria).some(v => v !== '');

  return (
    <div className="flex h-screen w-screen font-inter bg-bg-main">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar currentPage="laborers" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 p-10 overflow-y-auto flex flex-col gap-8">
        <header className="flex justify-between items-center">
          {/* Hamburger Menu Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
          >
            <div className="w-6 h-6 flex flex-col justify-center items-center">
              <span className={`block w-5 h-0.5 bg-text-primary transition-all duration-300 ${sidebarOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'}`} />
              <span className={`block w-5 h-0.5 bg-text-primary transition-all duration-300 ${sidebarOpen ? 'opacity-0' : 'opacity-100'}`} />
              <span className={`block w-5 h-0.5 bg-text-primary transition-all duration-300 ${sidebarOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1'}`} />
            </div>
          </button>

          <div className="flex-1 lg:flex-none">
            <h1 className="text-4xl font-bold mb-2 tracking-tight text-text-primary">Laborer Directory</h1>
            <p className="text-text-secondary text-lg">Manage your workforce across all active project sites.</p>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-accent-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-accent-secondary hover:-translate-y-0.5 shadow-lg shadow-accent-primary/20 transition-all duration-200"
          >
            + Add Laborer
          </button>
        </header>

        {/* Search Filters */}
        <section className="bg-white/5 border border-border-subtle rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-text-secondary">Search & Filter</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-accent-primary hover:text-accent-secondary transition-colors underline"
              >
                Clear All Filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search by Name */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-text-secondary uppercase tracking-tight">By Name</label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full bg-bg-card border border-border-subtle p-3 pl-10 rounded-lg text-text-primary outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 transition-all"
                  placeholder="e.g. Hemant..."
                  value={searchCriteria.name}
                  onChange={(e) => handleSearchChange('name', e.target.value)}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary opacity-50">👤</span>
              </div>
            </div>

            {/* Search by GR No */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-text-secondary uppercase tracking-tight">By GR Number</label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full bg-bg-card border border-border-subtle p-3 pl-10 rounded-lg text-text-primary outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 transition-all"
                  placeholder="e.g. 487..."
                  value={searchCriteria.grNo}
                  onChange={(e) => handleSearchChange('grNo', e.target.value)}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary opacity-50">🔢</span>
              </div>
            </div>

            {/* Search by Designation */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-text-secondary uppercase tracking-tight">By Designation</label>
              <div className="relative">
                <select
                  className="w-full bg-bg-card border border-border-subtle p-3 pl-10 rounded-lg text-text-primary outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 transition-all [&_option]:bg-bg-card [&_option]:text-text-primary"
                  value={searchCriteria.designation}
                  onChange={(e) => handleSearchChange('designation', e.target.value)}
                >
                  <option value="">Select a Designation</option>
                  <option value="*">All Designations</option>
                  {INDIAN_DESIGNATIONS.map(d => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary opacity-50 pointer-events-none">🏗️</span>
              </div>
            </div>

            {/* Search by ID Proof Number */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-text-secondary uppercase tracking-tight">By ID Proof Number</label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full bg-bg-card border border-border-subtle p-3 pl-10 rounded-lg text-text-primary outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 transition-all"
                  placeholder="e.g. Aadhar/PAN..."
                  value={searchCriteria.idProofNumber}
                  onChange={(e) => handleSearchChange('idProofNumber', e.target.value)}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary opacity-50">🪪</span>
              </div>
            </div>
          </div>

          {/* Results Counter & Search Button */}
          <div className="mt-4 pt-4 border-t border-border-subtle/50 flex justify-between items-center">
            <p className="text-sm text-text-secondary">
              {loading ? (
                '⏳ Searching...'
              ) : (
                <>
                  Found <span className="text-accent-primary font-bold">{laborers.length}</span> laborer{laborers.length !== 1 ? 's' : ''}
                  {hasActiveFilters && ' matching your filters'}
                </>
              )}
            </p>
            <button
              onClick={() => {
                const fetchData = async () => {
                  setLoading(true);
                  try {
                    const data = await laborService.getAllLaborers(searchCriteria);
                    setLaborers(data);
                  } catch (err) {
                    console.error("Error fetching laborers:", err);
                  } finally {
                    setLoading(false);
                  }
                };
                fetchData();
              }}
              disabled={!hasActiveFilters}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition-all active:scale-95 ${
                hasActiveFilters
                  ? 'bg-accent-secondary/30 border-2 border-accent-secondary text-accent-secondary hover:bg-accent-secondary/50 hover:shadow-lg hover:shadow-accent-secondary/30 cursor-pointer'
                  : 'bg-white/5 border-2 border-border-subtle text-text-secondary/40 cursor-not-allowed opacity-50'
              }`}
            >
              <span>🔍</span> Search
            </button>
          </div>
        </section>

        {/* Laborers Table */}
        <LaborerTable 
          laborers={laborers} 
          loading={loading} 
          onViewProfile={setSelectedLaborer}
        />

        <AddLaborerModal 
          isOpen={isAddModalOpen} 
          onClose={() => setIsAddModalOpen(false)} 
        />

        <ViewLaborerModal 
          laborer={selectedLaborer} 
          onClose={() => setSelectedLaborer(null)} 
        />
      </main>
    </div>
  );
};

export default LaborersPage;
