import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import type { Laborer } from '../types/laborer';

export const exportLaborerToExcel = async (laborer: Partial<Laborer>, isDraft: boolean = false) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(isDraft ? 'Draft Data' : 'Official Data');

  // Title Row
  worksheet.mergeCells('A1', 'B1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = isDraft ? 'LABORER REGISTRATION DRAFT' : 'LABORER REGISTRATION RECEIPT';
  titleCell.font = { size: 14, bold: true, color: { argb: isDraft ? 'FF64748B' : 'FF059669' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(1).height = 25;

  const data = [
    ["Full Name", laborer.fullName || 'N/A'],
    ["Designation", laborer.designation || 'N/A'],
    ["Employer Name", laborer.employerName || 'N/A'],
    ["Active Project Site", laborer.siteAddress || 'N/A'],
    ["Address Line", laborer.permanentAddress?.line || 'N/A'],
    ["State", laborer.permanentAddress?.state || 'N/A'],
    ["Pincode", laborer.permanentAddress?.pincode || 'N/A'],
    ["Contact Number", laborer.contactNo || 'N/A'],
    ["Date of Birth", laborer.dateOfBirth || 'N/A'],
    ["Date of Joining", laborer.dateOfJoining || 'N/A'],
    ["Height", laborer.height || 'N/A'],
    ["Weight", laborer.weight || 'N/A'],
    ["Blood Group", laborer.bloodGroup || 'N/A'],
    ["PF Account Holder", laborer.hasPf ? 'Yes' : 'No'],
    ["PF Number", laborer.hasPf ? (laborer.pfNo || 'N/A') : 'N/A'],
    ["Secondary ID Type", laborer.idProof?.type || 'N/A'],
    ["Secondary ID Number", laborer.idProof?.idNumber || 'N/A'],
    ["Bank Name", laborer.bankDetails?.bankName || 'N/A'],
    ["Branch Name", laborer.bankDetails?.branch || 'N/A'],
    ["Account Number", laborer.bankDetails?.accountNo || 'N/A'],
    ["IFSC Code", laborer.bankDetails?.ifscCode || 'N/A'],
    ["Laborer Status", laborer.status || 'Active']
  ];

  // Add the data rows with styling
  data.forEach((item) => {
    const row = worksheet.addRow(item);
    // Style the first column (Labels) as bold with a light background
    const labelCell = row.getCell(1);
    labelCell.font = { bold: true, color: { argb: 'FF334155' } };
    labelCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF1F5F9' }
    };
    labelCell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
    };

    // Style the second column (Values)
    const valueCell = row.getCell(2);
    valueCell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
    };
  });

  // Auto-size columns
  worksheet.getColumn(1).width = 28;
  worksheet.getColumn(2).width = 45;

  const buffer = await workbook.xlsx.writeBuffer();
  
  // Generate file name dynamically
  const nameSuffix = laborer.fullName ? laborer.fullName.replace(/\s+/g, '_') : 'Unnamed';
  const prefix = isDraft ? 'Draft_' : 'Receipt_';
  const fileName = `Laborer_${prefix}${nameSuffix}.xlsx`;

  // Trigger download in browser
  saveAs(new Blob([buffer]), fileName);
};
