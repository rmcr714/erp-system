package com.antigravity.erp.modules.labor.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExcelImportResultDTO {

    private int totalRows;
    private int validCount;
    private int errorCount;

    private List<LaborerDTO> validRows;
    private List<RowError> errors;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RowError {
        private int rowNumber;   // 1-based (matching Excel row)
        private String grNo;     // may be blank if the GR No cell itself was empty
        private String message;  // human-readable reason
    }
}
