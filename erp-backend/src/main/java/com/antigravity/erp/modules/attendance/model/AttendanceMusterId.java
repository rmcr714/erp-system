package com.antigravity.erp.modules.attendance.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceMusterId implements Serializable {
    private String grNo;
    private Integer month;
    private Integer year;
}
