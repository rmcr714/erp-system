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

    private BigDecimal rate;
    private BigDecimal totalUnits;
    private BigDecimal grossSalary;
    private BigDecimal siteAdvance;
    private BigDecimal onlineAdvance;
    private BigDecimal totalAdvance;
    private BigDecimal netBalance;
    private BigDecimal debitBalance;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gr_no", insertable = false, updatable = false)
    private Laborer laborer;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;
}
