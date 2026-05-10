package com.antigravity.erp.modules.attendance.service;

import com.antigravity.erp.modules.attendance.dto.MonthlyMusterRowDTO;
import com.antigravity.erp.modules.attendance.dto.AttendanceSaveRequest;
import com.antigravity.erp.modules.attendance.dto.PayrollUpdateRequest;
import com.antigravity.erp.modules.attendance.dto.WorkerPresenceDTO;
import com.antigravity.erp.modules.attendance.model.*;
import com.antigravity.erp.modules.attendance.repository.*;
import com.antigravity.erp.modules.labor.enums.LaborerStatus;
import com.antigravity.erp.modules.labor.service.LaborerService;
import com.antigravity.erp.modules.labor.dto.LaborerDTO;
import com.antigravity.erp.modules.labor.model.Laborer;
import com.antigravity.erp.modules.labor.repository.LaborerRepository;
import com.antigravity.erp.modules.site.service.SiteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageImpl;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final LaborerService laborerService;
    private final LaborerRepository laborerRepository;
    private final AttendanceMusterRepository musterRepository;
    private final DailyAttendanceRepository dailyRepository;
    private final MonthlyPayrollRepository payrollRepository;
    private final SiteService siteService;

    @Transactional(readOnly = true)
    public List<MonthlyMusterRowDTO> getMonthlyMuster(Integer month, Integer year, Long siteId) {
        siteService.requireSite(siteId);
        List<AttendanceMuster> musters = musterRepository.findBySiteIdAndMonthAndYear(siteId, month, year);
        if (musters.isEmpty()) {
            return Collections.emptyList();
        }

        List<MonthlyPayroll> payrolls = payrollRepository.findBySiteIdAndMonthAndYear(siteId, month, year);
        List<Laborer> laborers = laborerRepository.findAll();
        
        Map<Long, MonthlyPayroll> payrollMap = payrolls.stream()
                .collect(Collectors.toMap(MonthlyPayroll::getWorkerId, p -> p));
        
        Map<Long, Laborer> laborerMap = laborers.stream()
                .collect(Collectors.toMap(Laborer::getId, l -> l));

        return musters.stream().map(muster -> {
            MonthlyPayroll payroll = payrollMap.get(muster.getWorkerId());
            Laborer laborer = laborerMap.get(muster.getWorkerId());

            String name = laborer != null ? laborer.getFullName() : "Unknown";
            String designation = laborer != null ? laborer.getDesignation() : "Unknown";
            Laborer.BankDetails bank = laborer != null ? laborer.getBankDetails() : null;

            Map<Integer, Double> attendance = muster.getAttendanceData() != null ? muster.getAttendanceData() : new HashMap<>();
            BigDecimal currentRate = (payroll != null && payroll.getRate() != null) 
                                     ? payroll.getRate() 
                                     : BigDecimal.ZERO;

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
                    .grNo(laborer != null ? laborer.getGrNo() : "")
                    .name(name)
                    .designation(designation)
                    .bankName(bank != null ? bank.getBankName() : "")
                    .accountNo(bank != null ? bank.getAccountNo() : "")
                    .ifscCode(bank != null ? bank.getIfscCode() : "")
                    .salaryPerDay(currentRate)
                    .attendance(attendance)
                    .totalSalary(totalSalary)
                    .siteAdvance(siteAdv)
                    .onlineAdvance(onlineAdv)
                    .totalAdvance(totalAdv)
                    .closingBalance(balance)
                    .debitBalance(debitBal)
                    .remarks(payroll != null && payroll.getRemarks() != null ? payroll.getRemarks() : "")
                    .isActive(muster.getIsActive())
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional
    public void startMonth(Integer month, Integer year, Long siteId) {
        siteService.requireSite(siteId);
        List<LaborerDTO> activeLaborers = getAttendanceLaborers(siteId);
        Integer prevMonth = month == 1 ? 12 : month - 1;
        Integer prevYear = month == 1 ? year - 1 : year;

        Map<Long, MonthlyPayroll> prevPayrolls = payrollRepository.findBySiteIdAndMonthAndYear(siteId, prevMonth, prevYear)
                .stream().collect(Collectors.toMap(MonthlyPayroll::getWorkerId, p -> p));

        for (LaborerDTO laborer : activeLaborers) {
            String grNo = laborer.getGrNo();
            Long workerId = laborer.getId();
            
            // 1. Ensure Muster exists
            if (!musterRepository.findByWorkerIdAndSiteIdAndMonthAndYear(workerId, siteId, month, year).isPresent()) {
                AttendanceMuster muster = AttendanceMuster.builder()
                        .workerId(workerId)
                        .siteId(siteId)
                        .grNo(grNo)
                        .month(month)
                        .year(year)
                        .attendanceData(new HashMap<>())
                        .isActive(true)
                        .build();
                musterRepository.save(muster);
            }

            // 2. Ensure Payroll exists
            if (!payrollRepository.findByWorkerIdAndSiteIdAndMonthAndYear(workerId, siteId, month, year).isPresent()) {
                MonthlyPayroll prevPayroll = prevPayrolls.get(workerId);
                BigDecimal rate = BigDecimal.ZERO;
                
                if (prevPayroll != null && prevPayroll.getRate() != null) {
                    rate = prevPayroll.getRate();
                } else if (laborer.getSalaryPerDay() != null) {
                    rate = laborer.getSalaryPerDay();
                }

                MonthlyPayroll payroll = MonthlyPayroll.builder()
                        .workerId(workerId)
                        .siteId(siteId)
                        .grNo(grNo)
                        .month(month)
                        .year(year)
                        .rate(rate)
                        .isActive(true)
                        .siteAdvance(BigDecimal.ZERO)
                        .onlineAdvance(BigDecimal.ZERO)
                        .totalAdvance(BigDecimal.ZERO)
                        .remarks("")
                        .build();
                payrollRepository.save(payroll);
            }
        }
    }

    @Transactional
    public void saveAttendance(String grNo, Long siteId, Integer month, Integer year, Map<Integer, Double> dailyUpdates) {
        siteService.requireSite(siteId);
        Map<String, LaborerDTO> laborerMap = getAttendanceLaborers(siteId).stream()
                .collect(Collectors.toMap(laborer -> normalizeGrNo(laborer.getGrNo()), laborer -> laborer));
        saveAttendance(grNo, siteId, month, year, dailyUpdates, laborerMap);
    }

    @Transactional
    public void saveBatchAttendance(List<AttendanceSaveRequest> requests) {
        if (requests == null || requests.isEmpty()) {
            return;
        }
        Long siteId = requests.get(0).getSiteId();
        siteService.requireSite(siteId);
        Map<String, LaborerDTO> laborerMap = getAttendanceLaborers(siteId).stream()
                .collect(Collectors.toMap(laborer -> normalizeGrNo(laborer.getGrNo()), laborer -> laborer));

        for (AttendanceSaveRequest request : requests) {
            saveAttendance(
                    request.getGrNo(),
                    request.getSiteId(),
                    request.getMonth(),
                    request.getYear(),
                    request.getDailyUpdates(),
                    laborerMap
            );
        }
    }

    private void saveAttendance(String grNo, Long siteId, Integer month, Integer year, Map<Integer, Double> dailyUpdates,
                                Map<String, LaborerDTO> laborerMap) {
        try {
            LaborerDTO laborer = requireLaborer(grNo, laborerMap);
            Long workerId = laborer.getId();
            AttendanceMuster muster = musterRepository.findByWorkerIdAndSiteIdAndMonthAndYear(workerId, siteId, month, year)
                    .orElse(AttendanceMuster.builder()
                            .workerId(workerId)
                            .siteId(siteId)
                            .grNo(laborer.getGrNo())
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
                
                if (laborer != null) {
                    try {
                        updateDailyAttendance(laborer, siteId, year, month, day, units);
                    } catch (Exception e) {
                        throw new RuntimeException("Failed to update Daily Search record: " + e.getMessage());
                    }
                }
            }
            
            muster.setAttendanceData(currentData);
            muster.setGrNo(laborer.getGrNo());
            try {
                musterRepository.save(muster);
            } catch (Exception e) {
                throw new RuntimeException("Failed to update Attendance Muster: " + e.getMessage());
            }

            // Sync to Monthly Payroll
            try {
                syncMonthlyPayroll(workerId, siteId, month, year);
            } catch (Exception e) {
                throw new RuntimeException("Failed to update Monthly Payroll: " + e.getMessage());
            }
            
        } catch (Exception e) {
            System.err.println("Critical failure during Attendance Sync: " + e.getMessage());
            throw e; // Rethrow to trigger @Transactional rollback
        }
    }

    @Transactional
    public void updateRate(String grNo, Long siteId, Integer month, Integer year, BigDecimal newRate) {
        siteService.requireSite(siteId);
        Laborer laborer = findLaborerByGrNo(grNo);
        MonthlyPayroll payroll = payrollRepository.findByWorkerIdAndSiteIdAndMonthAndYear(laborer.getId(), siteId, month, year)
                .orElse(MonthlyPayroll.builder()
                        .workerId(laborer.getId())
                        .siteId(siteId)
                        .grNo(laborer.getGrNo())
                        .month(month)
                        .year(year)
                        .siteAdvance(BigDecimal.ZERO)
                        .onlineAdvance(BigDecimal.ZERO)
                        .totalAdvance(BigDecimal.ZERO)
                        .build());
        payroll.setRate(newRate);
        payroll.setGrNo(laborer.getGrNo());
        payrollRepository.save(payroll);
        
        // Re-sync to update totals based on new rate
        syncMonthlyPayroll(laborer.getId(), siteId, month, year);
    }

    @Transactional
    public void updatePayroll(PayrollUpdateRequest request) {
        MonthlyPayroll payroll = getOrCreatePayroll(
                request.getGrNo(),
                request.getSiteId(),
                request.getMonth(),
                request.getYear()
        );

        payroll.setRate(valueOrZero(request.getRate()));
        payroll.setGrNo(findLaborerById(payroll.getWorkerId()).getGrNo());
        payroll.setSiteAdvance(valueOrZero(request.getSiteAdvance()));
        payroll.setOnlineAdvance(valueOrZero(request.getOnlineAdvance()));
        payroll.setTotalAdvance(valueOrZero(request.getSiteAdvance()).add(valueOrZero(request.getOnlineAdvance())));
        payroll.setDebitBalance(valueOrZero(request.getDebitBalance()));
        payroll.setRemarks(request.getRemarks() != null ? request.getRemarks() : "");
        payrollRepository.save(payroll);

        recalculatePayrollTotals(payroll.getWorkerId(), payroll.getSiteId(), request.getMonth(), request.getYear());
    }

    @Transactional
    public void updatePayrollBatch(List<PayrollUpdateRequest> requests) {
        for (PayrollUpdateRequest request : requests) {
            MonthlyPayroll payroll = getOrCreatePayroll(
                    request.getGrNo(),
                    request.getSiteId(),
                    request.getMonth(),
                    request.getYear()
            );

            payroll.setRate(valueOrZero(request.getRate()));
            payroll.setGrNo(findLaborerById(payroll.getWorkerId()).getGrNo());
            payroll.setSiteAdvance(valueOrZero(request.getSiteAdvance()));
            payroll.setOnlineAdvance(valueOrZero(request.getOnlineAdvance()));
            payroll.setTotalAdvance(valueOrZero(request.getSiteAdvance()).add(valueOrZero(request.getOnlineAdvance())));
            payroll.setDebitBalance(valueOrZero(request.getDebitBalance()));
            payroll.setRemarks(request.getRemarks() != null ? request.getRemarks() : "");
            payrollRepository.save(payroll);

            recalculatePayrollTotals(payroll.getWorkerId(), payroll.getSiteId(), request.getMonth(), request.getYear());
        }
    }

    private void recalculatePayrollTotals(Long workerId, Long siteId, Integer month, Integer year) {
        AttendanceMuster muster = musterRepository.findByWorkerIdAndSiteIdAndMonthAndYear(workerId, siteId, month, year).orElse(null);
        MonthlyPayroll payroll = getOrCreatePayroll(workerId, siteId, month, year);

        Map<Integer, Double> attendanceData = (muster != null && muster.getAttendanceData() != null) 
                ? muster.getAttendanceData() 
                : new HashMap<>();
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
        payroll.setGrNo(findLaborerById(workerId).getGrNo());
        payroll.setGrossSalary(grossSalary);
        payroll.setTotalAdvance(totalAdvance);
        payroll.setNetBalance(grossSalary.subtract(totalAdvance).subtract(debitBalance));
        payroll.setDebitBalance(debitBalance);
        payrollRepository.save(payroll);
    }

    private void syncMonthlyPayroll(Long workerId, Long siteId, Integer month, Integer year) {
        AttendanceMuster muster = musterRepository.findByWorkerIdAndSiteIdAndMonthAndYear(workerId, siteId, month, year).orElse(null);
        MonthlyPayroll payroll = payrollRepository.findByWorkerIdAndSiteIdAndMonthAndYear(workerId, siteId, month, year)
                .orElse(MonthlyPayroll.builder()
                        .workerId(workerId)
                        .siteId(siteId)
                        .grNo(findLaborerById(workerId).getGrNo())
                        .month(month)
                        .year(year)
                        .siteAdvance(BigDecimal.ZERO)
                        .onlineAdvance(BigDecimal.ZERO)
                        .totalAdvance(BigDecimal.ZERO)
                        .build());

        // Rate is strictly maintained in the payroll record now.
        // It should either be set on month creation or manually via the rate update endpoint.

        // 1. Calculate Units and Gross
        Map<Integer, Double> attendanceData = (muster != null && muster.getAttendanceData() != null) 
                ? muster.getAttendanceData() 
                : new HashMap<>();
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
        BigDecimal netBalance = grossSalary.subtract(totalAdv).subtract(debitBalance);

        // 4. Update Payroll Record
        payroll.setTotalUnits(BigDecimal.valueOf(totalUnits));
        payroll.setGrNo(findLaborerById(workerId).getGrNo());
        payroll.setGrossSalary(grossSalary);
        payroll.setSiteAdvance(siteAdv);
        payroll.setOnlineAdvance(onlineAdv);
        payroll.setTotalAdvance(totalAdv);
        payroll.setNetBalance(netBalance);
        payroll.setDebitBalance(debitBalance);
        
        payrollRepository.save(payroll);
    }

    private void updateDailyAttendance(LaborerDTO laborer, Long siteId, Integer year, Integer month, Integer day, Double units) {
        DailyAttendance daily = dailyRepository.findByWorkerIdAndSiteIdAndYearAndMonthAndDay(laborer.getId(), siteId, year, month, day)
                .orElse(DailyAttendance.builder()
                        .workerId(laborer.getId())
                        .siteId(siteId)
                        .grNo(laborer.getGrNo())
                        .name(laborer.getFullName())
                        .designation(laborer.getDesignation())
                        .year(year)
                        .month(month)
                        .day(day)
                        .workDate(LocalDate.of(year, month, day))
                        .build());

        daily.setUnits(units);
        daily.setGrNo(laborer.getGrNo());
        daily.setName(laborer.getFullName());
        daily.setDesignation(laborer.getDesignation());
        
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

    private MonthlyPayroll getOrCreatePayroll(String grNo, Long siteId, Integer month, Integer year) {
        siteService.requireSite(siteId);
        Laborer laborer = findLaborerByGrNo(grNo);
        return getOrCreatePayroll(laborer.getId(), siteId, month, year);
    }

    private MonthlyPayroll getOrCreatePayroll(Long workerId, Long siteId, Integer month, Integer year) {
        return payrollRepository.findByWorkerIdAndSiteIdAndMonthAndYear(workerId, siteId, month, year)
                .orElse(MonthlyPayroll.builder()
                        .workerId(workerId)
                        .siteId(siteId)
                        .grNo(findLaborerById(workerId).getGrNo())
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

    private LaborerDTO requireLaborer(String grNo, Map<String, LaborerDTO> laborerMap) {
        LaborerDTO laborer = laborerMap.get(normalizeGrNo(grNo));
        if (laborer == null || laborer.getId() == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Laborer with GR No " + grNo + " not found.");
        }
        return laborer;
    }

    private Laborer findLaborerByGrNo(String grNo) {
        return laborerRepository.findByGrNoIgnoreCase(normalizeGrNo(grNo))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Laborer with GR No " + grNo + " not found."));
    }

    private Laborer findLaborerById(Long workerId) {
        return laborerRepository.findById(workerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Laborer with id " + workerId + " not found."));
    }

    private String normalizeGrNo(String grNo) {
        return grNo != null ? grNo.trim().toUpperCase() : "";
    }

    public Page<WorkerPresenceDTO> getWorkerPresence(Integer day, Integer month, Integer year, Long siteId, String grNo, Pageable pageable) {
        siteService.requireSite(siteId);
        Page<DailyAttendance> attendancePage;
        
        boolean hasGrNo = grNo != null && !grNo.trim().isEmpty();
        boolean hasDay = day != null && day > 0;
        boolean hasMonth = month != null && month > 0;
        boolean hasYear = year != null && year > 0;

        Long workerId = hasGrNo ? findLaborerByGrNo(grNo).getId() : null;

        if (hasGrNo && !hasMonth && !hasYear) {
            attendancePage = dailyRepository.findByWorkerIdAndSiteId(workerId, siteId, pageable);
        } else if (hasDay && hasMonth && hasYear) {
            if (hasGrNo) {
                attendancePage = dailyRepository.findByWorkerIdAndSiteIdAndYearAndMonthAndDay(workerId, siteId, year, month, day)
                        .map(attendance -> (Page<DailyAttendance>) new PageImpl<>(Collections.singletonList(attendance), pageable, 1))
                        .orElseGet(() -> Page.empty(pageable));
            } else {
                attendancePage = dailyRepository.findBySiteIdAndYearAndMonthAndDay(siteId, year, month, day, pageable);
            }
        } else if (hasMonth && hasYear) {
            if (hasGrNo) {
                attendancePage = dailyRepository.findByWorkerIdAndSiteIdAndYearAndMonth(workerId, siteId, year, month, pageable);
            } else {
                attendancePage = dailyRepository.findBySiteIdAndYearAndMonth(siteId, year, month, pageable);
            }
        } else {
            return Page.empty(pageable);
        }

        List<WorkerPresenceDTO> dtos = attendancePage.getContent().stream()
                .map((DailyAttendance attendance) -> {
                    Laborer laborer = laborerRepository.findById(attendance.getWorkerId()).orElse(null);
                    return WorkerPresenceDTO.builder()
                            .grNo(laborer != null ? laborer.getGrNo() : "")
                            .name(laborer != null ? laborer.getFullName() : "Unknown")
                            .designation(laborer != null ? laborer.getDesignation() : "N/A")
                            .units(attendance.getUnits())
                            .day(attendance.getDay())
                            .build();
                })
                .collect(Collectors.toList());
        
        return new PageImpl<>(dtos, pageable, attendancePage.getTotalElements());
    }

    private List<LaborerDTO> getAttendanceLaborers(Long siteId) {
        return laborerService.getAllLaborers().stream()
                .filter(l -> Objects.equals(l.getCurrentSiteId(), siteId))
                .filter(l -> l.getStatus() == com.antigravity.erp.modules.labor.enums.LaborerStatus.ACTIVE || 
                            l.getStatus() == com.antigravity.erp.modules.labor.enums.LaborerStatus.ON_LEAVE)
                .collect(Collectors.toList());
    }
}
