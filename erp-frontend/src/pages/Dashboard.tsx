import React, { useState, useEffect } from 'react';
import type { Laborer } from '../modules/labor/types/laborer';
import { laborService } from '../modules/labor/services/laborService';
import Sidebar from '../components/common/Sidebar';
import StatGrid from '../components/common/StatGrid';
import LaborerTable from '../modules/labor/components/LaborerTable';
import AddLaborerModal from '../modules/labor/components/AddLaborerModal';
import ViewLaborerModal from '../modules/labor/components/ViewLaborerModal';

const Dashboard: React.FC = () => {
  const [laborers, setLaborers] = useState<Laborer[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedLaborer, setSelectedLaborer] = useState<Laborer | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await laborService.getAllLaborers(search);
        setLaborers(data);
      } catch (err) {
        console.error("Error fetching laborers:", err);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchData, 300);
    return () => clearTimeout(debounceTimer);
  }, [search]);

  return (
    <div className="flex h-screen w-screen font-inter bg-bg-main">
      <Sidebar />

      <main className="flex-1 p-10 overflow-y-auto flex flex-col gap-8">
        <header className="flex justify-between items-center">
          <div>
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

        <StatGrid 
          totalLaborers={search ? laborers.length : '3,000'} 
          activeToday="2,842" 
          dailyPayroll="₹12.4L" 
        />

        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <input 
              type="text" 
              className="w-full bg-bg-card border border-border-subtle p-4 pl-12 rounded-xl text-text-primary outline-none focus:border-accent-primary focus:ring-4 focus:ring-accent-primary/10 transition-all duration-200 shadow-xl" 
              placeholder="Search by name, GR No, or designation..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary opacity-50">🔍</span>
          </div>
        </div>

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

export default Dashboard;
