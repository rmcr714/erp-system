package com.antigravity.erp.modules.attendance.repository;

import com.antigravity.erp.modules.attendance.model.DailyAttendance;
import com.antigravity.erp.modules.attendance.model.DailyAttendanceId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface DailyAttendanceRepository extends JpaRepository<DailyAttendance, DailyAttendanceId> {
    Optional<DailyAttendance> findByGrNoAndYearAndMonthAndDay(String grNo, Integer year, Integer month, Integer day);
    Page<DailyAttendance> findByYearAndMonthAndDay(Integer year, Integer month, Integer day, Pageable pageable);
    Page<DailyAttendance> findByGrNoAndYearAndMonth(String grNo, Integer year, Integer month, Pageable pageable);
    Page<DailyAttendance> findByYearAndMonth(Integer year, Integer month, Pageable pageable);
    Page<DailyAttendance> findByGrNo(String grNo, Pageable pageable);
}
