package com.antigravity.erp.modules.labor.service;

import com.antigravity.erp.modules.labor.dto.LaborerDTO;
import com.antigravity.erp.modules.labor.model.Laborer;
import com.antigravity.erp.modules.labor.repository.LaborerRepository;
import com.antigravity.erp.modules.attendance.model.AttendanceMuster;
import com.antigravity.erp.modules.attendance.model.MonthlyPayroll;
import com.antigravity.erp.modules.attendance.repository.AttendanceMusterRepository;
import com.antigravity.erp.modules.attendance.repository.DailyAttendanceRepository;
import com.antigravity.erp.modules.attendance.repository.MonthlyPayrollRepository;
import com.antigravity.erp.modules.site.service.SiteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LaborerServiceImpl implements LaborerService {

    @Autowired
    private LaborerRepository laborerRepository;

    @Autowired
    private AttendanceMusterRepository attendanceMusterRepository;

    @Autowired
    private MonthlyPayrollRepository monthlyPayrollRepository;

    @Autowired
    private DailyAttendanceRepository dailyAttendanceRepository;

    @Autowired
    private SiteService siteService;

    @Override
    public List<LaborerDTO> getAllLaborers() {
        return laborerRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<LaborerDTO> searchLaborers(String fullName, String grNo, String designation, String contactNo, Long siteId,
            boolean onlyActive) {
        return laborerRepository.findLaborers(fullName, grNo, designation, contactNo, siteId, onlyActive).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public LaborerDTO addLaborer(LaborerDTO laborerDTO) {
        String grNo = laborerDTO.getGrNo();

        // GR No is now a required field
        if (grNo == null || grNo.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "GR Number is required.");
        }

        // Check for duplicates
        if (laborerRepository.existsByGrNoIgnoreCase(grNo)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Laborer with GR No " + grNo + " already exists.");
        }
        if (laborerDTO.getCurrentSiteId() != null) {
            siteService.requireSite(laborerDTO.getCurrentSiteId());
        }

        Laborer laborer = mapToEntity(laborerDTO);
        Laborer savedLaborer = laborerRepository.save(laborer);

        LocalDate now = LocalDate.now();
        int currentMonth = now.getMonthValue();
        int currentYear = now.getYear();

        boolean isMonthStarted = savedLaborer.getCurrentSiteId() != null
                && !attendanceMusterRepository.findBySiteIdAndMonthAndYear(savedLaborer.getCurrentSiteId(), currentMonth, currentYear).isEmpty();

        if (isMonthStarted && savedLaborer.getCurrentSiteId() != null && laborerDTO.getStatus() == com.antigravity.erp.modules.labor.enums.LaborerStatus.ACTIVE) {
            AttendanceMuster muster = AttendanceMuster.builder()
                    .workerId(savedLaborer.getId())
                    .siteId(savedLaborer.getCurrentSiteId())
                    .grNo(savedLaborer.getGrNo())
                    .month(currentMonth)
                    .year(currentYear)
                    .attendanceData(new java.util.HashMap<>())
                    .isActive(true)
                    .build();
            attendanceMusterRepository.save(muster);

            MonthlyPayroll payroll = MonthlyPayroll.builder()
                    .workerId(savedLaborer.getId())
                    .siteId(savedLaborer.getCurrentSiteId())
                    .grNo(savedLaborer.getGrNo())
                    .month(currentMonth)
                    .year(currentYear)
                    .rate(laborerDTO.getSalaryPerDay() != null ? laborerDTO.getSalaryPerDay() : java.math.BigDecimal.ZERO)
                    .isActive(true)
                    .remarks("")
                    .build();
            monthlyPayrollRepository.save(payroll);
        }

        return mapToDTO(savedLaborer);
    }

    @Override
    @Transactional
    public LaborerDTO updateLaborer(String grNo, LaborerDTO laborerDTO) {
        Laborer existingLaborer = laborerRepository.findByGrNoIgnoreCase(grNo)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, 
                        "Laborer with GR No " + grNo + " not found."));
        String oldGrNo = existingLaborer.getGrNo();
        String newGrNo = normalizeGrNo(laborerDTO.getGrNo());
        if (newGrNo == null || newGrNo.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "GR Number is required.");
        }
        if (!existingLaborer.getGrNo().equalsIgnoreCase(newGrNo)
                && laborerRepository.existsByGrNoIgnoreCase(newGrNo)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Laborer with GR No " + newGrNo + " already exists.");
        }

        com.antigravity.erp.modules.labor.enums.LaborerStatus oldStatus = existingLaborer.getStatus();
        com.antigravity.erp.modules.labor.enums.LaborerStatus newStatus = laborerDTO.getStatus();
        Long oldSiteId = existingLaborer.getCurrentSiteId();
        if (laborerDTO.getCurrentSiteId() != null) {
            siteService.requireSite(laborerDTO.getCurrentSiteId());
        }

        // Update fields
        existingLaborer.setGrNo(newGrNo);
        existingLaborer.setFullName(laborerDTO.getFullName());
        existingLaborer.setDesignation(laborerDTO.getDesignation());
        existingLaborer.setEmployerName(laborerDTO.getEmployerName());
        existingLaborer.setSiteAddress(laborerDTO.getSiteAddress());
        existingLaborer.setCurrentSiteId(laborerDTO.getCurrentSiteId());
        existingLaborer.setPermanentAddress(mapAddressToEntity(laborerDTO.getPermanentAddress()));
        existingLaborer.setContactNo(laborerDTO.getContactNo());
        existingLaborer.setDateOfBirth(laborerDTO.getDateOfBirth());
        existingLaborer.setDateOfJoining(laborerDTO.getDateOfJoining());
        existingLaborer.setHeight(laborerDTO.getHeight());
        existingLaborer.setWeight(laborerDTO.getWeight());
        existingLaborer.setBloodGroup(laborerDTO.getBloodGroup());
        existingLaborer.setJoinByReference(laborerDTO.getJoinByReference());
        existingLaborer.setHasPf(laborerDTO.isHasPf());
        existingLaborer.setPfNo(laborerDTO.getPfNo());
        existingLaborer.setIdProof(mapIdProofToEntity(laborerDTO.getIdProof()));
        existingLaborer.setBankDetails(mapBankDetailsToEntity(laborerDTO.getBankDetails()));
        existingLaborer.setStatus(newStatus);
        existingLaborer.setPhotoUrl(laborerDTO.getPhotoUrl());
        existingLaborer.setRemarks(valueOrEmpty(laborerDTO.getRemarks()));

        Laborer updatedLaborer = laborerRepository.save(existingLaborer);
        if (!oldGrNo.equalsIgnoreCase(newGrNo)) {
            attendanceMusterRepository.updateGrNoByWorkerId(updatedLaborer.getId(), newGrNo);
            monthlyPayrollRepository.updateGrNoByWorkerId(updatedLaborer.getId(), newGrNo);
            dailyAttendanceRepository.updateGrNoByWorkerId(updatedLaborer.getId(), newGrNo);
        }

        boolean siteChanged = !java.util.Objects.equals(oldSiteId, updatedLaborer.getCurrentSiteId());
        if (siteChanged && updatedLaborer.getCurrentSiteId() != null
                && newStatus == com.antigravity.erp.modules.labor.enums.LaborerStatus.ACTIVE) {
            LocalDate now = LocalDate.now();
            int currentMonth = now.getMonthValue();
            int currentYear = now.getYear();
            boolean isMonthStarted = !attendanceMusterRepository
                    .findBySiteIdAndMonthAndYear(updatedLaborer.getCurrentSiteId(), currentMonth, currentYear)
                    .isEmpty();

            if (isMonthStarted) {
                attendanceMusterRepository.findByWorkerIdAndSiteIdAndMonthAndYear(updatedLaborer.getId(), updatedLaborer.getCurrentSiteId(), currentMonth, currentYear)
                        .orElseGet(() -> attendanceMusterRepository.save(AttendanceMuster.builder()
                                .workerId(updatedLaborer.getId())
                                .siteId(updatedLaborer.getCurrentSiteId())
                                .grNo(updatedLaborer.getGrNo())
                                .month(currentMonth)
                                .year(currentYear)
                                .attendanceData(new java.util.HashMap<>())
                                .isActive(true)
                                .build()));
                monthlyPayrollRepository.findByWorkerIdAndSiteIdAndMonthAndYear(updatedLaborer.getId(), updatedLaborer.getCurrentSiteId(), currentMonth, currentYear)
                        .orElseGet(() -> monthlyPayrollRepository.save(MonthlyPayroll.builder()
                                .workerId(updatedLaborer.getId())
                                .siteId(updatedLaborer.getCurrentSiteId())
                                .grNo(updatedLaborer.getGrNo())
                                .month(currentMonth)
                                .year(currentYear)
                                .rate(laborerDTO.getSalaryPerDay() != null ? laborerDTO.getSalaryPerDay() : java.math.BigDecimal.ZERO)
                                .isActive(true)
                                .remarks("")
                                .build()));
            }
        }

        if (oldStatus != newStatus) {
            LocalDate now = LocalDate.now();
            int currentMonth = now.getMonthValue();
            int currentYear = now.getYear();

            boolean isMonthStarted = existingLaborer.getCurrentSiteId() != null
                    && !attendanceMusterRepository.findBySiteIdAndMonthAndYear(existingLaborer.getCurrentSiteId(), currentMonth, currentYear).isEmpty();

            if (newStatus == com.antigravity.erp.modules.labor.enums.LaborerStatus.ACTIVE) {
                if (isMonthStarted && existingLaborer.getCurrentSiteId() != null) {
                    attendanceMusterRepository.findByWorkerIdAndSiteIdAndMonthAndYear(existingLaborer.getId(), existingLaborer.getCurrentSiteId(), currentMonth, currentYear)
                            .ifPresentOrElse(
                                    muster -> {
                                        muster.setIsActive(true);
                                        attendanceMusterRepository.save(muster);
                                    },
                                    () -> {
                                        AttendanceMuster muster = AttendanceMuster.builder()
                                                .workerId(existingLaborer.getId())
                                                .siteId(existingLaborer.getCurrentSiteId())
                                                .grNo(existingLaborer.getGrNo())
                                                .month(currentMonth)
                                                .year(currentYear)
                                                .attendanceData(new java.util.HashMap<>())
                                                .isActive(true)
                                                .build();
                                        attendanceMusterRepository.save(muster);
                                    }
                            );

                    monthlyPayrollRepository.findByWorkerIdAndSiteIdAndMonthAndYear(existingLaborer.getId(), existingLaborer.getCurrentSiteId(), currentMonth, currentYear)
                            .ifPresentOrElse(
                                    payroll -> {
                                        payroll.setIsActive(true);
                                        monthlyPayrollRepository.save(payroll);
                                    },
                                    () -> {
                                        MonthlyPayroll payroll = MonthlyPayroll.builder()
                                                .workerId(existingLaborer.getId())
                                                .siteId(existingLaborer.getCurrentSiteId())
                                                .grNo(existingLaborer.getGrNo())
                                                .month(currentMonth)
                                                .year(currentYear)
                                                .rate(laborerDTO.getSalaryPerDay() != null ? laborerDTO.getSalaryPerDay() : java.math.BigDecimal.ZERO)
                                                .isActive(true)
                                                .remarks("")
                                                .build();
                                        monthlyPayrollRepository.save(payroll);
                                    }
                            );
                }
            } else {
                // Inactive or On Leave
                if (existingLaborer.getCurrentSiteId() != null) {
                    attendanceMusterRepository.findByWorkerIdAndSiteIdAndMonthAndYear(existingLaborer.getId(), existingLaborer.getCurrentSiteId(), currentMonth, currentYear)
                        .ifPresent(muster -> {
                            muster.setIsActive(false);
                            attendanceMusterRepository.save(muster);
                        });

                    monthlyPayrollRepository.findByWorkerIdAndSiteIdAndMonthAndYear(existingLaborer.getId(), existingLaborer.getCurrentSiteId(), currentMonth, currentYear)
                        .ifPresent(payroll -> {
                            payroll.setIsActive(false);
                            monthlyPayrollRepository.save(payroll);
                        });
                }
            }
        }

        return mapToDTO(updatedLaborer);
    }

    private LaborerDTO mapToDTO(Laborer laborer) {
        return LaborerDTO.builder()
                .id(laborer.getId())
                .grNo(laborer.getGrNo())
                .fullName(laborer.getFullName())
                .designation(laborer.getDesignation())
                .employerName(laborer.getEmployerName())
                .siteAddress(laborer.getSiteAddress())
                .currentSiteId(laborer.getCurrentSiteId())
                .currentSiteName(laborer.getCurrentSite() != null ? laborer.getCurrentSite().getName() : null)
                .permanentAddress(mapAddressToDTO(laborer.getPermanentAddress()))
                .contactNo(laborer.getContactNo())
                .dateOfBirth(laborer.getDateOfBirth())
                .dateOfJoining(laborer.getDateOfJoining())
                .height(laborer.getHeight())
                .weight(laborer.getWeight())
                .bloodGroup(laborer.getBloodGroup())
                .joinByReference(laborer.getJoinByReference())
                .permanentAddress(mapAddressToDTO(laborer.getPermanentAddress()))
                .contactNo(laborer.getContactNo())
                .dateOfBirth(laborer.getDateOfBirth())
                .dateOfJoining(laborer.getDateOfJoining())
                .height(laborer.getHeight())
                .weight(laborer.getWeight())
                .bloodGroup(laborer.getBloodGroup())
                .joinByReference(laborer.getJoinByReference())
                .hasPf(laborer.isHasPf())
                .pfNo(laborer.getPfNo())
                .idProof(mapIdProofToDTO(laborer.getIdProof()))
                .bankDetails(mapBankDetailsToDTO(laborer.getBankDetails()))
                .status(laborer.getStatus())
                .salaryPerDay(laborer.getSalaryPerDay())
                .photoUrl(laborer.getPhotoUrl())
                .remarks(valueOrEmpty(laborer.getRemarks()))
                .createdAt(laborer.getCreatedAt())
                .updatedAt(laborer.getUpdatedAt())
                .build();
    }

    private Laborer mapToEntity(LaborerDTO dto) {
        return Laborer.builder()
                .grNo(normalizeGrNo(dto.getGrNo()))
                .fullName(dto.getFullName())
                .designation(dto.getDesignation())
                .employerName(dto.getEmployerName())
                .siteAddress(dto.getSiteAddress())
                .currentSiteId(dto.getCurrentSiteId())
                .permanentAddress(mapAddressToEntity(dto.getPermanentAddress()))
                .contactNo(dto.getContactNo())
                .dateOfBirth(dto.getDateOfBirth())
                .dateOfJoining(dto.getDateOfJoining())
                .height(dto.getHeight())
                .weight(dto.getWeight())
                .bloodGroup(dto.getBloodGroup())
                .joinByReference(dto.getJoinByReference())
                .hasPf(dto.isHasPf())
                .pfNo(dto.getPfNo())
                .idProof(mapIdProofToEntity(dto.getIdProof()))
                .bankDetails(mapBankDetailsToEntity(dto.getBankDetails()))
                .status(dto.getStatus())
                .salaryPerDay(dto.getSalaryPerDay())
                .photoUrl(dto.getPhotoUrl())
                .remarks(valueOrEmpty(dto.getRemarks()))
                .build();
    }

    private String normalizeGrNo(String grNo) {
        return grNo != null ? grNo.trim().toUpperCase() : null;
    }

    private String valueOrEmpty(String value) {
        return value != null ? value : "";
    }

    // Helper mapping methods
    private LaborerDTO.AddressDTO mapAddressToDTO(Laborer.Address address) {
        if (address == null)
            return null;
        return LaborerDTO.AddressDTO.builder()
                .line(address.getLine())
                .state(address.getState())
                .pincode(address.getPincode())
                .build();
    }

    private Laborer.Address mapAddressToEntity(LaborerDTO.AddressDTO dto) {
        if (dto == null)
            return null;
        return Laborer.Address.builder()
                .line(dto.getLine())
                .state(dto.getState())
                .pincode(dto.getPincode())
                .build();
    }

    private LaborerDTO.IdProofDTO mapIdProofToDTO(Laborer.IdProof idProof) {
        if (idProof == null)
            return null;
        return LaborerDTO.IdProofDTO.builder()
                .type(idProof.getType())
                .idNumber(idProof.getIdNumber())
                .build();
    }

    private Laborer.IdProof mapIdProofToEntity(LaborerDTO.IdProofDTO dto) {
        if (dto == null)
            return null;
        return Laborer.IdProof.builder()
                .type(dto.getType())
                .idNumber(dto.getIdNumber())
                .build();
    }

    private LaborerDTO.BankDetailsDTO mapBankDetailsToDTO(Laborer.BankDetails bankDetails) {
        if (bankDetails == null)
            return null;
        return LaborerDTO.BankDetailsDTO.builder()
                .bankName(bankDetails.getBankName())
                .branch(bankDetails.getBranch())
                .accountNo(bankDetails.getAccountNo())
                .ifscCode(bankDetails.getIfscCode())
                .build();
    }

    private Laborer.BankDetails mapBankDetailsToEntity(LaborerDTO.BankDetailsDTO dto) {
        if (dto == null)
            return null;
        return Laborer.BankDetails.builder()
                .bankName(dto.getBankName())
                .branch(dto.getBranch())
                .accountNo(dto.getAccountNo())
                .ifscCode(dto.getIfscCode())
                .build();
    }
}
