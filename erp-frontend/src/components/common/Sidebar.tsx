import React, { useState } from 'react';

interface SidebarProps {
  currentPage?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage = 'dashboard', isOpen = true, onClose }) => {
  const [expandedMenu, setExpandedMenu] = useState<string | null>(
    currentPage === 'laborers' ? 'laborers' : null
  );

  const toggleMenu = (menu: string) => {
    setExpandedMenu(expandedMenu === menu ? null : menu);
  };

  return (
    <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-sidebar bg-bg-sidebar border-r border-border-subtle p-8 flex flex-col gap-8 overflow-y-auto transition-transform duration-300 ease-in-out ${
      isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
    }`}>
      <div className="flex justify-between items-center">
        <a 
          href="#dashboard" 
          className="font-outfit text-2xl font-bold bg-gradient-to-br from-accent-primary to-accent-secondary bg-clip-text text-transparent mb-8 hover:opacity-80 transition-opacity cursor-pointer"
        >
          Antigravity ERP
        </a>
        
        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors text-text-secondary hover:text-text-primary"
          aria-label="Close menu"
        >
          ✕
        </button>
      </div>
      <nav className="flex flex-col gap-2">
        <a 
          href="#dashboard" 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
            currentPage === 'dashboard' 
              ? 'bg-accent-primary/10 text-accent-primary' 
              : 'text-text-secondary hover:bg-glass hover:text-text-primary'
          }`}
        >
          <span className="text-xl">📊</span> <span className="font-medium">Dashboard</span>
        </a>

        {/* Laborers Menu with Expandable Submenu */}
        <div className="flex flex-col">
          <button
            onClick={() => toggleMenu('laborers')}
            className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full text-left ${
              currentPage?.includes('laborer')
                ? 'bg-accent-primary/10 text-accent-primary'
                : 'text-text-secondary hover:bg-glass hover:text-text-primary'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">👷</span> <span className="font-medium">Laborers</span>
            </div>
            <span className={`text-xs transition-transform duration-200 ${expandedMenu === 'laborers' ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>

          {/* Submenu Items */}
          {expandedMenu === 'laborers' && (
            <div className="ml-4 mt-1 flex flex-col gap-1 animate-in fade-in slide-in-from-top-2">
              <a
                href="#laborers/directory"
                className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                  currentPage === 'laborers'
                    ? 'bg-accent-primary/20 text-accent-primary'
                    : 'text-text-secondary hover:bg-glass/50 hover:text-text-primary'
                }`}
              >
                <span className="text-lg">📋</span> <span>Directory</span>
              </a>
              <a
                href="#laborers/attendance"
                className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-text-secondary hover:bg-glass/50 hover:text-text-primary transition-all duration-200"
              >
                <span className="text-lg">📅</span> <span>Attendance</span>
              </a>
              <a
                href="#laborers/payroll"
                className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-text-secondary hover:bg-glass/50 hover:text-text-primary transition-all duration-200"
              >
                <span className="text-lg">💰</span> <span>Payroll</span>
              </a>
              <a
                href="#laborers/reports"
                className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-text-secondary hover:bg-glass/50 hover:text-text-primary transition-all duration-200"
              >
                <span className="text-lg">📊</span> <span>Reports</span>
              </a>
            </div>
          )}
        </div>

        <a 
          href="#attendance" 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
            currentPage === 'attendance' 
              ? 'bg-accent-primary/10 text-accent-primary' 
              : 'text-text-secondary hover:bg-glass hover:text-text-primary'
          }`}
        >
          <span className="text-xl">📅</span> <span className="font-medium">Attendance</span>
        </a>
        
        <a 
          href="#payroll" 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
            currentPage?.startsWith('payroll') 
              ? 'bg-accent-primary/10 text-accent-primary' 
              : 'text-text-secondary hover:bg-glass hover:text-text-primary'
          }`}
        >
          <span className="text-xl">💰</span> <span className="font-medium">Payroll</span>
        </a>
        
        <a 
          href="#settings" 
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-text-secondary hover:bg-glass hover:text-text-primary transition-all duration-200"
        >
          <span className="text-xl">⚙️</span> <span className="font-medium">Settings</span>
        </a>
      </nav>
    </aside>
  );
};

export default Sidebar;
