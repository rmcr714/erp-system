import React from 'react';

interface SidebarProps {
  currentPage?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', href: '#dashboard', match: (p: string) => p === 'dashboard' },
  { id: 'laborers', label: 'Laborers', icon: '👷', href: '#laborers', match: (p: string) => p.includes('laborer') },
  { id: 'attendance', label: 'Attendance', icon: '📅', href: '#attendance', match: (p: string) => p === 'attendance' },
  { id: 'payroll', label: 'Payroll', icon: '💰', href: '#payroll', match: (p: string) => p.startsWith('payroll') },
  { id: 'reports', label: 'Reports', icon: '📑', href: '#reports', match: (p: string) => p.startsWith('report') },
];

const Sidebar: React.FC<SidebarProps> = ({ currentPage = 'dashboard', isOpen = true, onClose }) => {
  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-sidebar bg-bg-sidebar/95 backdrop-blur-xl border-r border-white/[0.06] flex flex-col overflow-y-auto transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] shadow-2xl shadow-black/60 ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>

      {/* ── Header ── */}
      <div className="flex justify-between items-center px-7 pt-7 pb-2">
        <a 
          href="#dashboard" 
          className="group flex items-center gap-3 hover:opacity-90 transition-opacity cursor-pointer"
        >
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center shadow-lg shadow-accent-primary/20">
            <span className="text-white font-outfit font-black text-lg">A</span>
          </div>
          <div>
            <p className="font-outfit text-[17px] font-bold text-white leading-tight">AD Group</p>
            <p className="text-[11px] text-text-secondary/60 font-medium tracking-wide">ERP System</p>
          </div>
        </a>
        
        <button
          onClick={onClose}
          className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white/[0.06] transition-colors text-text-secondary/60 hover:text-text-primary"
          aria-label="Close menu"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* ── Divider ── */}
      <div className="mx-6 mt-4 mb-2 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent"></div>

      {/* ── Navigation ── */}
      <nav className="flex-1 flex flex-col gap-1 px-4 py-3">
        <p className="text-[10px] font-bold text-text-secondary/40 uppercase tracking-[0.2em] px-3 mb-1">Navigation</p>
        {NAV_ITEMS.map((item) => {
          const isActive = item.match(currentPage);
          return (
            <a
              key={item.id}
              href={item.href}
              className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-accent-primary/[0.12] text-accent-primary'
                  : 'text-text-secondary hover:bg-white/[0.04] hover:text-text-primary'
              }`}
            >
              {/* Active indicator bar */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-accent-primary shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
              )}
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-base shrink-0 transition-all duration-200 ${
                isActive
                  ? 'bg-accent-primary/15'
                  : 'bg-white/[0.03] group-hover:bg-white/[0.06]'
              }`}>
                {item.icon}
              </div>
              <span className="text-[14px] font-semibold">{item.label}</span>
            </a>
          );
        })}
      </nav>

      {/* ── Footer ── */}
      <div className="px-6 pb-6 pt-2">
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent mb-4"></div>
        <div className="flex items-center gap-2.5 px-1">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center">
            <span className="text-emerald-400 text-sm">⚡</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-text-primary/80">AD Group ERP</p>
            <p className="text-[10px] text-text-secondary/50">v1.0</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
