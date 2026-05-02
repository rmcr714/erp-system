package com.antigravity.erp.modules.reports.controller;

import com.antigravity.erp.modules.reports.dto.DashboardStatsDto;
import com.antigravity.erp.modules.reports.dto.LaborCostAnalyticsDto;
import com.antigravity.erp.modules.reports.service.DashboardService;
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
    private final DashboardService dashboardService;

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStatsDto> getDashboardStats() {
        return ResponseEntity.ok(dashboardService.getDashboardStats());
    }

    @GetMapping("/analytics/labor-cost")
    public ResponseEntity<List<LaborCostAnalyticsDto>> getLaborCostAnalytics() {
        int startYear = java.time.LocalDate.now().getYear() - 5;
        return ResponseEntity.ok(monthlyPayrollRepository.getLaborCostAnalytics(startYear));
    }
}
