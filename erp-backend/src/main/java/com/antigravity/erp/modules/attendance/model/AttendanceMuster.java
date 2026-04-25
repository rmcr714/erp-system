package com.antigravity.erp.modules.attendance.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@IdClass(AttendanceMusterId.class)
@Table(name = "attendance_muster")
public class AttendanceMuster {
    @Id
    @Column(name = "gr_no", nullable = false)
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
}
