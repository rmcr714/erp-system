package com.antigravity.erp.modules.reports.service;

import com.antigravity.erp.modules.reports.dto.DashboardStatsDto;
import com.antigravity.erp.modules.reports.repository.DashboardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final DashboardRepository dashboardRepository;

    private static final String[] MONTH_NAMES = {
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    };

    /**
     * Optimized dashboard stats — uses aggregate SQL queries instead of loading full entities.
     * 
     * Previous approach: 14+ DB queries, loaded ALL laborer/muster/payroll entities into memory.
     * Current approach: ~5 lightweight aggregate queries, returns only counts and sums.
     */
    @Transactional(readOnly = true)
    public DashboardStatsDto getDashboardStats() {
        LocalDate today = LocalDate.now();
        int currentMonth = today.getMonthValue();
        int currentYear = today.getYear();

        // ── 1. Workforce counts (1 fast aggregated query) ──
        long[] counts = dashboardRepository.getWorkforceCounts();
        long total = safeLong(counts, 0);
        long active = safeLong(counts, 1);
        long inactive = safeLong(counts, 2);
        long onLeave = safeLong(counts, 3);

        // ── 2. Designation breakdown (1 GROUP BY query) ──
        Map<String, Long> byDesignation = Optional
                .ofNullable(dashboardRepository.countActiveByDesignation())
                .orElseGet(Collections::emptyMap);

        // ── 3. New joinees (1 COUNT query) ──
        long newJoinees = dashboardRepository.countNewJoinees(currentMonth, currentYear);

        Object[] todayAttendance = dashboardRepository.getTodayAttendanceSummary(today);
        long todayMarkedCount = safeLong(todayAttendance, 0);
        double todayPresentCount = safeDouble(todayAttendance, 1);
        double todayTotalUnits = safeDouble(todayAttendance, 2);
        long todayPendingCount = Math.max(0, active - todayMarkedCount);

        // ── 4. Current month payroll aggregates (1 SUM query) ──
        BigDecimal[] payrollAgg = dashboardRepository.getPayrollAggregates(currentMonth, currentYear);
        BigDecimal grossPayroll = safeBigDecimal(payrollAgg, 0);
        BigDecimal totalAdvance = safeBigDecimal(payrollAgg, 1);
        BigDecimal netPayroll = safeBigDecimal(payrollAgg, 2);
        BigDecimal totalDebit = safeBigDecimal(payrollAgg, 3);
        long[] payrollReadiness = dashboardRepository.getPayrollReadiness(currentMonth, currentYear);
        long currentMonthPayrollRecords = safeLong(payrollReadiness, 0);
        long missingPayrollRateCount = safeLong(payrollReadiness, 1);

        // ── 5. Payroll trends — last 6 months (1 grouped query) ──
        LocalDate sixMonthsAgo = today.minusMonths(5);
        int fromMonth = sixMonthsAgo.getMonthValue();
        int fromYear = sixMonthsAgo.getYear();

        List<Object[]> trendRows = Optional
                .ofNullable(dashboardRepository.getPayrollTrends(fromMonth, fromYear, currentMonth, currentYear))
                .orElseGet(Collections::emptyList);

        // Build a lookup map of (year*100 + month) -> gross value
        Map<Integer, Double> trendMap = new HashMap<>();
        for (Object[] row : trendRows) {
            Number monthValue = safeNumber(row, 0);
            Number yearValue = safeNumber(row, 1);
            if (monthValue == null || yearValue == null) {
                continue;
            }
            int m = monthValue.intValue();
            int y = yearValue.intValue();
            double gross = safeDouble(row, 2);
            trendMap.put(y * 100 + m, gross);
        }

        // Fill in all 6 months (including months with zero data)
        List<DashboardStatsDto.MonthlyTrend> payrollTrends = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            LocalDate d = today.minusMonths(i);
            int m = d.getMonthValue();
            int y = d.getYear();
            String label = MONTH_NAMES[m - 1] + " " + y;
            double value = trendMap.getOrDefault(y * 100 + m, 0.0);

            payrollTrends.add(DashboardStatsDto.MonthlyTrend.builder()
                    .month(m).year(y).label(label).value(value).build());
        }

        return DashboardStatsDto.builder()
                .totalLaborers(total)
                .activeLaborers(active)
                .inactiveLaborers(inactive)
                .onLeaveLaborers(onLeave)
                .laborersByDesignation(byDesignation)
                .currentMonth(currentMonth)
                .currentYear(currentYear)
                .todayPresentCount(todayPresentCount)
                .todayTotalUnits(todayTotalUnits)
                .todayMarkedCount(todayMarkedCount)
                .todayPendingCount(todayPendingCount)
                .monthAverageAttendancePercent(0)
                .currentMonthGrossPayroll(grossPayroll)
                .currentMonthTotalAdvance(totalAdvance)
                .currentMonthNetPayroll(netPayroll)
                .currentMonthTotalDebit(totalDebit)
                .currentMonthPayrollRecords(currentMonthPayrollRecords)
                .missingPayrollRateCount(missingPayrollRateCount)
                .payrollTrends(payrollTrends)
                .attendanceTrends(Collections.emptyList())
                .newJoineesThisMonth(newJoinees)
                .topEarners(Collections.emptyList())
                .highestDebits(Collections.emptyList())
                .build();
    }

    private long safeLong(long[] values, int index) {
        return values != null && index >= 0 && index < values.length ? values[index] : 0;
    }

    private long safeLong(Object[] values, int index) {
        Number number = safeNumber(values, index);
        return number != null ? number.longValue() : 0;
    }

    private double safeDouble(Object[] values, int index) {
        Number number = safeNumber(values, index);
        return number != null ? number.doubleValue() : 0.0;
    }

    private Number safeNumber(Object[] values, int index) {
        if (values == null || index < 0 || index >= values.length || values[index] == null) {
            return null;
        }
        return (Number) values[index];
    }

    private BigDecimal safeBigDecimal(BigDecimal[] values, int index) {
        return values != null && index >= 0 && index < values.length && values[index] != null
                ? values[index]
                : BigDecimal.ZERO;
    }
}
