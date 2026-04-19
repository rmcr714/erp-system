import React from 'react';

const Sidebar: React.FC = () => {
  return (
    <aside className="w-sidebar bg-bg-sidebar border-r border-border-subtle p-8 flex flex-col gap-8">
      <div className="font-outfit text-2xl font-bold bg-gradient-to-br from-accent-primary to-accent-secondary bg-clip-text text-transparent mb-8">
        Antigravity ERP
      </div>
      <nav className="flex flex-col gap-2">
        <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-accent-primary/10 text-accent-primary transition-all duration-200">
          <span className="text-xl">📊</span> <span className="font-medium">Dashboard</span>
        </a>
        <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-text-secondary hover:bg-glass hover:text-text-primary transition-all duration-200">
          <span className="text-xl">👷</span> <span className="font-medium">Laborers</span>
        </a>
        <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-text-secondary hover:bg-glass hover:text-text-primary transition-all duration-200">
          <span className="text-xl">📅</span> <span className="font-medium">Attendance</span>
        </a>
        <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-text-secondary hover:bg-glass hover:text-text-primary transition-all duration-200">
          <span className="text-xl">💰</span> <span className="font-medium">Payroll</span>
        </a>
        <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-text-secondary hover:bg-glass hover:text-text-primary transition-all duration-200">
          <span className="text-xl">⚙️</span> <span className="font-medium">Settings</span>
        </a>
      </nav>
    </aside>
  );
};

export default Sidebar;
