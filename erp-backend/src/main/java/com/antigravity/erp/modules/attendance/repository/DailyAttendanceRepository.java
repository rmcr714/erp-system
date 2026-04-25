package com.antigravity.erp.modules.attendance.repository;

import com.antigravity.erp.modules.attendance.model.DailyAttendance;
import com.antigravity.erp.modules.attendance.model.DailyAttendanceId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface DailyAttendanceRepository extends JpaRepository<DailyAttendance, DailyAttendanceId> {
    Optional<DailyAttendance> findByGrNoAndYearAndMonthAndDay(String grNo, Integer year, Integer month, Integer day);
    List<DailyAttendance> findByYearAndMonthAndDay(Integer year, Integer month, Integer day);
    List<DailyAttendance> findByGrNoAndYearAndMonth(String grNo, Integer year, Integer month);
}
