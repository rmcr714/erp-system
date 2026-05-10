package com.antigravity.erp.modules.attendance.repository;

import com.antigravity.erp.modules.attendance.model.AttendanceMuster;
import com.antigravity.erp.modules.attendance.model.AttendanceMusterId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface AttendanceMusterRepository extends JpaRepository<AttendanceMuster, AttendanceMusterId> {
    Optional<AttendanceMuster> findByWorkerIdAndSiteIdAndMonthAndYear(Long workerId, Long siteId, Integer month, Integer year);
    List<AttendanceMuster> findByMonthAndYear(Integer month, Integer year);
    List<AttendanceMuster> findBySiteIdAndMonthAndYear(Long siteId, Integer month, Integer year);

    @Modifying
    @Query("UPDATE AttendanceMuster m SET m.grNo = :grNo WHERE m.workerId = :workerId")
    int updateGrNoByWorkerId(@Param("workerId") Long workerId, @Param("grNo") String grNo);
}
