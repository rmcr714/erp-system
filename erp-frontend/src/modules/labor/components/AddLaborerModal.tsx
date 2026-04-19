import React, { useState } from 'react';
import type { Laborer } from '../types/laborer';
import { exportLaborerToExcel } from '../utils/excelExport';

interface AddLaborerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

const REQUIRED_FIELDS = [
  'fullName', 'designation', 'employerName', 'siteAddress',
  'contactNo',
  'permanentAddress.line', 'permanentAddress.state', 'permanentAddress.pincode',
  'idProof.idNumber',
  'bankDetails.accountNo', 'bankDetails.ifscCode'
];

const AddLaborerModal: React.FC<AddLaborerModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState<Partial<Laborer>>({
    designation: 'Unskilled',
    hasPf: false,
    status: 'Active',
    idProof: { type: 'AADHAR', idNumber: '' },
    bankDetails: { bankName: '', branch: '', accountNo: '', ifscCode: '' },
    permanentAddress: { line: '', state: '', pincode: '' }
  });

  const [errors, setErrors] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: any) => {
    // Clear error on field change
    setErrors(prev => { const copy = new Set(prev); copy.delete(field); return copy; });

    if (field.includes('.')) {
      const parts = field.split('.');
      const [parent, child] = parts;
      setFormData(prev => ({
        ...prev,
        [parent]: { ...(prev[parent as keyof Laborer] as any), [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const getFieldValue = (field: string): any => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      return (formData[parent as keyof Laborer] as any)?.[child];
    }
    return formData[field as keyof Laborer];
  };

  const validate = (): boolean => {
    const newErrors = new Set<string>();
    REQUIRED_FIELDS.forEach(field => {
      const value = getFieldValue(field);
      if (!value || String(value).trim() === '') {
        newErrors.add(field);
      }
    });
    setErrors(newErrors);
    return newErrors.size === 0;
  };

  const inputClass = (field: string) =>
    `w-full bg-white/5 border p-3 rounded-xl outline-none transition-all focus:ring-1 ${
      errors.has(field)
        ? 'border-red-500 focus:border-red-400 focus:ring-red-500/30'
        : 'border-border-subtle focus:border-accent-primary focus:ring-accent-primary/20'
    }`;

  const selectClass = (field: string) =>
    `w-full bg-white/5 border p-3 rounded-xl outline-none transition-all [&_option]:bg-bg-card [&_option]:text-text-primary ${
      errors.has(field)
        ? 'border-red-500'
        : 'border-border-subtle focus:border-accent-primary'
    }`;

  const fieldError = (field: string) =>
    errors.has(field) ? (
      <p className="text-red-400 text-xs mt-1 animate-in fade-in">This field is required.</p>
    ) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-main/80 backdrop-blur-md p-4">
      <div className="glass-card w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border-white/10">
        {/* Header */}
        <div className="p-6 border-b border-border-subtle flex justify-between items-center bg-white/5">
          <div>
            <h2 className="text-2xl font-bold font-outfit text-text-primary">Add New Laborer</h2>
            <p className="text-text-secondary text-sm">Fields marked with <span className="text-red-400">*</span> are required.</p>
          </div>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary text-2xl transition-colors">✕</button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10">

          {/* Section 1: Core Identification */}
          <section>
            <h3 className="text-accent-primary font-bold uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent-primary"></span>
              Core Identification
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-text-secondary">Full Name <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  className={inputClass('fullName')}
                  placeholder="e.g. Hemant Bhardwaj"
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                />
                {fieldError('fullName')}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-text-secondary">Designation <span className="text-red-400">*</span></label>
                <select className={selectClass('designation')} onChange={(e) => handleInputChange('designation', e.target.value)}>
                  <option value="Unskilled">Unskilled</option>
                  <option value="Carpenter">Carpenter</option>
                  <option value="Steel fitter">Steel fitter</option>
                  <option value="Block mason">Block mason</option>
                  <option value="Plaster mason">Plaster mason</option>
                  <option value="Other">Other</option>
                </select>
                {fieldError('designation')}
              </div>
              {formData.designation === 'Other' && (
                <div className="space-y-1 md:col-span-2 animate-in fade-in slide-in-from-top-2">
                  <label className="text-sm font-medium text-text-secondary">Specify Designation</label>
                  <input
                    type="text"
                    className={inputClass('designationDetail')}
                    placeholder="Enter manual designation..."
                    onChange={(e) => handleInputChange('designationDetail', e.target.value)}
                  />
                </div>
              )}
              <div className="space-y-1">
                <label className="text-sm font-medium text-text-secondary">Employer Name <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  className={inputClass('employerName')}
                  placeholder="e.g. Civic Construction Ltd"
                  onChange={(e) => handleInputChange('employerName', e.target.value)}
                />
                {fieldError('employerName')}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-text-secondary">Active Project Site <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  className={inputClass('siteAddress')}
                  placeholder="e.g. Ajmera Manhattan"
                  onChange={(e) => handleInputChange('siteAddress', e.target.value)}
                />
                {fieldError('siteAddress')}
              </div>
            </div>
          </section>

          {/* Section 2: Personal & Physical */}
          <section className="bg-white/5 -mx-8 px-8 py-8 border-y border-border-subtle leading-relaxed">
            <h3 className="text-accent-primary font-bold uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent-primary"></span>
              Personal & Physical
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Address Fields */}
              <div className="md:col-span-2 space-y-4">
                <label className="text-sm font-medium text-text-secondary block">Permanent Address <span className="text-red-400">*</span></label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-3 space-y-1">
                    <input
                      type="text"
                      className={inputClass('permanentAddress.line')}
                      placeholder="Address Line (Street, Area, City)"
                      onChange={(e) => handleInputChange('permanentAddress.line', e.target.value)}
                    />
                    {fieldError('permanentAddress.line')}
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <select
                      className={selectClass('permanentAddress.state')}
                      defaultValue=""
                      onChange={(e) => handleInputChange('permanentAddress.state', e.target.value)}
                    >
                      <option value="" disabled>Select State</option>
                      {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {fieldError('permanentAddress.state')}
                  </div>
                  <div className="space-y-1">
                    <input
                      type="text"
                      className={inputClass('permanentAddress.pincode')}
                      placeholder="Pincode"
                      maxLength={6}
                      onChange={(e) => handleInputChange('permanentAddress.pincode', e.target.value)}
                    />
                    {fieldError('permanentAddress.pincode')}
                  </div>
                </div>
              </div>

              {/* Contact Number */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-text-secondary">Contact Number <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  className={inputClass('contactNo')}
                  placeholder="+91-0000000000"
                  onChange={(e) => handleInputChange('contactNo', e.target.value)}
                />
                {fieldError('contactNo')}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-text-secondary">Date of Birth</label>
                <input type="date" className="w-full bg-white/5 border border-border-subtle p-3 rounded-xl outline-none text-text-secondary focus:border-accent-primary transition-all" onChange={(e) => handleInputChange('dateOfBirth', e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-text-secondary">Date of Joining</label>
                <input type="date" className="w-full bg-white/5 border border-border-subtle p-3 rounded-xl outline-none text-text-secondary focus:border-accent-primary transition-all" onChange={(e) => handleInputChange('dateOfJoining', e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-text-secondary">Blood Group</label>
                <input type="text" className="w-full bg-white/5 border border-border-subtle p-3 rounded-xl outline-none focus:border-accent-primary transition-all" placeholder="O+" onChange={(e) => handleInputChange('bloodGroup', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-text-secondary">Height</label>
                  <select className="w-full bg-white/5 border border-border-subtle p-3 rounded-xl outline-none transition-all [&_option]:bg-bg-card [&_option]:text-text-primary" onChange={(e) => handleInputChange('height', e.target.value)}>
                    <option value="">Select</option>
                    {Array.from({ length: 37 }, (_, i) => {
                      const totalInches = 48 + i;
                      const feet = Math.floor(totalInches / 12);
                      const inches = totalInches % 12;
                      const label = `${feet}'${inches}"`;
                      return <option key={label} value={label}>{label}</option>;
                    })}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-text-secondary">Weight</label>
                  <input type="text" className="w-full bg-white/5 border border-border-subtle p-3 rounded-xl outline-none focus:border-accent-primary transition-all" placeholder="e.g. 65kg" onChange={(e) => handleInputChange('weight', e.target.value)} />
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Media */}
          <section className="py-2">
            <h3 className="text-accent-primary font-bold uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent-primary"></span>
              Laborer Photo
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-4">
                <div className="p-6 rounded-2xl border-2 border-dashed border-border-subtle bg-white/5 hover:border-accent-secondary/50 hover:bg-white/10 transition-all cursor-pointer group relative"
                     onClick={() => document.getElementById('photo-upload')?.click()}>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        handleInputChange('photoUrl', url);
                      }
                    }}
                  />
                  <div className="flex flex-col items-center text-center gap-2">
                    <span className="text-3xl group-hover:scale-110 transition-transform">📸</span>
                    <div>
                      <p className="text-sm font-bold text-text-primary">Click to Browse Local Photo</p>
                      <p className="text-[10px] text-text-secondary uppercase tracking-tight">PNG, JPG or WEBP (Max 5MB)</p>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-text-secondary italic">
                  Note: The physical photo will be securely uploaded to the cloud once the system is connected to the production database.
                </p>
              </div>
              <div className="relative group">
                <div className="flex flex-col items-center justify-center p-2 rounded-2xl border border-border-subtle bg-black/20 overflow-hidden min-h-[140px] aspect-square">
                  {formData.photoUrl ? (
                    <img src={formData.photoUrl} alt="Preview" className="w-full h-full object-cover rounded-xl shadow-2xl border border-white/10" />
                  ) : (
                    <div className="text-center">
                      <span className="text-4xl block mb-2 opacity-30">👤</span>
                      <span className="text-[10px] uppercase font-bold text-text-secondary tracking-widest">Preview Area</span>
                    </div>
                  )}
                </div>
                {formData.photoUrl && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleInputChange('photoUrl', ''); }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full text-xs flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                  >✕</button>
                )}
              </div>
            </div>
          </section>

          {/* Section 4: Statutory & Identity */}
          <section className="bg-white/5 -mx-8 px-8 py-8 border-y border-border-subtle">
            <h3 className="text-accent-primary font-bold uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent-primary"></span>
              Statutory & Identity
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 flex flex-col justify-end">
                  <label className="flex items-center gap-3 cursor-pointer p-3 bg-white/5 rounded-xl border border-border-subtle hover:bg-white/10 transition-colors">
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded accent-accent-primary"
                      onChange={(e) => handleInputChange('hasPf', e.target.checked)}
                    />
                    <span className="text-sm font-medium text-text-primary uppercase tracking-tighter">PF Account Holder</span>
                  </label>
                </div>
                {formData.hasPf && (
                  <div className="space-y-2 animate-in fade-in zoom-in-95">
                    <label className="text-sm font-medium text-text-secondary">PF Number</label>
                    <input type="text" className="w-full bg-white/5 border border-border-subtle p-3 rounded-xl outline-none focus:border-accent-primary transition-all" placeholder="Enter PF No" onChange={(e) => handleInputChange('pfNo', e.target.value)} />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">Identity Proof <span className="text-red-400">*</span></label>
                <div className="flex gap-2">
                  <select
                    className="bg-white/5 border border-border-subtle p-3 rounded-xl outline-none [&_option]:bg-bg-card [&_option]:text-text-primary"
                    onChange={(e) => handleInputChange('idProof.type', e.target.value)}
                  >
                    <option value="AADHAR">AADHAR</option>
                    <option value="PAN">PAN</option>
                    <option value="ELECTION">VOTER ID</option>
                  </select>
                  <div className="flex-1 space-y-1">
                    <input
                      type="text"
                      className={inputClass('idProof.idNumber')}
                      placeholder="Enter ID Number"
                      onChange={(e) => handleInputChange('idProof.idNumber', e.target.value)}
                    />
                    {fieldError('idProof.idNumber')}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5: Bank Details */}
          <section>
            <h3 className="text-accent-primary font-bold uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent-primary"></span>
              Bank Account Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-text-secondary">Bank Name</label>
                <input type="text" className="w-full bg-white/5 border border-border-subtle p-3 rounded-xl outline-none focus:border-accent-primary transition-all" placeholder="e.g. State Bank of India" onChange={(e) => handleInputChange('bankDetails.bankName', e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-text-secondary">Branch Name</label>
                <input type="text" className="w-full bg-white/5 border border-border-subtle p-3 rounded-xl outline-none focus:border-accent-primary transition-all" placeholder="e.g. Andheri East" onChange={(e) => handleInputChange('bankDetails.branch', e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-text-secondary">Account Number <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  className={inputClass('bankDetails.accountNo')}
                  placeholder="Enter 12-16 digit account number"
                  onChange={(e) => handleInputChange('bankDetails.accountNo', e.target.value)}
                />
                {fieldError('bankDetails.accountNo')}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-text-secondary">IFSC Code <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  className={inputClass('bankDetails.ifscCode')}
                  placeholder="e.g. SBIN0001234"
                  onChange={(e) => handleInputChange('bankDetails.ifscCode', e.target.value)}
                />
                {fieldError('bankDetails.ifscCode')}
              </div>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border-subtle bg-white/5 flex justify-between items-center gap-4">
          <button
            onClick={() => exportLaborerToExcel(formData, true)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-text-secondary hover:text-white bg-white/5 hover:bg-white/10 transition-all border border-border-subtle"
          >
            <span>📥</span> Export Draft to Excel
          </button>

          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl font-semibold text-text-secondary hover:text-text-primary transition-colors"
            >
              Discard
            </button>
            <button
              onClick={() => {
                if (!validate()) return;
                exportLaborerToExcel(formData, false);
                alert("UI Demo: Data captured successfully and Excel receipt exported! GR number would be generated in production.");
                onClose();
              }}
              className="bg-accent-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-accent-primary/20 hover:bg-accent-secondary hover:-translate-y-0.5 transition-all"
            >
              Register Laborer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddLaborerModal;
