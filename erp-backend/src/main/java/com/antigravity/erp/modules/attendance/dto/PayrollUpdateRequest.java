package com.antigravity.erp.modules.attendance.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class PayrollUpdateRequest {
    private String grNo;
    private Integer month;
    private Integer year;
    private BigDecimal rate;
    private BigDecimal siteAdvance;
    private BigDecimal onlineAdvance;
    private BigDecimal debitBalance;
}
