package com.antigravity.erp.modules.attendance.repository;

import com.antigravity.erp.modules.attendance.model.MonthlyPayroll;
import com.antigravity.erp.modules.attendance.model.MonthlyPayrollId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;
import com.antigravity.erp.modules.reports.dto.LaborCostAnalyticsDto;

@Repository
public interface MonthlyPayrollRepository extends JpaRepository<MonthlyPayroll, MonthlyPayrollId> {
    Optional<MonthlyPayroll> findByGrNoAndMonthAndYear(String grNo, Integer month, Integer year);
    List<MonthlyPayroll> findByMonthAndYear(Integer month, Integer year);

    @Query("SELECT new com.antigravity.erp.modules.reports.dto.LaborCostAnalyticsDto(p.month, p.year, l.designation, SUM(p.grossSalary)) " +
           "FROM MonthlyPayroll p JOIN p.laborer l " +
           "WHERE p.year >= :startYear " +
           "GROUP BY p.year, p.month, l.designation " +
           "ORDER BY p.year ASC, p.month ASC")
    List<LaborCostAnalyticsDto> getLaborCostAnalytics(Integer startYear);
}
