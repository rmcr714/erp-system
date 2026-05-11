package com.antigravity.erp.modules.attendance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayrollUpdateRequest {
    private String grNo;
    private Long siteId;
    private Integer month;
    private Integer year;
    private BigDecimal rate;
    private BigDecimal siteAdvance;
    private BigDecimal onlineAdvance;
    private BigDecimal debitBalance;
    private String remarks;
}
