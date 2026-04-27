import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export const exportAttendanceToExcel = async (
    data: any[], 
    monthName: string, 
    year: number, 
    daysArray: number[]
) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`${monthName}_${year}`);

    // Set Main Title
    worksheet.mergeCells('A1', 'H1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = `ATTENDANCE REPORT - ${monthName.toUpperCase()} ${year}`;
    titleCell.font = { size: 16, bold: true, color: { argb: 'FF1E293B' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(1).height = 30;

    let currentRow = 3;

    // Grouping logic (Segregation)
    const designations = Array.from(new Set(data.map(d => d.designation))).sort();
    
    designations.forEach(desig => {
        const rows = data.filter(r => r.designation === desig);
        
        // Designation Header Row (Indigo Background)
        const desigRow = worksheet.getRow(currentRow);
        desigRow.getCell(1).value = ` DESIGNATION: ${desig.toUpperCase()} (${rows.length} Workers)`;
        desigRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
        desigRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF6366F1' } // Indigo-500
        };
        worksheet.mergeCells(`A${currentRow}:E${currentRow}`);
        currentRow++;

        // Table Header
        const headerRow = worksheet.getRow(currentRow);
        const headers = [
            'GR No', 'Worker Name', 'Rate', 
            ...daysArray, 
            'Total Units', 'Gross Salary', 'Total Adv', 'Debit', 'Net Pay',
            'Bank Name', 'Account Number', 'IFSC Code'
        ];
        headerRow.values = headers;
        headerRow.font = { bold: true, size: 10 };
        headerRow.height = 20;
        
        // Style header cells
        headerRow.eachCell((cell, colNumber) => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFF1F5F9' } // Slate-100
            };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            cell.alignment = { horizontal: 'center' };
        });
        currentRow++;

        // Data Rows
        rows.forEach(worker => {
            const dataRow = worksheet.getRow(currentRow);
            const attendanceValues = daysArray.map(d => worker.attendance[d] || '-');
            
            const rowValues = [
                worker.grNo,
                worker.name,
                worker.salaryPerDay,
                ...attendanceValues,
                Object.values(worker.attendance || {}).reduce((a: any, b: any) => a + (b || 0), 0),
                worker.totalSalary,
                worker.totalAdvance || 0,
                worker.debitBalance || 0,
                worker.closingBalance,
                worker.bankName || '-',
                worker.accountNo || '-',
                worker.ifscCode || '-'
            ];
            
            dataRow.values = rowValues;
            dataRow.font = { size: 10 };
            
            // Align and border
            dataRow.eachCell((cell, colNumber) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
                if (colNumber > 2) cell.alignment = { horizontal: 'center' };
            });
            
            currentRow++;
        });

        currentRow += 1; // Gap between sections
    });

    // Auto-size columns (rough estimate)
    worksheet.columns.forEach((column: any, i) => {
        if (i === 1) column.width = 25; // Name
        else if (i === 0) column.width = 12; // GR No
        else if (i > 2 && i < (3 + daysArray.length)) column.width = 4; // Days
        else column.width = 12;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Attendance_Report_${monthName}_${year}.xlsx`);
};
