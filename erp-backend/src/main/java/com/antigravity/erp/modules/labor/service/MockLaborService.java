package com.antigravity.erp.modules.labor.service;

import com.antigravity.erp.modules.labor.model.Laborer;
import com.antigravity.erp.modules.labor.enums.LaborerStatus;
import com.antigravity.erp.modules.labor.dto.LaborerDTO;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

// @Service
public class MockLaborService {
    private final List<Laborer> laborers = new ArrayList<>();
    
    // Counters for GR Prefix logic
    private final Map<String, String> prefixes = Map.of(
        "Carpenter", "CA",
        "Steel fitter", "SF",
        "Block mason", "BM",
        "Plaster mason", "PM",
        "Unskilled", "US",
        "Other", "OT"
    );
    
    private final Map<String, AtomicInteger> counters = Map.of(
        "Carpenter", new AtomicInteger(1),
        "Steel fitter", new AtomicInteger(1),
        "Block mason", new AtomicInteger(1),
        "Plaster mason", new AtomicInteger(1),
        "Unskilled", new AtomicInteger(1),
        "Other", new AtomicInteger(1)
    );

    @PostConstruct
    public void init() {
        // Seed some professional data based on the physical forms
        addLaborer("Hemant Bhardwaj", "Unskilled", "Ajmera Manhattan", LaborerStatus.ACTIVE, "AADHAR", "1234-5678-9012", "Maharashtra");
        addLaborer("Amit Singh", "Carpenter", "Skyline Towers", LaborerStatus.ACTIVE, "PAN", "ABCDE1234F", "Delhi");
        addLaborer("Rajesh Kumar", "Steel fitter", "Delta Heights", LaborerStatus.ACTIVE, "AADHAR", "9876-5432-1098", "Uttar Pradesh");
        addLaborer("Vijay Sharma", "Block mason", "Metro Plaza", LaborerStatus.ON_LEAVE, "PAN", "FGHIJ5678K", "Bihar");
        addLaborer("Suresh Gupta", "Other", "Central Station", LaborerStatus.ACTIVE, "ELECTION_CARD", "XYZ987654", "Rajasthan");
        
        // Add more structured mock data to reach 50 entries
        String[] states = {"Maharashtra", "Gujarat", "Karnataka", "Tamil Nadu", "Uttar Pradesh"};
        for (int i = 1; i <= 45; i++) {
            String designation = List.of("Carpenter", "Steel fitter", "Block mason", "Plaster mason", "Unskilled").get(i % 5);
            addLaborer("Worker " + i, designation, "Green Valley", LaborerStatus.ACTIVE, "AADHAR", "4000-0000-00" + i, states[i % 5]);
        }
    }

    private void addLaborer(String name, String designation, String site, LaborerStatus status, String idType, String idNo, String state) {
        String prefix = prefixes.getOrDefault(designation, "OT");
        int count = counters.get(designation).getAndIncrement();
        String grNo = prefix + String.format("%03d", count);

        // Simulated historical creation
        LocalDateTime created = LocalDateTime.now().minusDays((int) (Math.random() * 365));

        Laborer.Address address = Laborer.Address.builder()
                .line("123, Main Street, Local Area")
                .state(state)
                .pincode("400001")
                .build();

        laborers.add(Laborer.builder()
                .grNo(grNo)
                .fullName(name)
                .designation(designation)
                .siteAddress(site)
                .employerName("Civic Construction Ltd")
                .permanentAddress(address)
                .contactNo("+91-9876543210")
                .status(status)
                .dateOfBirth(LocalDate.of(1990, 3, 5))
                .dateOfJoining(LocalDate.of(2023, 1, 15))
                .idProof(Laborer.IdProof.builder().type(idType).idNumber(idNo).build())
                .bankDetails(Laborer.BankDetails.builder()
                        .bankName("State Bank of India")
                        .branch("Main Branch")
                        .accountNo("30948572" + count)
                        .ifscCode("SBIN0001234")
                        .build())
                .createdAt(created)
                .updatedAt(created.plusHours(12))
                .build());
    }

    public List<LaborerDTO> getAllLaborers() {
        return laborers.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public List<LaborerDTO> searchLaborers(String query) {
        if (query == null || query.isEmpty()) return getAllLaborers();
        String lowerQuery = query.toLowerCase();
        return laborers.stream()
                .filter(l -> l.getFullName().toLowerCase().contains(lowerQuery) || 
                             l.getGrNo().toLowerCase().contains(lowerQuery) ||
                             l.getDesignation().toLowerCase().contains(lowerQuery))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private LaborerDTO mapToDTO(Laborer laborer) {
        // Map nested Address object
        LaborerDTO.AddressDTO addressDTO = null;
        if (laborer.getPermanentAddress() != null) {
            addressDTO = LaborerDTO.AddressDTO.builder()
                    .line(laborer.getPermanentAddress().getLine())
                    .state(laborer.getPermanentAddress().getState())
                    .pincode(laborer.getPermanentAddress().getPincode())
                    .build();
        }

        return LaborerDTO.builder()
                .grNo(laborer.getGrNo())
                .fullName(laborer.getFullName())
                .designation(laborer.getDesignation())
                .employerName(laborer.getEmployerName())
                .siteAddress(laborer.getSiteAddress())
                .permanentAddress(addressDTO)
                .contactNo(laborer.getContactNo())
                .dateOfBirth(laborer.getDateOfBirth())
                .dateOfJoining(laborer.getDateOfJoining())
                .height(laborer.getHeight())
                .weight(laborer.getWeight())
                .bloodGroup(laborer.getBloodGroup())
                .joinByReference(laborer.getJoinByReference())
                .hasPf(laborer.isHasPf())
                .pfNo(laborer.getPfNo())
                .idProof(LaborerDTO.IdProofDTO.builder()
                        .type(laborer.getIdProof().getType())
                        .idNumber(laborer.getIdProof().getIdNumber())
                        .build())
                .bankDetails(LaborerDTO.BankDetailsDTO.builder()
                        .bankName(laborer.getBankDetails().getBankName())
                        .branch(laborer.getBankDetails().getBranch())
                        .accountNo(laborer.getBankDetails().getAccountNo())
                        .ifscCode(laborer.getBankDetails().getIfscCode())
                        .build())
                .status(laborer.getStatus())
                .photoUrl(laborer.getPhotoUrl())
                .createdAt(laborer.getCreatedAt())
                .updatedAt(laborer.getUpdatedAt())
                .build();
    }
}
