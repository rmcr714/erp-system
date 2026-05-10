package com.antigravity.erp.modules.attendance.repository;

import com.antigravity.erp.modules.attendance.model.DailyAttendance;
import com.antigravity.erp.modules.attendance.model.DailyAttendanceId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface DailyAttendanceRepository extends JpaRepository<DailyAttendance, DailyAttendanceId> {
    Optional<DailyAttendance> findByWorkerIdAndSiteIdAndYearAndMonthAndDay(Long workerId, Long siteId, Integer year, Integer month, Integer day);
    Page<DailyAttendance> findByYearAndMonthAndDay(Integer year, Integer month, Integer day, Pageable pageable);
    Page<DailyAttendance> findBySiteIdAndYearAndMonthAndDay(Long siteId, Integer year, Integer month, Integer day, Pageable pageable);
    Page<DailyAttendance> findByWorkerIdAndSiteIdAndYearAndMonth(Long workerId, Long siteId, Integer year, Integer month, Pageable pageable);
    Page<DailyAttendance> findByYearAndMonth(Integer year, Integer month, Pageable pageable);
    Page<DailyAttendance> findBySiteIdAndYearAndMonth(Long siteId, Integer year, Integer month, Pageable pageable);
    Page<DailyAttendance> findByWorkerIdAndSiteId(Long workerId, Long siteId, Pageable pageable);

    @Modifying
    @Query("UPDATE DailyAttendance d SET d.grNo = :grNo WHERE d.workerId = :workerId")
    int updateGrNoByWorkerId(@Param("workerId") Long workerId, @Param("grNo") String grNo);
}
