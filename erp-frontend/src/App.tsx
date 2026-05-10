import Dashboard from './pages/Dashboard';
import LaborersPage from './pages/LaborersPage';
import AttendancePage from './pages/attendance/AttendancePage';
import PayrollPage from './pages/payroll/PayrollPage';
import ReportsPage from './pages/reports/ReportsPage';
import AnalyticsPage from './pages/reports/AnalyticsPage';
import AttendanceReportPage from './pages/reports/AttendanceReportPage';
import WorkerPresencePage from './pages/reports/WorkerPresencePage';
import SitesPage from './pages/SitesPage';
import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/common/Sidebar';
import SubtleSiteSelector from './modules/site/SubtleSiteSelector';
import { siteService } from './modules/site/siteService';
import type { Site } from './modules/site/types';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<number | null>(() => {
    const stored = localStorage.getItem('selectedSiteId');
    return stored ? Number(stored) : null;
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const loadSites = async () => {
    try {
      const data = await siteService.getSites();
      setSites(data);
      
      const currentSiteId = Number(localStorage.getItem('selectedSiteId'));
      const siteStillExists = data.some(site => site.id === currentSiteId);

      if (!siteStillExists) {
        if (data.length > 0) {
          const firstActive = data.find(site => site.active) || data[0];
          setSelectedSiteId(firstActive.id);
          localStorage.setItem('selectedSiteId', String(firstActive.id));
        } else {
          setSelectedSiteId(null);
          localStorage.removeItem('selectedSiteId');
        }
      }
    } catch (error) {
      console.error('Failed to load sites', error);
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) || 'dashboard';
      setCurrentPage(hash);
      loadSites();
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSiteSelect = (siteId: number) => {
    setSelectedSiteId(siteId);
    localStorage.setItem('selectedSiteId', String(siteId));
  };

  const renderPage = () => {
    if (currentPage === 'sites') {
      return <SitesPage />;
    }

    if (!selectedSiteId) {
      return (
        <div className="min-h-screen bg-bg-main text-text-primary flex items-center justify-center p-6">
          <div className="glass-card max-w-md p-8 text-center">
            <h1 className="text-2xl font-black mb-2">Select or create a site</h1>
            <p className="text-text-secondary mb-6">Choose an active project site from the top selector or go to Sites to manage your sites.</p>
            <a 
              href="#sites" 
              className="inline-flex items-center justify-center rounded-xl bg-accent-primary text-white font-semibold py-3 px-6 hover:bg-accent-primary/90 transition-colors w-full"
            >
              Manage Sites
            </a>
          </div>
        </div>
      );
    }

    if (currentPage.startsWith('laborers')) {
      return <LaborersPage siteId={selectedSiteId} />;
    }
    if (currentPage.startsWith('attendance')) {
      return <AttendancePage siteId={selectedSiteId} />;
    }
    if (currentPage.startsWith('payroll')) {
      return <PayrollPage siteId={selectedSiteId} />;
    }
    if (currentPage.startsWith('reports/analytics')) {
      return <AnalyticsPage siteId={selectedSiteId} />;
    }
    if (currentPage.startsWith('reports/attendance')) {
      return <AttendanceReportPage siteId={selectedSiteId} />;
    }
    if (currentPage.startsWith('reports/worker-presence')) {
      return <WorkerPresencePage siteId={selectedSiteId} />;
    }
    if (currentPage.startsWith('report')) {
      return <ReportsPage />;
    }
    return <Dashboard siteId={selectedSiteId} />;
  };

  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#f8fafc',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            fontSize: '14px',
            padding: '12px 16px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Sidebar
        currentPage={currentPage}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-sidebar' : 'ml-0'}`}>
        <div key={currentPage} className="animate-page-transition">
          {renderPage()}
        </div>
      </div>
      {selectedSiteId && (
        <SubtleSiteSelector
          sites={sites}
          selectedSiteId={selectedSiteId}
          onSelect={handleSiteSelect}
        />
      )}
    </>
  );
}

export default App;
