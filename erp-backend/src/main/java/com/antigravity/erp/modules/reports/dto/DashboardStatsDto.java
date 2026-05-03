package com.antigravity.erp.modules.reports.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDto {
    // Workforce
    private long totalLaborers;
    private long activeLaborers;
    private long inactiveLaborers;
    private long onLeaveLaborers;
    private Map<String, Long> laborersByDesignation;

    // Current Month Attendance
    private int currentMonth;
    private int currentYear;
    private double todayPresentCount;
    private double todayTotalUnits;
    private long todayMarkedCount;
    private long todayPendingCount;
    private double monthAverageAttendancePercent;

    // Payroll
    private BigDecimal currentMonthGrossPayroll;
    private BigDecimal currentMonthTotalAdvance;
    private BigDecimal currentMonthNetPayroll;
    private BigDecimal currentMonthTotalDebit;
    private long currentMonthPayrollRecords;
    private long missingPayrollRateCount;

    // Trends (last 6 months)
    private List<MonthlyTrend> payrollTrends;
    private List<MonthlyTrend> attendanceTrends;

    // Quick Lists
    private long newJoineesThisMonth;
    private List<TopWorker> topEarners;
    private List<TopWorker> highestDebits;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyTrend {
        private int month;
        private int year;
        private String label;
        private double value;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopWorker {
        private String grNo;
        private String name;
        private String designation;
        private BigDecimal amount;
        private double totalUnits;
    }
}
