package com.antigravity.erp.modules.reports.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LaborCostAnalyticsDto {
    private Integer month;
    private Integer year;
    private String designation;
    private BigDecimal totalGrossSalary;
}
