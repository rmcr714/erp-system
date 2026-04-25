package com.antigravity.erp.modules.attendance.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@IdClass(DailyAttendanceId.class)
@Table(name = "daily_attendance_search",
       indexes = {
           @Index(name = "idx_daily_att_date", columnList = "work_date"),
           @Index(name = "idx_daily_att_gr", columnList = "gr_no")
       })
public class DailyAttendance {
    @Id
    @Column(name = "gr_no", nullable = false)
    private String grNo;

    @Id
    private Integer day;

    @Id
    private Integer month;

    @Id
    private Integer year;

    private String name;
    private String designation;

    @Column(name = "work_date", nullable = false)
    private LocalDate workDate;

    private Double units; // e.g. 1.0 for full day, 0.5 for half
}
