package com.antigravity.erp.modules.attendance.service;

import com.antigravity.erp.modules.attendance.dto.MonthlyMusterRowDTO;
import com.antigravity.erp.modules.attendance.model.*;
import com.antigravity.erp.modules.attendance.repository.*;
import com.antigravity.erp.modules.labor.service.LaborerService;
import com.antigravity.erp.modules.labor.dto.LaborerDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final LaborerService laborerService;
    private final AttendanceMusterRepository musterRepository;
    private final DailyAttendanceRepository dailyRepository;
    private final MonthlyPayrollRepository payrollRepository;

    @Transactional(readOnly = true)
    public List<MonthlyMusterRowDTO> getMonthlyMuster(Integer month, Integer year) {
        List<LaborerDTO> laborers = laborerService.getAllLaborers();
        List<AttendanceMuster> musters = musterRepository.findByMonthAndYear(month, year);
        List<MonthlyPayroll> payrolls = payrollRepository.findByMonthAndYear(month, year);
        
        Map<String, AttendanceMuster> musterMap = musters.stream()
                .collect(Collectors.toMap(AttendanceMuster::getGrNo, m -> m));
        Map<String, MonthlyPayroll> payrollMap = payrolls.stream()
                .collect(Collectors.toMap(MonthlyPayroll::getGrNo, p -> p));

        return laborers.stream().map(laborer -> {
            AttendanceMuster muster = musterMap.get(laborer.getGrNo());
            MonthlyPayroll payroll = payrollMap.get(laborer.getGrNo());

            Map<Integer, Double> attendance = muster != null ? muster.getAttendanceData() : new HashMap<>();
            BigDecimal currentRate = (payroll != null && payroll.getRate() != null) 
                                     ? payroll.getRate() 
                                     : laborer.getSalaryPerDay();

            BigDecimal totalSalary = (payroll != null && payroll.getGrossSalary() != null) 
                                     ? payroll.getGrossSalary() 
                                     : BigDecimal.ZERO;
            BigDecimal siteAdv = (payroll != null && payroll.getSiteAdvance() != null) 
                                  ? payroll.getSiteAdvance() 
                                  : BigDecimal.ZERO;
            BigDecimal onlineAdv = (payroll != null && payroll.getOnlineAdvance() != null) 
                                    ? payroll.getOnlineAdvance() 
                                    : BigDecimal.ZERO;
            BigDecimal totalAdv = siteAdv.add(onlineAdv);
            BigDecimal balance = (payroll != null && payroll.getNetBalance() != null) 
                                 ? payroll.getNetBalance() 
                                 : BigDecimal.ZERO;

            return MonthlyMusterRowDTO.builder()
                    .grNo(laborer.getGrNo())
                    .name(laborer.getFullName())
                    .designation(laborer.getDesignation())
                    .bankName(laborer.getBankDetails() != null ? laborer.getBankDetails().getBankName() : "")
                    .accountNo(laborer.getBankDetails() != null ? laborer.getBankDetails().getAccountNo() : "")
                    .ifscCode(laborer.getBankDetails() != null ? laborer.getBankDetails().getIfscCode() : "")
                    .salaryPerDay(currentRate)
                    .attendance(attendance)
                    .totalSalary(totalSalary)
                    .siteAdvance(siteAdv)
                    .onlineAdvance(onlineAdv)
                    .totalAdvance(totalAdv)
                    .closingBalance(balance)
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional
    public void saveAttendance(String grNo, Integer month, Integer year, Map<Integer, Double> dailyUpdates) {
        try {
            AttendanceMuster muster = musterRepository.findByGrNoAndMonthAndYear(grNo, month, year)
                    .orElse(AttendanceMuster.builder()
                            .grNo(grNo)
                            .month(month)
                            .year(year)
                            .attendanceData(new HashMap<>())
                            .build());

            Map<Integer, Double> currentData = muster.getAttendanceData();
            if (currentData == null) currentData = new HashMap<>();
            
            for (Map.Entry<Integer, Double> entry : dailyUpdates.entrySet()) {
                Integer day = entry.getKey();
                Double units = entry.getValue();
                currentData.put(day, units);
                
                List<LaborerDTO> all = laborerService.getAllLaborers();
                LaborerDTO laborer = all.stream().filter(l -> l.getGrNo().equals(grNo)).findFirst().orElse(null);
                if (laborer != null) {
                    try {
                        updateDailyAttendance(laborer, year, month, day, units);
                    } catch (Exception e) {
                        throw new RuntimeException("Failed to update Daily Search record: " + e.getMessage());
                    }
                }
            }
            
            muster.setAttendanceData(currentData);
            try {
                musterRepository.save(muster);
            } catch (Exception e) {
                throw new RuntimeException("Failed to update Attendance Muster: " + e.getMessage());
            }

            // Sync to Monthly Payroll
            try {
                syncMonthlyPayroll(grNo, month, year);
            } catch (Exception e) {
                throw new RuntimeException("Failed to update Monthly Payroll: " + e.getMessage());
            }
            
        } catch (Exception e) {
            System.err.println("Critical failure during Attendance Sync: " + e.getMessage());
            throw e; // Rethrow to trigger @Transactional rollback
        }
    }

    @Transactional
    public void updateRate(String grNo, Integer month, Integer year, BigDecimal newRate) {
        MonthlyPayroll payroll = payrollRepository.findByGrNoAndMonthAndYear(grNo, month, year)
                .orElse(MonthlyPayroll.builder()
                        .grNo(grNo)
                        .month(month)
                        .year(year)
                        .siteAdvance(BigDecimal.ZERO)
                        .onlineAdvance(BigDecimal.ZERO)
                        .totalAdvance(BigDecimal.ZERO)
                        .build());
        payroll.setRate(newRate);
        payrollRepository.save(payroll);
        
        // Re-sync to update totals based on new rate
        syncMonthlyPayroll(grNo, month, year);
    }

    private void syncMonthlyPayroll(String grNo, Integer month, Integer year) {
        AttendanceMuster muster = musterRepository.findByGrNoAndMonthAndYear(grNo, month, year).orElse(null);
        MonthlyPayroll payroll = payrollRepository.findByGrNoAndMonthAndYear(grNo, month, year)
                .orElse(MonthlyPayroll.builder()
                        .grNo(grNo)
                        .month(month)
                        .year(year)
                        .siteAdvance(BigDecimal.ZERO)
                        .onlineAdvance(BigDecimal.ZERO)
                        .totalAdvance(BigDecimal.ZERO)
                        .build());

        // Use profile rate if not set in payroll
        if (payroll.getRate() == null) {
            List<LaborerDTO> all = laborerService.getAllLaborers();
            LaborerDTO laborer = all.stream().filter(l -> l.getGrNo().equals(grNo)).findFirst().orElse(null);
            if (laborer != null) payroll.setRate(laborer.getSalaryPerDay());
        }

        // 1. Calculate Units and Gross
        Map<Integer, Double> attendanceData = muster != null ? muster.getAttendanceData() : new HashMap<>();
        double totalUnits = attendanceData.values().stream()
                .filter(Objects::nonNull)
                .mapToDouble(Double::doubleValue)
                .sum();
        
        BigDecimal grossSalary = payroll.getRate() != null 
                ? payroll.getRate().multiply(BigDecimal.valueOf(totalUnits)) 
                : BigDecimal.ZERO;

        // 2. We no longer fetch advances from a separate table.
        // We use whatever is already in the 'payroll' record (set "somewhere else").
        BigDecimal siteAdv = payroll.getSiteAdvance() != null ? payroll.getSiteAdvance() : BigDecimal.ZERO;
        BigDecimal onlineAdv = payroll.getOnlineAdvance() != null ? payroll.getOnlineAdvance() : BigDecimal.ZERO;
        BigDecimal totalAdv = siteAdv.add(onlineAdv);

        // 3. Update Payroll Record
        payroll.setTotalUnits(BigDecimal.valueOf(totalUnits));
        payroll.setGrossSalary(grossSalary);
        payroll.setSiteAdvance(siteAdv);
        payroll.setOnlineAdvance(onlineAdv);
        payroll.setTotalAdvance(totalAdv);
        payroll.setNetBalance(grossSalary.subtract(totalAdv));
        
        payrollRepository.save(payroll);
    }

    private void updateDailyAttendance(LaborerDTO laborer, Integer year, Integer month, Integer day, Double units) {
        DailyAttendance daily = dailyRepository.findByGrNoAndYearAndMonthAndDay(laborer.getGrNo(), year, month, day)
                .orElse(DailyAttendance.builder()
                        .grNo(laborer.getGrNo())
                        .name(laborer.getFullName())
                        .designation(laborer.getDesignation())
                        .year(year)
                        .month(month)
                        .day(day)
                        .workDate(LocalDate.of(year, month, day))
                        .build());

        daily.setUnits(units);
        
        dailyRepository.save(daily);
    }

    private BigDecimal calculateTotalSalary(Map<Integer, Double> attendanceData, BigDecimal rate) {
        if (attendanceData == null || rate == null) return BigDecimal.ZERO;
        
        double totalUnits = attendanceData.values().stream()
                .filter(Objects::nonNull)
                .mapToDouble(Double::doubleValue)
                .sum();
                
        return rate.multiply(BigDecimal.valueOf(totalUnits));
    }
}
