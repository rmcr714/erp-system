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
        long total = counts[0];
        long active = counts[1];
        long inactive = counts[2];
        long onLeave = counts[3];

        // ── 2. Designation breakdown (1 GROUP BY query) ──
        Map<String, Long> byDesignation = dashboardRepository.countActiveByDesignation();

        // ── 3. New joinees (1 COUNT query) ──
        long newJoinees = dashboardRepository.countNewJoinees(currentMonth, currentYear);

        // ── 4. Current month payroll aggregates (1 SUM query) ──
        BigDecimal[] payrollAgg = dashboardRepository.getPayrollAggregates(currentMonth, currentYear);
        BigDecimal grossPayroll = payrollAgg[0];
        BigDecimal totalAdvance = payrollAgg[1];
        BigDecimal netPayroll = payrollAgg[2];
        BigDecimal totalDebit = payrollAgg[3];

        // ── 5. Payroll trends — last 6 months (1 grouped query) ──
        LocalDate sixMonthsAgo = today.minusMonths(5);
        int fromMonth = sixMonthsAgo.getMonthValue();
        int fromYear = sixMonthsAgo.getYear();

        List<Object[]> trendRows = dashboardRepository.getPayrollTrends(fromMonth, fromYear, currentMonth, currentYear);

        // Build a lookup map of (year*100 + month) -> gross value
        Map<Integer, Double> trendMap = new HashMap<>();
        for (Object[] row : trendRows) {
            int m = ((Number) row[0]).intValue();
            int y = ((Number) row[1]).intValue();
            double gross = row[2] != null ? ((Number) row[2]).doubleValue() : 0;
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
                .todayPresentCount(0)
                .todayTotalUnits(0)
                .monthAverageAttendancePercent(0)
                .currentMonthGrossPayroll(grossPayroll)
                .currentMonthTotalAdvance(totalAdvance)
                .currentMonthNetPayroll(netPayroll)
                .currentMonthTotalDebit(totalDebit)
                .payrollTrends(payrollTrends)
                .attendanceTrends(Collections.emptyList())
                .newJoineesThisMonth(newJoinees)
                .topEarners(Collections.emptyList())
                .highestDebits(Collections.emptyList())
                .build();
    }
}
