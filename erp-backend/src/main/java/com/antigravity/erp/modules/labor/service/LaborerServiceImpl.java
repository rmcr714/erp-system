package com.antigravity.erp.modules.labor.service;

import com.antigravity.erp.modules.labor.dto.LaborerDTO;
import com.antigravity.erp.modules.labor.model.Laborer;
import com.antigravity.erp.modules.labor.repository.LaborerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class LaborerServiceImpl implements LaborerService {

    @Autowired
    private LaborerRepository laborerRepository;

    private final Map<String, String> prefixes = Map.of(
        "Carpenter", "CA",
        "Steel fitter", "SF",
        "Block mason", "BM",
        "Plaster mason", "PM",
        "Unskilled", "US",
        "Other", "OT"
    );

    @Override
    public List<LaborerDTO> getAllLaborers() {
        return laborerRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<LaborerDTO> searchLaborers(String fullName, String grNo, String designation, String contactNo, boolean onlyActive) {
        return laborerRepository.findLaborers(fullName, grNo, designation, contactNo, onlyActive).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public LaborerDTO addLaborer(LaborerDTO laborerDTO) {
        // If GR No is provided manually, check for duplicates
        if (laborerDTO.getGrNo() != null && !laborerDTO.getGrNo().isEmpty()) {
            if (laborerRepository.existsById(laborerDTO.getGrNo())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Laborer with GR No " + laborerDTO.getGrNo() + " already exists.");
            }
        }

        Laborer laborer = mapToEntity(laborerDTO);
        
        // Generate GR No if not present
        if (laborer.getGrNo() == null || laborer.getGrNo().isEmpty()) {
            String prefix = prefixes.getOrDefault(laborer.getDesignation(), "OT");
            long count = laborerRepository.findAll().stream()
                    .filter(l -> l.getDesignation().equals(laborer.getDesignation()))
                    .count();
            
            // Ensure generated GR doesn't conflict (though unlikely with this logic)
            String generatedGr = prefix + String.format("%03d", count + 1);
            while (laborerRepository.existsById(generatedGr)) {
                count++;
                generatedGr = prefix + String.format("%03d", count + 1);
            }
            laborer.setGrNo(generatedGr);
        }

        Laborer savedLaborer = laborerRepository.save(laborer);
        return mapToDTO(savedLaborer);
    }

    private LaborerDTO mapToDTO(Laborer laborer) {
        return LaborerDTO.builder()
                .grNo(laborer.getGrNo())
                .fullName(laborer.getFullName())
                .designation(laborer.getDesignation())
                .employerName(laborer.getEmployerName())
                .siteAddress(laborer.getSiteAddress())
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
                .photoUrl(laborer.getPhotoUrl())
                .s3Url(laborer.getS3Url())
                .createdAt(laborer.getCreatedAt())
                .updatedAt(laborer.getUpdatedAt())
                .build();
    }

    private Laborer mapToEntity(LaborerDTO dto) {
        return Laborer.builder()
                .grNo(dto.getGrNo())
                .fullName(dto.getFullName())
                .designation(dto.getDesignation())
                .employerName(dto.getEmployerName())
                .siteAddress(dto.getSiteAddress())
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
                .photoUrl(dto.getPhotoUrl())
                .s3Url(dto.getS3Url())
                .build();
    }

    // Helper mapping methods
    private LaborerDTO.AddressDTO mapAddressToDTO(Laborer.Address address) {
        if (address == null) return null;
        return LaborerDTO.AddressDTO.builder()
                .line(address.getLine())
                .state(address.getState())
                .pincode(address.getPincode())
                .build();
    }

    private Laborer.Address mapAddressToEntity(LaborerDTO.AddressDTO dto) {
        if (dto == null) return null;
        return Laborer.Address.builder()
                .line(dto.getLine())
                .state(dto.getState())
                .pincode(dto.getPincode())
                .build();
    }

    private LaborerDTO.IdProofDTO mapIdProofToDTO(Laborer.IdProof idProof) {
        if (idProof == null) return null;
        return LaborerDTO.IdProofDTO.builder()
                .type(idProof.getType())
                .idNumber(idProof.getIdNumber())
                .build();
    }

    private Laborer.IdProof mapIdProofToEntity(LaborerDTO.IdProofDTO dto) {
        if (dto == null) return null;
        return Laborer.IdProof.builder()
                .type(dto.getType())
                .idNumber(dto.getIdNumber())
                .build();
    }

    private LaborerDTO.BankDetailsDTO mapBankDetailsToDTO(Laborer.BankDetails bankDetails) {
        if (bankDetails == null) return null;
        return LaborerDTO.BankDetailsDTO.builder()
                .bankName(bankDetails.getBankName())
                .branch(bankDetails.getBranch())
                .accountNo(bankDetails.getAccountNo())
                .ifscCode(bankDetails.getIfscCode())
                .build();
    }

    private Laborer.BankDetails mapBankDetailsToEntity(LaborerDTO.BankDetailsDTO dto) {
        if (dto == null) return null;
        return Laborer.BankDetails.builder()
                .bankName(dto.getBankName())
                .branch(dto.getBranch())
                .accountNo(dto.getAccountNo())
                .ifscCode(dto.getIfscCode())
                .build();
    }
}
