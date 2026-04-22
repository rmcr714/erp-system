import * as XLSX from 'xlsx';
import type { Laborer } from '../types/laborer';

export const exportLaborerToExcel = (laborer: Partial<Laborer>, isDraft: boolean = false) => {
  // Flatten the laborer data structure into a clean single-row object for Excel
  const rowData = [
    {
      "Full Name": laborer.fullName || 'N/A',
      "Designation": laborer.designation || 'N/A',
      "Employer Name": laborer.employerName || 'N/A',
      "Active Project Site": laborer.siteAddress || 'N/A',
      "Address Line": laborer.permanentAddress?.line || 'N/A',
      "State": laborer.permanentAddress?.state || 'N/A',
      "Pincode": laborer.permanentAddress?.pincode || 'N/A',
      "Contact Number": laborer.contactNo || 'N/A',
      "Date of Birth": laborer.dateOfBirth || 'N/A',
      "Date of Joining": laborer.dateOfJoining || 'N/A',
      "Height": laborer.height || 'N/A',
      "Weight": laborer.weight || 'N/A',
      "Blood Group": laborer.bloodGroup || 'N/A',
      "PF Account Holder": laborer.hasPf ? 'Yes' : 'No',
      "PF Number": laborer.hasPf ? (laborer.pfNo || 'N/A') : 'N/A',
      "Secondary ID Type": laborer.idProof?.type || 'N/A',
      "Secondary ID Number": laborer.idProof?.idNumber || 'N/A',
      "Bank Name": laborer.bankDetails?.bankName || 'N/A',
      "Branch Name": laborer.bankDetails?.branch || 'N/A',
      "Account Number": laborer.bankDetails?.accountNo || 'N/A',
      "IFSC Code": laborer.bankDetails?.ifscCode || 'N/A',
      "Laborer Status": laborer.status || 'Active',
      "Photo URL": laborer.photoUrl ? laborer.photoUrl.toString() : 'No Photo'
    }
  ];

  // Convert the JSON to an Excel worksheet
  const worksheet = XLSX.utils.json_to_sheet(rowData);
  const workbook = XLSX.utils.book_new();
  
  // Set the sheet name
  const sheetName = isDraft ? 'Draft Data' : 'Official Data';
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Generate file name dynamically
  const nameSuffix = laborer.fullName ? laborer.fullName.replace(/\s+/g, '_') : 'Unnamed';
  const prefix = isDraft ? 'Draft_' : 'Receipt_';
  const fileName = `Laborer_${prefix}${nameSuffix}.xlsx`;

  // Trigger download in browser
  XLSX.writeFile(workbook, fileName);
};
