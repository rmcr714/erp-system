package com.antigravity.erp.modules.reports.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Tuple;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Lightweight repository for dashboard-specific aggregate queries.
 * Uses native SQL to avoid loading full entities — only fetches counts and sums.
 * Does NOT modify or replace any existing repository methods.
 */
@Repository
public class DashboardRepository {

    @PersistenceContext
    private EntityManager em;

    // ─── Workforce Counts ───────────────────────────────────────────────

    /**
     * Fetches all workforce counts in a single query.
     * Returns [total, active, inactive, onLeave]
     */
    public long[] getWorkforceCounts() {
        Object[] row = (Object[]) em.createNativeQuery(
                "SELECT COUNT(*), " +
                "       COUNT(*) FILTER (WHERE status = 'ACTIVE'), " +
                "       COUNT(*) FILTER (WHERE status = 'INACTIVE'), " +
                "       COUNT(*) FILTER (WHERE status = 'ON_LEAVE') " +
                "FROM laborers")
                .getSingleResult();

        return new long[]{
                ((Number) row[0]).longValue(),
                ((Number) row[1]).longValue(),
                ((Number) row[2]).longValue(),
                ((Number) row[3]).longValue()
        };
    }

    /**
     * Returns designation -> count for ACTIVE laborers only.
     */
    public Map<String, Long> countActiveByDesignation() {
        @SuppressWarnings("unchecked")
        List<Object[]> rows = em.createNativeQuery(
                "SELECT COALESCE(designation, 'Other'), COUNT(*) " +
                "FROM laborers WHERE status = 'ACTIVE' " +
                "GROUP BY designation ORDER BY COUNT(*) DESC")
                .getResultList();

        Map<String, Long> result = new LinkedHashMap<>();
        for (Object[] row : rows) {
            result.put((String) row[0], ((Number) row[1]).longValue());
        }
        return result;
    }

    public long countNewJoinees(int month, int year) {
        return ((Number) em.createNativeQuery(
                "SELECT COUNT(*) FROM laborers " +
                "WHERE EXTRACT(MONTH FROM date_of_joining) = :month " +
                "AND EXTRACT(YEAR FROM date_of_joining) = :year")
                .setParameter("month", month)
                .setParameter("year", year)
                .getSingleResult()).longValue();
    }

    // ─── Attendance Aggregates ─────────────────────────────────────────

    /**
     * Returns [markedCount, presentCount, totalUnits] for one day.
     */
    public Object[] getTodayAttendanceSummary(LocalDate workDate) {
        return (Object[]) em.createNativeQuery(
                "SELECT COUNT(*), " +
                "       COUNT(*) FILTER (WHERE COALESCE(units, 0) > 0), " +
                "       COALESCE(SUM(units), 0) " +
                "FROM daily_attendance_search das " +
                "JOIN laborers l ON l.gr_no = das.gr_no " +
                "WHERE das.work_date = :workDate " +
                "AND l.status = 'ACTIVE'")
                .setParameter("workDate", workDate)
                .getSingleResult();
    }

    // ─── Payroll Aggregates (single month) ──────────────────────────────

    /**
     * Returns [grossPayroll, totalAdvance, netPayroll, totalDebit] for one month.
     * Single query instead of loading all MonthlyPayroll entities.
     */
    public BigDecimal[] getPayrollAggregates(int month, int year) {
        Object[] row = (Object[]) em.createNativeQuery(
                "SELECT COALESCE(SUM(gross_salary), 0), " +
                "       COALESCE(SUM(total_advance), 0), " +
                "       COALESCE(SUM(net_balance), 0), " +
                "       COALESCE(SUM(debit_balance), 0) " +
                "FROM monthly_payroll WHERE month = :month AND year = :year")
                .setParameter("month", month)
                .setParameter("year", year)
                .getSingleResult();

        return new BigDecimal[]{
                toBigDecimal(row[0]),
                toBigDecimal(row[1]),
                toBigDecimal(row[2]),
                toBigDecimal(row[3])
        };
    }

    /**
     * Returns [activePayrollRows, missingRateRows] for current month readiness.
     */
    public long[] getPayrollReadiness(int month, int year) {
        Object[] row = (Object[]) em.createNativeQuery(
                "SELECT COUNT(*) FILTER (WHERE COALESCE(is_active, true) = true), " +
                "       COUNT(*) FILTER (WHERE COALESCE(is_active, true) = true " +
                "           AND (rate IS NULL OR rate = 0)) " +
                "FROM monthly_payroll WHERE month = :month AND year = :year")
                .setParameter("month", month)
                .setParameter("year", year)
                .getSingleResult();

        return new long[]{
                ((Number) row[0]).longValue(),
                ((Number) row[1]).longValue()
        };
    }

    // ─── Payroll Trends (6 months in ONE query) ─────────────────────────

    /**
     * Returns month/year -> gross total for up to 6 months in a single query.
     * Replaces the old loop that fired 6 separate queries.
     */
    public List<Object[]> getPayrollTrends(int fromMonth, int fromYear, int toMonth, int toYear) {
        return em.createNativeQuery(
                "SELECT month, year, COALESCE(SUM(gross_salary), 0) " +
                "FROM monthly_payroll " +
                "WHERE (year > :fromYear OR (year = :fromYear AND month >= :fromMonth)) " +
                "AND   (year < :toYear  OR (year = :toYear  AND month <= :toMonth)) " +
                "GROUP BY year, month " +
                "ORDER BY year ASC, month ASC")
                .setParameter("fromYear", fromYear)
                .setParameter("fromMonth", fromMonth)
                .setParameter("toYear", toYear)
                .setParameter("toMonth", toMonth)
                .getResultList();
    }

    // ─── Helpers ────────────────────────────────────────────────────────

    private BigDecimal toBigDecimal(Object val) {
        if (val == null) return BigDecimal.ZERO;
        if (val instanceof BigDecimal) return (BigDecimal) val;
        return new BigDecimal(val.toString());
    }
}
