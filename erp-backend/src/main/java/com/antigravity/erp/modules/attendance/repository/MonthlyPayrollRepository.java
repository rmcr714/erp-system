package com.antigravity.erp.modules.attendance.repository;

import com.antigravity.erp.modules.attendance.model.MonthlyPayroll;
import com.antigravity.erp.modules.attendance.model.MonthlyPayrollId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface MonthlyPayrollRepository extends JpaRepository<MonthlyPayroll, MonthlyPayrollId> {
    Optional<MonthlyPayroll> findByGrNoAndMonthAndYear(String grNo, Integer month, Integer year);
    List<MonthlyPayroll> findByMonthAndYear(Integer month, Integer year);
}
