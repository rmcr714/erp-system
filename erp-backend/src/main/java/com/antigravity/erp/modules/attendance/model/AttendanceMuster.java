package com.antigravity.erp.modules.attendance.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import com.antigravity.erp.modules.labor.model.Laborer;
import com.antigravity.erp.modules.site.model.Site;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@IdClass(AttendanceMusterId.class)
@Table(name = "attendance_muster",
       indexes = {
           @Index(name = "idx_muster_gr_no", columnList = "gr_no"),
           @Index(name = "idx_muster_worker", columnList = "worker_id"),
           @Index(name = "idx_muster_site", columnList = "site_id")
       })
public class AttendanceMuster {
    @Id
    @Column(name = "worker_id", nullable = false)
    private Long workerId;

    @Id
    @Column(name = "site_id", nullable = false)
    private Long siteId;

    @Column(name = "gr_no", nullable = false, length = 50)
    private String grNo;

    @Id
    @Column(nullable = false)
    private Integer month;

    @Id
    @Column(nullable = false)
    private Integer year;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "attendance_data", columnDefinition = "jsonb")
    private Map<Integer, Double> attendanceData;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "worker_id", insertable = false, updatable = false)
    private Laborer laborer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "site_id", insertable = false, updatable = false)
    private Site site;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;
}
