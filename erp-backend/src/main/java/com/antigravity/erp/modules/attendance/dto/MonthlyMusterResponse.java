package com.antigravity.erp.modules.attendance.dto;

import lombok.Builder;
import lombok.Data;
import org.springframework.data.domain.Page;
import java.math.BigDecimal;

@Data
@Builder
public class MonthlyMusterResponse {
    private Page<MonthlyMusterRowDTO> page;
    private MonthlyTotals totals;

    @Data
    @Builder
    public static class MonthlyTotals {
        private BigDecimal grossSalary;
        private BigDecimal totalAdvance;
        private BigDecimal netBalance;
        private BigDecimal debitBalance;
    }
}
