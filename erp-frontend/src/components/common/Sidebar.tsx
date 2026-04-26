import React from 'react';

interface SidebarProps {
  currentPage?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage = 'dashboard', isOpen = true, onClose }) => {
  // Menu state simplified as dropdowns were removed

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-sidebar bg-bg-sidebar border-r border-border-subtle p-8 flex flex-col gap-8 overflow-y-auto transition-transform duration-300 ease-in-out shadow-2xl shadow-black/40 ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      <div className="flex justify-between items-center">
        <a 
          href="#dashboard" 
          className="font-outfit text-2xl font-bold bg-gradient-to-br from-accent-primary to-accent-secondary bg-clip-text text-transparent mb-8 hover:opacity-80 transition-opacity cursor-pointer"
        >
          AD Group
        </a>
        
        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors text-text-secondary hover:text-text-primary"
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

        <a 
          href="#laborers" 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
            currentPage?.includes('laborer') 
              ? 'bg-accent-primary/10 text-accent-primary' 
              : 'text-text-secondary hover:bg-glass hover:text-text-primary'
          }`}
        >
          <span className="text-xl">👷</span> <span className="font-medium">Laborers</span>
        </a>

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
