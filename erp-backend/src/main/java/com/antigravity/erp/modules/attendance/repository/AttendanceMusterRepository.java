package com.antigravity.erp.modules.attendance.repository;

import com.antigravity.erp.modules.attendance.model.AttendanceMuster;
import com.antigravity.erp.modules.attendance.model.AttendanceMusterId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface AttendanceMusterRepository extends JpaRepository<AttendanceMuster, AttendanceMusterId> {
    Optional<AttendanceMuster> findByGrNoAndMonthAndYear(String grNo, Integer month, Integer year);
    List<AttendanceMuster> findByMonthAndYear(Integer month, Integer year);
}
