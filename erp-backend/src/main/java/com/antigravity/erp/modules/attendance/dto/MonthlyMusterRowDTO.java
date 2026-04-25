package com.antigravity.erp.modules.attendance.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
public class MonthlyMusterRowDTO {
    private String grNo;
    private String name;
    private String designation;
    private String bankName;
    private String accountNo;
    private String ifscCode;
    
    private BigDecimal salaryPerDay;
    private Map<Integer, Double> attendance; // Day -> Units
    
    private BigDecimal totalSalary;
    private BigDecimal siteAdvance;
    private BigDecimal onlineAdvance;
    private BigDecimal totalAdvance;
    private BigDecimal closingBalance;
    private BigDecimal debitBalance;
}
