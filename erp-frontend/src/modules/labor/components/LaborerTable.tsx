import React from 'react';
import type { Laborer } from '../types/laborer';

interface LaborerTableProps {
  laborers: Laborer[];
  loading: boolean;
  onViewProfile: (laborer: Laborer) => void;
}

const LaborerTable: React.FC<LaborerTableProps> = ({ laborers, loading, onViewProfile }) => {
  return (
    <div className="glass-card overflow-hidden border-none shadow-2xl">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border-subtle bg-white/5">
            <th className="p-5 text-xs font-bold uppercase tracking-widest text-text-secondary">GR No</th>
            <th className="p-5 text-xs font-bold uppercase tracking-widest text-text-secondary">Full Name</th>
            <th className="p-5 text-xs font-bold uppercase tracking-widest text-text-secondary">Designation</th>
            <th className="p-5 text-xs font-bold uppercase tracking-widest text-text-secondary">Project Site</th>
            <th className="p-5 text-xs font-bold uppercase tracking-widest text-text-secondary">Status</th>
            <th className="p-5 text-xs font-bold uppercase tracking-widest text-text-secondary">ID Proof</th>
            <th className="p-5 text-xs font-bold uppercase tracking-widest text-text-secondary text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle/50">
          {loading ? (
            <tr><td colSpan={7} className="p-10 text-center text-text-secondary animate-pulse">Loading data...</td></tr>
          ) : laborers.length > 0 ? (
            laborers.map((worker) => (
              <tr key={worker.grNo} className="hover:bg-glass transition-colors group">
                <td className="p-5 font-bold text-accent-primary">{worker.grNo}</td>
                <td className="p-5 font-medium">{worker.fullName}</td>
                <td className="p-5 text-text-secondary whitespace-nowrap">
                  {worker.designation}
                </td>
                <td className="p-5">{worker.siteAddress}</td>
                <td className="p-5">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
                    worker.status === 'Active' 
                    ? 'bg-success/10 text-success border border-success/20' 
                    : worker.status === 'On Leave'
                    ? 'bg-warning/10 text-warning border border-warning/20'
                    : 'bg-text-secondary/10 text-text-secondary border border-text-secondary/20'
                  }`}>
                    {worker.status}
                  </span>
                </td>
                <td className="p-5 font-mono text-xs">{worker.idProof.type}: {worker.idProof.idNumber}</td>
                <td className="p-5 text-right">
                  <button 
                    onClick={() => onViewProfile(worker)}
                    className="opacity-0 group-hover:opacity-100 bg-white/5 hover:bg-white/10 text-text-primary px-4 py-2 rounded-lg text-xs font-bold transition-all border border-border-subtle"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan={7} className="p-20 text-center text-text-secondary italic">No workers found matching your search.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default LaborerTable;
