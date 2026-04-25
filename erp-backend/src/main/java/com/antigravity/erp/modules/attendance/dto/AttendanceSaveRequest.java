package com.antigravity.erp.modules.attendance.dto;

import lombok.Data;
import java.util.Map;

@Data
public class AttendanceSaveRequest {
    private String grNo;
    private Integer month;
    private Integer year;
    private Map<Integer, Double> dailyUpdates; // Day -> Units
}
