package com.antigravity.erp.modules.attendance.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@IdClass(MonthlyPayrollId.class)
@Table(name = "monthly_payroll")
public class MonthlyPayroll {
    @Id
    @Column(name = "gr_no", nullable = false)
    private String grNo;

    @Id
    @Column(nullable = false)
    private Integer month;

    @Id
    @Column(nullable = false)
    private Integer year;

    private BigDecimal rate;
    private BigDecimal totalUnits;
    private BigDecimal grossSalary;
    private BigDecimal siteAdvance;
    private BigDecimal onlineAdvance;
    private BigDecimal totalAdvance;
    private BigDecimal netBalance;
    private BigDecimal debitBalance;
}
