package com.antigravity.erp.modules.attendance.controller;

import com.antigravity.erp.modules.attendance.dto.AttendanceSaveRequest;
import com.antigravity.erp.modules.attendance.dto.MonthlyMusterRowDTO;
import com.antigravity.erp.modules.attendance.dto.PayrollUpdateRequest;
import com.antigravity.erp.modules.attendance.dto.WorkerPresenceDTO;
import com.antigravity.erp.modules.attendance.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.antigravity.erp.modules.attendance.dto.MonthlyMusterResponse;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AttendanceController {

    private final AttendanceService attendanceService;

    @GetMapping("/muster")
    public ResponseEntity<MonthlyMusterResponse> getMonthlyMuster(
            @RequestParam(name = "month") Integer month,
            @RequestParam(name = "year") Integer year,
            @RequestParam(name = "siteId") Long siteId,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "100") int size) {
        System.out.println("Fetching attendance muster for: " + month + "/" + year + " page: " + page);
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(attendanceService.getMonthlyMuster(month, year, siteId, pageable));
    }

    @PostMapping("/start-month")
    public ResponseEntity<String> startMonth(
            @RequestParam(name = "month") Integer month,
            @RequestParam(name = "year") Integer year,
            @RequestParam(name = "siteId") Long siteId) {
        attendanceService.startMonth(month, year, siteId);
        return ResponseEntity.ok("Month started successfully");
    }

    @PostMapping("/save")
    public ResponseEntity<String> saveAttendance(@RequestBody AttendanceSaveRequest request) {
        attendanceService.saveAttendance(
                request.getGrNo(),
                request.getSiteId(),
                request.getMonth(),
                request.getYear(),
                request.getDailyUpdates()
        );
        return ResponseEntity.ok("Attendance saved successfully");
    }
    
    @PostMapping("/save-batch")
    public ResponseEntity<String> saveBatchAttendance(@RequestBody List<AttendanceSaveRequest> requests) {
        attendanceService.saveBatchAttendance(requests);
        return ResponseEntity.ok("Batch attendance saved successfully");
    }

    @PostMapping("/rate")
    public ResponseEntity<String> updateRate(
            @RequestParam(name = "grNo") String grNo,
            @RequestParam(name = "siteId") Long siteId,
            @RequestParam(name = "month") Integer month,
            @RequestParam(name = "year") Integer year,
            @RequestParam(name = "rate") java.math.BigDecimal rate) {
        attendanceService.updateRate(grNo, siteId, month, year, rate);
        return ResponseEntity.ok("Rate updated successfully");
    }

    @PostMapping("/payroll")
    public ResponseEntity<String> updatePayroll(@RequestBody PayrollUpdateRequest request) {
        attendanceService.updatePayroll(request);
        return ResponseEntity.ok("Payroll updated successfully");
    }

    @PostMapping("/payroll/batch")
    public ResponseEntity<String> updatePayrollBatch(@RequestBody List<PayrollUpdateRequest> requests) {
        attendanceService.updatePayrollBatch(requests);
        return ResponseEntity.ok("Payroll batch updated successfully");
    }

    @GetMapping("/worker-presence")
    public ResponseEntity<Page<WorkerPresenceDTO>> getWorkerPresence(
            @RequestParam(name = "day", required = false) Integer day,
            @RequestParam(name = "month", required = false) Integer month,
            @RequestParam(name = "year", required = false) Integer year,
            @RequestParam(name = "siteId") Long siteId,
            @RequestParam(name = "grNo", required = false) String grNo,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(attendanceService.getWorkerPresence(day, month, year, siteId, grNo, pageable));
    }
}
