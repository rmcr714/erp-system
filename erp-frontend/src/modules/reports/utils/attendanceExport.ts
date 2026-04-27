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
            'GR No', 'Worker Name', 'Salary Per Day', 
            'Bank Name', 'Account Number', 'IFSC Code',
            ...daysArray, 
            'Total Units', 'Total Salary', 'Site Adv', 'Online Adv', 'Total Adv', 'Debit', 'Balance', 'Actual Balance'
        ];
        headerRow.values = headers;
        headerRow.font = { bold: true, size: 10 };
        headerRow.height = 20;
        
        // Style header cells
        headerRow.eachCell((cell, colNumber) => {
            const isFinancial = colNumber >= (7 + daysArray.length + 1); // From Total Salary onwards
            const isLast = colNumber === headers.length;
            
            let bgColor = 'FFF1F5F9'; // Default Gray
            if (colNumber === 1) bgColor = 'FFFFEDD5'; // GR No (Orange)
            if (colNumber === 3) bgColor = 'FFBAE6FD'; // Salary Per Day (Blue)
            if (isFinancial) bgColor = 'FFFFEDD5'; // Financial Block (Orange)
            if (isLast) bgColor = 'FFBBF7D0'; // Actual Balance (Green)
            
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: bgColor }
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
            
            const totalUnits = Object.values(worker.attendance || {}).reduce((a: any, b: any) => a + (b || 0), 0);
            
            // Rounding Logic: <= 50 floor, > 50 ceil
            const netPay = worker.closingBalance || 0;
            const remainder = netPay % 100;
            const finalPay = remainder <= 50 ? netPay - remainder : netPay + (100 - remainder);

            const rowValues = [
                worker.grNo,
                worker.name,
                worker.salaryPerDay,
                worker.bankName || '-',
                worker.accountNo || '-',
                worker.ifscCode || '-',
                ...attendanceValues,
                totalUnits,
                worker.totalSalary,
                worker.siteAdvance || 0,
                worker.onlineAdvance || 0,
                worker.totalAdvance || 0,
                worker.debitBalance || 0,
                netPay,
                finalPay
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
                
                // GR No (Light Orange)
                if (colNumber === 1) {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFFFF7ED' } // Very Light Orange-50
                    };
                }

                // Salary Per Day (Sky Blue Background)
                if (colNumber === 3) {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFBAE6FD' } // Sky-200
                    };
                    cell.font = { bold: true, size: 10, color: { argb: 'FF0369A1' } };
                }
                
                // Bank Details Columns (Light Sky Background)
                if (colNumber >= 4 && colNumber <= 6) {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFF0F9FF' } // Sky-50
                    };
                    cell.font = { size: 9, color: { argb: 'FF0369A1' } };
                }

                // Actual Balance Column (Green Background)
                if (colNumber === headers.length) { 
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFBBF7D0' } // Emerald-200
                    };
                    cell.font = { bold: true, size: 10, color: { argb: 'FF15803D' } };
                }

                if (colNumber > 2) cell.alignment = { horizontal: 'center' };
            });
            
            currentRow++;
        });

        // Yellow Summary Row for the Section (Calculations only)
        const summaryRow = worksheet.getRow(currentRow);
        const totalUnits = rows.reduce((s, r) => s + Object.values(r.attendance || {}).reduce((a: any, b: any) => a + (b || 0), 0), 0);
        const totalGross = rows.reduce((s, r) => s + (r.totalSalary || 0), 0);
        const totalSiteAdv = rows.reduce((s, r) => s + (r.siteAdvance || 0), 0);
        const totalOnlineAdv = rows.reduce((s, r) => s + (r.onlineAdvance || 0), 0);
        const totalTotalAdv = rows.reduce((s, r) => s + (r.totalAdvance || 0), 0);
        const totalDebit = rows.reduce((s, r) => s + (r.debitBalance || 0), 0);
        const totalNet = rows.reduce((s, r) => s + (r.closingBalance || 0), 0);
        
        // Sum Final Pay
        const totalFinal = rows.reduce((s, r) => {
            const val = r.closingBalance || 0;
            const rem = val % 100;
            const fp = rem <= 50 ? val - rem : val + (100 - rem);
            return s + fp;
        }, 0);

        // Fill summary row with empty cells for leading columns
        const startIndex = 6 + daysArray.length;
        const summaryValues = new Array(startIndex).fill('');
        // We leave summaryValues[1] empty to remove the "TOTAL UNSKILLED" text
        summaryValues.push(totalUnits, totalGross, totalSiteAdv, totalOnlineAdv, totalTotalAdv, totalDebit, totalNet, totalFinal);
        
        summaryRow.values = summaryValues;
        summaryRow.font = { bold: true, size: 10 };
        summaryRow.height = 22;

        // Style the summary row
        summaryRow.eachCell((cell, colNumber) => {
            // Only apply yellow/green and border to data columns (Total Units onwards)
            if (colNumber > startIndex) {
                const isFinalCol = colNumber === (startIndex + 8);
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: isFinalCol ? 'FF86EFAC' : 'FFFDE047' } // Green-300 for Final Pay, else Yellow
                };
                cell.border = {
                    top: { style: 'medium' },
                    left: { style: 'thin' },
                    bottom: { style: 'medium' },
                    right: { style: 'thin' }
                };
                cell.alignment = { horizontal: 'center' };
                cell.numFmt = '₹#,##0';
            }
        });

        currentRow += 2; // Gap between sections
    });

    // Auto-size columns (rough estimate)
    worksheet.columns.forEach((column: any, i) => {
        if (i === 1) column.width = 25; // Name
        else if (i === 0) column.width = 10; // GR No
        else if (i === 2) column.width = 10; // Rate
        else if (i === 3) column.width = 20; // Bank Name
        else if (i === 4) column.width = 18; // Account No
        else if (i === 5) column.width = 15; // IFSC
        else if (i > 5 && i < (6 + daysArray.length)) column.width = 4; // Days
        else column.width = 12;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Attendance_Report_${monthName}_${year}.xlsx`);
};
