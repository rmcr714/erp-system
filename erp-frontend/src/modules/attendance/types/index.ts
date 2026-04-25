export interface MonthlyMusterRow {
    grNo: string;
    name: string;
    designation: string;
    bankName: string;
    accountNo: string;
    ifscCode: string;
    salaryPerDay: number;
    attendance: Record<number, number>; // Day -> Units
    totalSalary: number;
    siteAdvance: number;
    onlineAdvance: number;
    totalAdvance: number;
    closingBalance: number;
    debitBalance: number;
}

export interface AttendanceSaveRequest {
    grNo: string;
    month: number;
    year: number;
    dailyUpdates: Record<number, number>;
}

export interface PayrollUpdateRequest {
    grNo: string;
    month: number;
    year: number;
    rate: number;
    siteAdvance: number;
    onlineAdvance: number;
    debitBalance: number;
}
