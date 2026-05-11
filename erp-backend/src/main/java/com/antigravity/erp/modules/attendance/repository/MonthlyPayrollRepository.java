package com.antigravity.erp.modules.attendance.repository;

import com.antigravity.erp.modules.attendance.model.MonthlyPayroll;
import com.antigravity.erp.modules.attendance.model.MonthlyPayrollId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;
import com.antigravity.erp.modules.reports.dto.LaborCostAnalyticsDto;

@Repository
public interface MonthlyPayrollRepository extends JpaRepository<MonthlyPayroll, MonthlyPayrollId> {
    Optional<MonthlyPayroll> findByWorkerIdAndSiteIdAndMonthAndYear(Long workerId, Long siteId, Integer month, Integer year);
    List<MonthlyPayroll> findByMonthAndYear(Integer month, Integer year);
    List<MonthlyPayroll> findBySiteIdAndMonthAndYear(Long siteId, Integer month, Integer year);

    @Query("SELECT new com.antigravity.erp.modules.reports.dto.LaborCostAnalyticsDto(p.month, p.year, l.designation, SUM(p.grossSalary)) " +
           "FROM MonthlyPayroll p JOIN p.laborer l " +
           "WHERE p.siteId = :siteId AND p.year >= :startYear " +
           "GROUP BY p.year, p.month, l.designation " +
           "ORDER BY p.year ASC, p.month ASC")
    List<LaborCostAnalyticsDto> getLaborCostAnalytics(@Param("siteId") Long siteId, @Param("startYear") Integer startYear);

    @Modifying
    @Query("UPDATE MonthlyPayroll p SET p.grNo = :grNo WHERE p.workerId = :workerId")
    int updateGrNoByWorkerId(@Param("workerId") Long workerId, @Param("grNo") String grNo);

    @Query("SELECT SUM(COALESCE(p.grossSalary, 0)), SUM(COALESCE(p.totalAdvance, 0)), SUM(COALESCE(p.netBalance, 0)), SUM(COALESCE(p.debitBalance, 0)) " +
           "FROM MonthlyPayroll p " +
           "WHERE p.siteId = :siteId AND p.month = :month AND p.year = :year")
    Object getSiteMonthlyTotals(@Param("siteId") Long siteId, @Param("month") Integer month, @Param("year") Integer year);
}
