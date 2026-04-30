export interface MusterRow {
    grNo: string;
    name: string;
    designation: string;
    salaryPerDay: number;
    attendance: Record<number, number>;
    totalSalary: number;
    siteAdvance: number;
    onlineAdvance: number;
    totalAdvance: number;
    closingBalance: number;
    debitBalance: number;
    isActive: boolean;
    bankName?: string;
    accountNo?: string;
    ifscCode?: string;
}

export interface AttendanceReportParams {
    month: number;
    year: number;
}

export interface LaborCostData {
    month: number;
    year: number;
    designation: string;
    totalGrossSalary: number;
}
