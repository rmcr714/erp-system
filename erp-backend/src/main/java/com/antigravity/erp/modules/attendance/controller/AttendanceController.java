package com.antigravity.erp.modules.attendance.controller;

import com.antigravity.erp.modules.attendance.dto.AttendanceSaveRequest;
import com.antigravity.erp.modules.attendance.dto.MonthlyMusterRowDTO;
import com.antigravity.erp.modules.attendance.dto.PayrollUpdateRequest;
import com.antigravity.erp.modules.attendance.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AttendanceController {

    private final AttendanceService attendanceService;

    @GetMapping("/muster")
    public ResponseEntity<List<MonthlyMusterRowDTO>> getMonthlyMuster(
            @RequestParam(name = "month") Integer month,
            @RequestParam(name = "year") Integer year) {
        System.out.println("Fetching attendance muster for: " + month + "/" + year);
        return ResponseEntity.ok(attendanceService.getMonthlyMuster(month, year));
    }

    @PostMapping("/start-month")
    public ResponseEntity<String> startMonth(
            @RequestParam(name = "month") Integer month,
            @RequestParam(name = "year") Integer year) {
        attendanceService.startMonth(month, year);
        return ResponseEntity.ok("Month started successfully");
    }

    @PostMapping("/save")
    public ResponseEntity<String> saveAttendance(@RequestBody AttendanceSaveRequest request) {
        attendanceService.saveAttendance(
                request.getGrNo(),
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
            @RequestParam(name = "month") Integer month,
            @RequestParam(name = "year") Integer year,
            @RequestParam(name = "rate") java.math.BigDecimal rate) {
        attendanceService.updateRate(grNo, month, year, rate);
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
}
