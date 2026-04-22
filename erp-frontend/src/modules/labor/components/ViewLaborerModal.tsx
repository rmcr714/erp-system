import React from 'react';
import type { Laborer } from '../types/laborer';

interface ViewLaborerModalProps {
  laborer: Laborer | null;
  onClose: () => void;
}

const ViewLaborerModal: React.FC<ViewLaborerModalProps> = ({ laborer, onClose }) => {
  if (!laborer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-main/80 backdrop-blur-md p-4">
      <div className="glass-card w-full max-w-2xl overflow-hidden flex flex-col shadow-2xl border-white/10 max-h-[90vh]">
        {/* Profile Header */}
        <div className="relative h-48 bg-gradient-to-r from-accent-primary/20 to-accent-secondary/20">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
          >
            ✕
          </button>
          
          <div className="absolute -bottom-16 left-8 flex items-end gap-6">
            <div className="w-32 h-32 rounded-2xl bg-bg-card border-4 border-bg-main shadow-xl overflow-hidden">
              {laborer.photoUrl ? (
                <img src={laborer.photoUrl} alt={laborer.fullName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl bg-white/5">👤</div>
              )}
            </div>
            <div className="mb-4">
              <h2 className="text-3xl font-bold font-outfit text-text-primary leading-tight">{laborer.fullName}</h2>
              <p className="text-accent-primary font-bold tracking-widest text-xs uppercase">{laborer.grNo} • {laborer.designation}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mt-20 p-8 pt-0 overflow-y-auto space-y-8">
          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Active Site</p>
              <p className="text-text-primary font-medium">{laborer.siteAddress}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Employer</p>
              <p className="text-text-primary font-medium">{laborer.employerName}</p>
            </div>
            <div className="space-y-1 col-span-2">
              <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Permanent Address</p>
              <p className="text-text-primary font-medium">{laborer.permanentAddress ? `${laborer.permanentAddress.line}, ${laborer.permanentAddress.state} - ${laborer.permanentAddress.pincode}` : 'Not provided'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Contact Info</p>
              <p className="text-text-primary font-medium">{laborer.contactNo || 'Not provided'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Joining Date</p>
              <p className="text-text-primary font-medium">{laborer.dateOfJoining?.toString() || 'Jan 15, 2023'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Physical Metrics</p>
              <p className="text-text-primary font-medium">{laborer.height || '5\'8"' } / {laborer.weight || '65kg'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Birth Date</p>
              <p className="text-text-primary font-medium">{laborer.dateOfBirth?.toString() || 'Mar 5, 1990'}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-border-subtle grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-[10px] font-bold text-text-secondary uppercase tracking-tight mb-1">Status</p>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                laborer.status === 'Active' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
              }`}>
                {laborer.status}
              </span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-text-secondary uppercase tracking-tight mb-1">Identity</p>
              <p className="text-xs font-mono">{laborer.idProof.type}: {laborer.idProof.idNumber}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-text-secondary uppercase tracking-tight mb-1">PF Status</p>
              <p className="text-xs font-bold">{laborer.hasPf ? `YES (${laborer.pfNo || 'N/A'})` : 'NO'}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-bold text-accent-primary uppercase tracking-widest flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-accent-primary"></span>
              Bank Details
            </h4>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-text-secondary mb-0.5">Bank</p>
                <p className="font-medium text-text-primary">{laborer.bankDetails.bankName || 'State Bank of India'}</p>
              </div>
              <div>
                <p className="text-text-secondary mb-0.5">IFSC</p>
                <p className="font-mono text-text-primary">{laborer.bankDetails.ifscCode || 'SBIN0001234'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-text-secondary mb-0.5">Account Number</p>
                <p className="font-mono text-text-primary tracking-widest">{laborer.bankDetails.accountNo}</p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-border-subtle flex justify-between items-center text-[9px] text-text-secondary uppercase tracking-widest font-mono">
             <span>Created: {laborer.createdAt ? new Date(laborer.createdAt).toLocaleDateString() : 'N/A'}</span>
             <span>Last Updated: {laborer.updatedAt ? new Date(laborer.updatedAt).toLocaleDateString() : 'N/A'}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border-subtle bg-white/5 flex gap-4">
          <button 
            className="flex-1 bg-white/5 border border-border-subtle text-text-primary py-3 rounded-xl font-bold hover:bg-white/10 transition-colors"
          >
            Edit Profile
          </button>
          <button 
            onClick={onClose}
            className="flex-1 bg-accent-primary text-white py-3 rounded-xl font-bold hover:bg-accent-secondary transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewLaborerModal;
