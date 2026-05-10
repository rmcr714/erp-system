package com.antigravity.erp.modules.attendance.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@IdClass(DailyAttendanceId.class)
@Table(name = "daily_attendance_search",
       indexes = {
           @Index(name = "idx_daily_att_date", columnList = "work_date"),
           @Index(name = "idx_daily_att_gr", columnList = "gr_no"),
           @Index(name = "idx_daily_att_worker", columnList = "worker_id"),
           @Index(name = "idx_daily_att_site", columnList = "site_id")
       })
public class DailyAttendance {
    @Id
    @Column(name = "worker_id", nullable = false)
    private Long workerId;

    @Id
    @Column(name = "site_id", nullable = false)
    private Long siteId;

    @Column(name = "gr_no", nullable = false, length = 50)
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "worker_id", insertable = false, updatable = false)
    private com.antigravity.erp.modules.labor.model.Laborer laborer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "site_id", insertable = false, updatable = false)
    private com.antigravity.erp.modules.site.model.Site site;
}
