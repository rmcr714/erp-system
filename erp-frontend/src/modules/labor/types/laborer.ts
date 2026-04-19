export interface BankDetails {
  bankName: string;
  branch: string;
  accountNo: string;
  ifscCode: string;
}

export interface IdProof {
  type: 'AADHAR' | 'PAN' | 'ELECTION_CARD';
  idNumber: string;
}

export interface Laborer {
  grNo: string;
  fullName: string;
  designation: 'Carpenter' | 'Steel fitter' | 'Block mason' | 'Plaster mason' | 'Unskilled' | 'Other';
  designationDetail?: string;
  employerName: string;
  siteAddress: string;
  permanentAddress: string;
  contactNo: string;
  dateOfBirth: string;
  dateOfJoining: string;
  height?: string;
  weight?: string;
  bloodGroup?: string;
  joinByReference?: string;
  hasPf: boolean;
  pfNo?: string;
  idProof: IdProof;
  bankDetails: BankDetails;
  status: 'Active' | 'Inactive' | 'On Leave';
  photoUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}
