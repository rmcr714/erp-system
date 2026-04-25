package com.antigravity.erp.modules.attendance.service;

import com.antigravity.erp.modules.attendance.dto.MonthlyMusterRowDTO;
import com.antigravity.erp.modules.attendance.dto.AttendanceSaveRequest;
import com.antigravity.erp.modules.attendance.dto.PayrollUpdateRequest;
import com.antigravity.erp.modules.attendance.model.*;
import com.antigravity.erp.modules.attendance.repository.*;
import com.antigravity.erp.modules.labor.enums.LaborerStatus;
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
        List<LaborerDTO> laborers = getAttendanceLaborers();
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
            BigDecimal debitBal = (payroll != null && payroll.getDebitBalance() != null) 
                                  ? payroll.getDebitBalance() 
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
                    .debitBalance(debitBal)
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional
    public void saveAttendance(String grNo, Integer month, Integer year, Map<Integer, Double> dailyUpdates) {
        Map<String, LaborerDTO> laborerMap = getAttendanceLaborers().stream()
                .collect(Collectors.toMap(LaborerDTO::getGrNo, laborer -> laborer));
        saveAttendance(grNo, month, year, dailyUpdates, laborerMap);
    }

    @Transactional
    public void saveBatchAttendance(List<AttendanceSaveRequest> requests) {
        Map<String, LaborerDTO> laborerMap = getAttendanceLaborers().stream()
                .collect(Collectors.toMap(LaborerDTO::getGrNo, laborer -> laborer));

        for (AttendanceSaveRequest request : requests) {
            saveAttendance(
                    request.getGrNo(),
                    request.getMonth(),
                    request.getYear(),
                    request.getDailyUpdates(),
                    laborerMap
            );
        }
    }

    private void saveAttendance(String grNo, Integer month, Integer year, Map<Integer, Double> dailyUpdates,
                                Map<String, LaborerDTO> laborerMap) {
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
            
            Map<Integer, Double> updates = dailyUpdates != null ? dailyUpdates : new HashMap<>();
            for (Map.Entry<Integer, Double> entry : updates.entrySet()) {
                Integer day = entry.getKey();
                Double units = entry.getValue();
                currentData.put(day, units);
                
                LaborerDTO laborer = laborerMap.get(grNo);
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
                syncMonthlyPayroll(grNo, month, year, laborerMap);
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

    @Transactional
    public void updatePayroll(PayrollUpdateRequest request) {
        MonthlyPayroll payroll = getOrCreatePayroll(
                request.getGrNo(),
                request.getMonth(),
                request.getYear()
        );

        payroll.setRate(valueOrZero(request.getRate()));
        payroll.setSiteAdvance(valueOrZero(request.getSiteAdvance()));
        payroll.setOnlineAdvance(valueOrZero(request.getOnlineAdvance()));
        payroll.setTotalAdvance(valueOrZero(request.getSiteAdvance()).add(valueOrZero(request.getOnlineAdvance())));
        payroll.setDebitBalance(valueOrZero(request.getDebitBalance()));
        payrollRepository.save(payroll);

        recalculatePayrollTotals(request.getGrNo(), request.getMonth(), request.getYear());
    }

    @Transactional
    public void updatePayrollBatch(List<PayrollUpdateRequest> requests) {
        for (PayrollUpdateRequest request : requests) {
            MonthlyPayroll payroll = getOrCreatePayroll(
                    request.getGrNo(),
                    request.getMonth(),
                    request.getYear()
            );

            payroll.setRate(valueOrZero(request.getRate()));
            payroll.setSiteAdvance(valueOrZero(request.getSiteAdvance()));
            payroll.setOnlineAdvance(valueOrZero(request.getOnlineAdvance()));
            payroll.setTotalAdvance(valueOrZero(request.getSiteAdvance()).add(valueOrZero(request.getOnlineAdvance())));
            payroll.setDebitBalance(valueOrZero(request.getDebitBalance()));
            payrollRepository.save(payroll);

            recalculatePayrollTotals(request.getGrNo(), request.getMonth(), request.getYear());
        }
    }

    private void recalculatePayrollTotals(String grNo, Integer month, Integer year) {
        AttendanceMuster muster = musterRepository.findByGrNoAndMonthAndYear(grNo, month, year).orElse(null);
        MonthlyPayroll payroll = getOrCreatePayroll(grNo, month, year);

        Map<Integer, Double> attendanceData = muster != null ? muster.getAttendanceData() : new HashMap<>();
        double totalUnits = attendanceData.values().stream()
                .filter(Objects::nonNull)
                .mapToDouble(Double::doubleValue)
                .sum();

        BigDecimal grossSalary = payroll.getRate() != null
                ? payroll.getRate().multiply(BigDecimal.valueOf(totalUnits))
                : BigDecimal.ZERO;
        BigDecimal totalAdvance = valueOrZero(payroll.getSiteAdvance()).add(valueOrZero(payroll.getOnlineAdvance()));
        BigDecimal debitBalance = valueOrZero(payroll.getDebitBalance());

        payroll.setTotalUnits(BigDecimal.valueOf(totalUnits));
        payroll.setGrossSalary(grossSalary);
        payroll.setTotalAdvance(totalAdvance);
        payroll.setNetBalance(grossSalary.subtract(totalAdvance).subtract(debitBalance).max(BigDecimal.ZERO));
        payroll.setDebitBalance(debitBalance);
        payrollRepository.save(payroll);
    }

    private void syncMonthlyPayroll(String grNo, Integer month, Integer year) {
        syncMonthlyPayroll(grNo, month, year, null);
    }

    private void syncMonthlyPayroll(String grNo, Integer month, Integer year, Map<String, LaborerDTO> laborerMap) {
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
            LaborerDTO laborer = laborerMap != null
                    ? laborerMap.get(grNo)
                    : getAttendanceLaborers().stream()
                            .filter(l -> l.getGrNo().equals(grNo))
                            .findFirst()
                            .orElse(null);
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

        BigDecimal debitBalance = payroll.getDebitBalance() != null ? payroll.getDebitBalance() : BigDecimal.ZERO;
        BigDecimal netBalance = grossSalary.subtract(totalAdv).subtract(debitBalance).max(BigDecimal.ZERO);

        // 4. Update Payroll Record
        payroll.setTotalUnits(BigDecimal.valueOf(totalUnits));
        payroll.setGrossSalary(grossSalary);
        payroll.setSiteAdvance(siteAdv);
        payroll.setOnlineAdvance(onlineAdv);
        payroll.setTotalAdvance(totalAdv);
        payroll.setNetBalance(netBalance);
        payroll.setDebitBalance(debitBalance);
        
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

    private MonthlyPayroll getOrCreatePayroll(String grNo, Integer month, Integer year) {
        return payrollRepository.findByGrNoAndMonthAndYear(grNo, month, year)
                .orElse(MonthlyPayroll.builder()
                        .grNo(grNo)
                        .month(month)
                        .year(year)
                        .siteAdvance(BigDecimal.ZERO)
                        .onlineAdvance(BigDecimal.ZERO)
                        .totalAdvance(BigDecimal.ZERO)
                        .build());
    }

    private BigDecimal valueOrZero(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }

    private List<LaborerDTO> getAttendanceLaborers() {
        return laborerService.getAllLaborers().stream()
                .filter(laborer -> laborer.getStatus() != LaborerStatus.INACTIVE)
                .collect(Collectors.toList());
    }
}
