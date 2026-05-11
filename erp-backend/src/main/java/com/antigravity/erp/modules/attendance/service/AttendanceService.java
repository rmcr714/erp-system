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

import com.antigravity.erp.modules.attendance.dto.MonthlyMusterResponse;

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
    public MonthlyMusterResponse getMonthlyMuster(Integer month, Integer year, Long siteId, Pageable pageable) {
        siteService.requireSite(siteId);
        // Enforce consistent sorting: Designation then GR Number
        Page<AttendanceMuster> musterPage = musterRepository.findBySiteIdAndMonthAndYear(
                siteId, 
                month, 
                year, 
                org.springframework.data.domain.PageRequest.of(
                        pageable.getPageNumber(), 
                        pageable.getPageSize(), 
                        org.springframework.data.domain.Sort.by("laborer.designation").ascending().and(org.springframework.data.domain.Sort.by("grNo").ascending())
                )
        );
        
        // Calculate site-wide totals
        Object[] totalsData = (Object[]) payrollRepository.getSiteMonthlyTotals(siteId, month, year);
        MonthlyMusterResponse.MonthlyTotals totals = MonthlyMusterResponse.MonthlyTotals.builder()
                .grossSalary(BigDecimal.ZERO)
                .totalAdvance(BigDecimal.ZERO)
                .netBalance(BigDecimal.ZERO)
                .debitBalance(BigDecimal.ZERO)
                .build();

        if (totalsData != null && totalsData.length >= 4) {
            totals = MonthlyMusterResponse.MonthlyTotals.builder()
                    .grossSalary(totalsData[0] != null ? (BigDecimal) totalsData[0] : BigDecimal.ZERO)
                    .totalAdvance(totalsData[1] != null ? (BigDecimal) totalsData[1] : BigDecimal.ZERO)
                    .netBalance(totalsData[2] != null ? (BigDecimal) totalsData[2] : BigDecimal.ZERO)
                    .debitBalance(totalsData[3] != null ? (BigDecimal) totalsData[3] : BigDecimal.ZERO)
                    .build();
        }

        if (musterPage.isEmpty()) {
            return MonthlyMusterResponse.builder()
                    .page(Page.empty(pageable))
                    .totals(totals)
                    .build();
        }

        List<AttendanceMuster> musters = musterPage.getContent();
        Set<Long> workerIds = musters.stream().map(AttendanceMuster::getWorkerId).collect(Collectors.toSet());

        // Optimize: Only load laborers who are actually in the muster page
        List<Laborer> laborers = laborerRepository.findAllById(workerIds);
        Map<Long, Laborer> laborerMap = laborers.stream()
                .collect(Collectors.toMap(Laborer::getId, l -> l));

        List<MonthlyPayroll> payrolls = payrollRepository.findBySiteIdAndMonthAndYear(siteId, month, year);
        Map<Long, MonthlyPayroll> payrollMap = payrolls.stream()
                .collect(Collectors.toMap(MonthlyPayroll::getWorkerId, p -> p));

        List<MonthlyMusterRowDTO> rows = musters.stream().map(muster -> {
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

        return MonthlyMusterResponse.builder()
                .page(new PageImpl<>(rows, pageable, musterPage.getTotalElements()))
                .totals(totals)
                .build();
    }

    @Transactional
    public void startMonth(Integer month, Integer year, Long siteId) {
        siteService.requireSite(siteId);
        List<Laborer> activeLaborers = laborerRepository.findByCurrentSiteIdAndStatusIn(
                siteId, 
                Arrays.asList(LaborerStatus.ACTIVE, LaborerStatus.ON_LEAVE)
        );
        
        Integer prevMonth = month == 1 ? 12 : month - 1;
        Integer prevYear = month == 1 ? year - 1 : year;

        // Batch load previous payrolls to get rates
        Map<Long, MonthlyPayroll> prevPayrolls = payrollRepository.findBySiteIdAndMonthAndYear(siteId, prevMonth, prevYear)
                .stream().collect(Collectors.toMap(MonthlyPayroll::getWorkerId, p -> p));

        // Batch load current musters and payrolls to avoid duplicates
        Map<Long, AttendanceMuster> currentMusters = musterRepository.findBySiteIdAndMonthAndYear(siteId, month, year)
                .stream().collect(Collectors.toMap(AttendanceMuster::getWorkerId, m -> m));
        
        Map<Long, MonthlyPayroll> currentPayrolls = payrollRepository.findBySiteIdAndMonthAndYear(siteId, month, year)
                .stream().collect(Collectors.toMap(MonthlyPayroll::getWorkerId, p -> p));

        List<AttendanceMuster> mustersToSave = new ArrayList<>();
        List<MonthlyPayroll> payrollsToSave = new ArrayList<>();

        for (Laborer laborer : activeLaborers) {
            Long workerId = laborer.getId();
            String grNo = laborer.getGrNo();
            
            // 1. Ensure Muster exists
            if (!currentMusters.containsKey(workerId)) {
                mustersToSave.add(AttendanceMuster.builder()
                        .workerId(workerId)
                        .siteId(siteId)
                        .grNo(grNo)
                        .month(month)
                        .year(year)
                        .attendanceData(new HashMap<>())
                        .isActive(true)
                        .build());
            }

            // 2. Ensure Payroll exists
            if (!currentPayrolls.containsKey(workerId)) {
                MonthlyPayroll prevPayroll = prevPayrolls.get(workerId);
                BigDecimal rate = (prevPayroll != null && prevPayroll.getRate() != null) 
                                 ? prevPayroll.getRate() 
                                 : (laborer.getSalaryPerDay() != null ? laborer.getSalaryPerDay() : BigDecimal.ZERO);

                payrollsToSave.add(MonthlyPayroll.builder()
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
                        .build());
            }
        }
        
        if (!mustersToSave.isEmpty()) musterRepository.saveAll(mustersToSave);
        if (!payrollsToSave.isEmpty()) payrollRepository.saveAll(payrollsToSave);
    }

    @Transactional
    public void saveAttendance(String grNo, Long siteId, Integer month, Integer year, Map<Integer, Double> dailyUpdates) {
        saveBatchAttendance(Collections.singletonList(AttendanceSaveRequest.builder()
                .grNo(grNo).siteId(siteId).month(month).year(year).dailyUpdates(dailyUpdates).build()));
    }

    @Transactional
    public void saveBatchAttendance(List<AttendanceSaveRequest> requests) {
        if (requests == null || requests.isEmpty()) return;
        
        Long siteId = requests.get(0).getSiteId();
        Integer month = requests.get(0).getMonth();
        Integer year = requests.get(0).getYear();
        siteService.requireSite(siteId);

        // 1. Batch Load everything
        Map<String, Laborer> laborerMap = laborerRepository.findByCurrentSiteIdAndStatusIn(
                siteId, Arrays.asList(LaborerStatus.ACTIVE, LaborerStatus.ON_LEAVE)
        ).stream().collect(Collectors.toMap(l -> normalizeGrNo(l.getGrNo()), l -> l, (a, b) -> a));

        Map<Long, AttendanceMuster> musterMap = musterRepository.findBySiteIdAndMonthAndYear(siteId, month, year)
                .stream().collect(Collectors.toMap(AttendanceMuster::getWorkerId, m -> m));

        Map<String, DailyAttendance> dailyMap = dailyRepository.findBySiteIdAndYearAndMonth(siteId, year, month)
                .stream().collect(Collectors.toMap(d -> d.getWorkerId() + "_" + d.getDay(), d -> d));

        Map<Long, MonthlyPayroll> payrollMap = payrollRepository.findBySiteIdAndMonthAndYear(siteId, month, year)
                .stream().collect(Collectors.toMap(MonthlyPayroll::getWorkerId, p -> p));

        List<AttendanceMuster> mustersToSave = new ArrayList<>();
        List<DailyAttendance> dailyToSave = new ArrayList<>();
        List<MonthlyPayroll> payrollsToSave = new ArrayList<>();

        // 2. Process in memory
        for (AttendanceSaveRequest request : requests) {
            Laborer laborer = laborerMap.get(normalizeGrNo(request.getGrNo()));
            if (laborer == null) continue;
            
            Long workerId = laborer.getId();
            
            // Update Muster
            AttendanceMuster muster = musterMap.get(workerId);
            if (muster == null) {
                muster = AttendanceMuster.builder()
                        .workerId(workerId).siteId(siteId).grNo(laborer.getGrNo())
                        .month(month).year(year).attendanceData(new HashMap<>()).build();
                musterMap.put(workerId, muster);
            }
            
            Map<Integer, Double> attendanceData = muster.getAttendanceData();
            if (attendanceData == null) attendanceData = new HashMap<>();
            
            if (request.getDailyUpdates() != null) {
                for (Map.Entry<Integer, Double> entry : request.getDailyUpdates().entrySet()) {
                    Integer day = entry.getKey();
                    Double units = entry.getValue();
                    attendanceData.put(day, units);
                    
                    // Update Daily
                    String dailyKey = workerId + "_" + day;
                    DailyAttendance daily = dailyMap.get(dailyKey);
                    if (daily == null) {
                        daily = DailyAttendance.builder()
                                .workerId(workerId).siteId(siteId).grNo(laborer.getGrNo())
                                .name(laborer.getFullName()).designation(laborer.getDesignation())
                                .year(year).month(month).day(day)
                                .workDate(LocalDate.of(year, month, day)).build();
                        dailyMap.put(dailyKey, daily);
                    }
                    daily.setUnits(units);
                    if (!dailyToSave.contains(daily)) dailyToSave.add(daily);
                }
            }
            muster.setAttendanceData(attendanceData);
            if (!mustersToSave.contains(muster)) mustersToSave.add(muster);

            // Update Payroll (In-memory sync)
            MonthlyPayroll payroll = payrollMap.get(workerId);
            if (payroll == null) {
                payroll = MonthlyPayroll.builder()
                        .workerId(workerId).siteId(siteId).grNo(laborer.getGrNo())
                        .month(month).year(year).rate(laborer.getSalaryPerDay() != null ? laborer.getSalaryPerDay() : BigDecimal.ZERO)
                        .siteAdvance(BigDecimal.ZERO).onlineAdvance(BigDecimal.ZERO).totalAdvance(BigDecimal.ZERO).build();
                payrollMap.put(workerId, payroll);
            }
            
            double totalUnits = attendanceData.values().stream().filter(Objects::nonNull).mapToDouble(Double::doubleValue).sum();
            BigDecimal grossSalary = (payroll.getRate() != null) ? payroll.getRate().multiply(BigDecimal.valueOf(totalUnits)) : BigDecimal.ZERO;
            BigDecimal totalAdv = valueOrZero(payroll.getSiteAdvance()).add(valueOrZero(payroll.getOnlineAdvance()));
            BigDecimal debit = valueOrZero(payroll.getDebitBalance());
            
            payroll.setTotalUnits(BigDecimal.valueOf(totalUnits));
            payroll.setGrossSalary(grossSalary);
            payroll.setTotalAdvance(totalAdv);
            payroll.setNetBalance(grossSalary.subtract(totalAdv).subtract(debit));
            
            if (!payrollsToSave.contains(payroll)) payrollsToSave.add(payroll);
        }

        // 3. Batch Save
        if (!mustersToSave.isEmpty()) musterRepository.saveAll(mustersToSave);
        if (!dailyToSave.isEmpty()) dailyRepository.saveAll(dailyToSave);
        if (!payrollsToSave.isEmpty()) payrollRepository.saveAll(payrollsToSave);
    }

    @Transactional
    public void updateRate(String grNo, Long siteId, Integer month, Integer year, BigDecimal newRate) {
        updatePayroll(PayrollUpdateRequest.builder()
                .grNo(grNo).siteId(siteId).month(month).year(year).rate(newRate).build());
    }

    @Transactional
    public void updatePayroll(PayrollUpdateRequest request) {
        updatePayrollBatch(Collections.singletonList(request));
    }

    @Transactional
    public void updatePayrollBatch(List<PayrollUpdateRequest> requests) {
        if (requests == null || requests.isEmpty()) return;
        
        Long siteId = requests.get(0).getSiteId();
        Integer month = requests.get(0).getMonth();
        Integer year = requests.get(0).getYear();
        siteService.requireSite(siteId);

        // 1. Batch Load
        Map<Long, AttendanceMuster> musterMap = musterRepository.findBySiteIdAndMonthAndYear(siteId, month, year)
                .stream().collect(Collectors.toMap(AttendanceMuster::getWorkerId, m -> m));

        Map<Long, MonthlyPayroll> payrollMap = payrollRepository.findBySiteIdAndMonthAndYear(siteId, month, year)
                .stream().collect(Collectors.toMap(MonthlyPayroll::getWorkerId, p -> p));
        
        Map<String, Laborer> laborerMap = laborerRepository.findByCurrentSiteIdAndStatusIn(
                siteId, Arrays.asList(LaborerStatus.ACTIVE, LaborerStatus.ON_LEAVE)
        ).stream().collect(Collectors.toMap(l -> normalizeGrNo(l.getGrNo()), l -> l, (a, b) -> a));

        List<MonthlyPayroll> payrollsToSave = new ArrayList<>();

        // 2. Process
        for (PayrollUpdateRequest request : requests) {
            Laborer laborer = laborerMap.get(normalizeGrNo(request.getGrNo()));
            if (laborer == null) continue;
            Long workerId = laborer.getId();

            MonthlyPayroll payroll = payrollMap.get(workerId);
            if (payroll == null) {
                payroll = MonthlyPayroll.builder()
                        .workerId(workerId).siteId(siteId).grNo(laborer.getGrNo())
                        .month(month).year(year).build();
                payrollMap.put(workerId, payroll);
            }

            if (request.getRate() != null) payroll.setRate(request.getRate());
            payroll.setGrNo(laborer.getGrNo());
            if (request.getSiteAdvance() != null) payroll.setSiteAdvance(request.getSiteAdvance());
            if (request.getOnlineAdvance() != null) payroll.setOnlineAdvance(request.getOnlineAdvance());
            
            payroll.setTotalAdvance(valueOrZero(payroll.getSiteAdvance()).add(valueOrZero(payroll.getOnlineAdvance())));
            if (request.getDebitBalance() != null) payroll.setDebitBalance(request.getDebitBalance());
            if (request.getRemarks() != null) payroll.setRemarks(request.getRemarks());

            // Recalculate Totals (In-memory)
            AttendanceMuster muster = musterMap.get(workerId);
            double totalUnits = (muster != null && muster.getAttendanceData() != null)
                    ? muster.getAttendanceData().values().stream().filter(Objects::nonNull).mapToDouble(Double::doubleValue).sum()
                    : 0.0;

            BigDecimal grossSalary = valueOrZero(payroll.getRate()).multiply(BigDecimal.valueOf(totalUnits));
            BigDecimal totalAdvance = payroll.getTotalAdvance();
            BigDecimal debitBalance = valueOrZero(payroll.getDebitBalance());

            payroll.setTotalUnits(BigDecimal.valueOf(totalUnits));
            payroll.setGrossSalary(grossSalary);
            payroll.setNetBalance(grossSalary.subtract(totalAdvance).subtract(debitBalance));
            
            payrollsToSave.add(payroll);
        }

        // 3. Save All
        if (!payrollsToSave.isEmpty()) payrollRepository.saveAll(payrollsToSave);
    }

    private BigDecimal valueOrZero(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
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
        return grNo != null ? grNo.replaceAll("\\s+", "").toUpperCase() : "";
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

        // Batch-load all laborers in one query to avoid N+1
        Set<Long> workerIds = attendancePage.getContent().stream()
                .map(DailyAttendance::getWorkerId).collect(Collectors.toSet());
        Map<Long, Laborer> laborerMap = laborerRepository.findAllById(workerIds).stream()
                .collect(Collectors.toMap(Laborer::getId, l -> l));

        List<WorkerPresenceDTO> dtos = attendancePage.getContent().stream()
                .map((DailyAttendance attendance) -> {
                    Laborer laborer = laborerMap.get(attendance.getWorkerId());
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
}
