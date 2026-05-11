package com.antigravity.erp.modules.attendance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceSaveRequest {
    private String grNo;
    private Long siteId;
    private Integer month;
    private Integer year;
    private Map<Integer, Double> dailyUpdates; // Day -> Units
}
