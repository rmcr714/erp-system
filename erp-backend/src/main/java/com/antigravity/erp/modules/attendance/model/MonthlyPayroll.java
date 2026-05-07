package com.antigravity.erp.modules.attendance.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.antigravity.erp.modules.labor.model.Laborer;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@IdClass(MonthlyPayrollId.class)
@Table(name = "monthly_payroll",
       indexes = {
           @Index(name = "idx_payroll_analytics", columnList = "year, month")
       })
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

    @Builder.Default
    @Column(nullable = false)
    private BigDecimal rate = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "total_units", nullable = false)
    private BigDecimal totalUnits = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "gross_salary", nullable = false)
    private BigDecimal grossSalary = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "site_advance", nullable = false)
    private BigDecimal siteAdvance = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "online_advance", nullable = false)
    private BigDecimal onlineAdvance = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "total_advance", nullable = false)
    private BigDecimal totalAdvance = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "net_balance", nullable = false)
    private BigDecimal netBalance = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "debit_balance", nullable = false)
    private BigDecimal debitBalance = BigDecimal.ZERO;

    @Builder.Default
    @Column(nullable = false)
    private String remarks = "";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gr_no", insertable = false, updatable = false)
    private Laborer laborer;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;
}
