import Dashboard from './pages/Dashboard';
import LaborersPage from './pages/LaborersPage';
import AttendancePage from './pages/attendance/AttendancePage';
import PayrollPage from './pages/payroll/PayrollPage';
import ReportsPage from './pages/reports/ReportsPage';
import AnalyticsPage from './pages/reports/AnalyticsPage';
import AttendanceReportPage from './pages/reports/AttendanceReportPage';
import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) || 'dashboard';
      setCurrentPage(hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const renderPage = () => {
    if (currentPage.startsWith('laborers')) {
      return <LaborersPage />;
    }
    if (currentPage.startsWith('attendance')) {
      return <AttendancePage />;
    }
    if (currentPage.startsWith('payroll')) {
      return <PayrollPage />;
    }
    if (currentPage.startsWith('reports/analytics')) {
      return <AnalyticsPage />;
    }
    if (currentPage.startsWith('reports/attendance')) {
      return <AttendanceReportPage />;
    }
    if (currentPage.startsWith('report')) {
      return <ReportsPage />;
    }
    return <Dashboard />;
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
      <div key={currentPage} className="animate-page-transition">
        {renderPage()}
      </div>
    </>
  );
}

export default App;
