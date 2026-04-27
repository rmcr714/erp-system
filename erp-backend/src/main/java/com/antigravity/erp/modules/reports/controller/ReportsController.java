package com.antigravity.erp.modules.reports.controller;

import com.antigravity.erp.modules.reports.dto.LaborCostAnalyticsDto;
import com.antigravity.erp.modules.attendance.repository.MonthlyPayrollRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReportsController {

    private final MonthlyPayrollRepository monthlyPayrollRepository;

    @GetMapping("/analytics/labor-cost")
    public ResponseEntity<List<LaborCostAnalyticsDto>> getLaborCostAnalytics() {
        int startYear = java.time.LocalDate.now().getYear() - 5;
        return ResponseEntity.ok(monthlyPayrollRepository.getLaborCostAnalytics(startYear));
    }
}
