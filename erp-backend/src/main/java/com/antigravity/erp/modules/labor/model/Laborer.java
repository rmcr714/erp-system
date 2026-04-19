package com.antigravity.erp.modules.labor.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;
import com.antigravity.erp.modules.labor.enums.LaborerStatus;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Laborer {
    // Primary Key (Prefix based on designation)
    private String grNo; 
    
    // Core Details
    private String fullName;
    private String designation; // Carpenter, Steel fitter, Block mason, Plaster mason, Unskilled, Other
    private String designationDetail; // Manual entry if designation is "Other"
    private String employerName;
    private String siteAddress;
    
    // Personal Details
    private String permanentAddress;
    private String contactNo;
    private LocalDate dateOfBirth;
    private LocalDate dateOfJoining;
    private String height;
    private String weight;
    private String bloodGroup;
    private String joinByReference;
    
    // Statutory & Identity
    private boolean hasPf;
    private String pfNo;
    private IdProof idProof;
    private BankDetails bankDetails;
    
    private LaborerStatus status; // Active, Inactive, On Leave
    private String photoUrl;

    // Auditing
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class IdProof {
        private String type; // AADHAR, PAN, ELECTION_CARD
        private String idNumber;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BankDetails {
        private String bankName;
        private String branch;
        private String accountNo;
        private String ifscCode;
    }
}
