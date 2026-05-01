package com.antigravity.erp.modules.attendance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkerPresenceDTO {
    private String grNo;
    private String name;
    private String designation;
    private Double units;
    private Integer day;
}
