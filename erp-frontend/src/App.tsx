import Dashboard from './pages/Dashboard';
import LaborersPage from './pages/LaborersPage';
import { useState, useEffect } from 'react';

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
    return <Dashboard />;
  };

  return renderPage();
}

export default App;
