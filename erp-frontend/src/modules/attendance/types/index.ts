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
}

export interface AttendanceSaveRequest {
    grNo: string;
    month: number;
    year: number;
    dailyUpdates: Record<number, number>;
}
