package com.antigravity.erp.modules.labor.dto;

import com.antigravity.erp.modules.labor.enums.LaborerStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LaborerDTO {
    private String grNo;
    private String fullName;
    private String designation;
    private String designationDetail;
    private String employerName;
    private String siteAddress;
    private AddressDTO permanentAddress;
    private String contactNo;
    private LocalDate dateOfBirth;
    private LocalDate dateOfJoining;
    private String height;
    private String weight;
    private String bloodGroup;
    private String joinByReference;
    private boolean hasPf;
    private String pfNo;
    private IdProofDTO idProof;
    private BankDetailsDTO bankDetails;
    private LaborerStatus status;
    private String photoUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AddressDTO {
        private String line;
        private String state;
        private String pincode;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class IdProofDTO {
        private String type;
        private String idNumber;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BankDetailsDTO {
        private String bankName;
        private String branch;
        private String accountNo;
        private String ifscCode;
    }
}
