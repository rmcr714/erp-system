package com.antigravity.erp.modules.labor.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import com.antigravity.erp.modules.labor.enums.LaborerStatus;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "laborers")
public class Laborer {
    @Id
    private String grNo; 
    
    // Core Details
    private String fullName;
    private String designation; // Carpenter, Steel fitter, Block mason, Plaster mason, Unskilled, Other
    private String employerName;
    private String siteAddress;
    
    // Personal Details
    @Embedded
    private Address permanentAddress;
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
    @Embedded
    private IdProof idProof;
    @Embedded
    private BankDetails bankDetails;
    
    private BigDecimal salaryPerDay;
    
    @Enumerated(EnumType.STRING)
    private LaborerStatus status; // Active, Inactive, On Leave
    private String photoUrl;
    private String s3Url;

    // Auditing
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Embeddable
    public static class Address {
        @Column(name = "address_line")
        private String line;
        private String state;
        private String pincode;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Embeddable
    public static class IdProof {
        @Column(name = "id_type")
        private String type; // AADHAR, PAN, ELECTION_CARD
        private String idNumber;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Embeddable
    public static class BankDetails {
        private String bankName;
        private String branch;
        private String accountNo;
        private String ifscCode;
    }
}
