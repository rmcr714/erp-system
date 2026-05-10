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
import com.antigravity.erp.modules.site.model.Site;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "laborers",
       indexes = {
           @Index(name = "idx_laborers_gr_no", columnList = "gr_no", unique = true)
       })
public class Laborer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "gr_no", nullable = false, unique = true, length = 50)
    private String grNo;
    
    // Core Details
    private String fullName;
    private String designation; // Carpenter, Steel fitter, Block mason, Plaster mason, Unskilled, Other
    private String employerName;
    private String siteAddress;

    @Column(name = "current_site_id")
    private Long currentSiteId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "current_site_id", insertable = false, updatable = false)
    private Site currentSite;
    
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
    
    @Enumerated(EnumType.STRING)
    private LaborerStatus status; // Active, Inactive, On Leave
    private String photoUrl;

    @Column(name = "salary_per_day")
    private BigDecimal salaryPerDay;

    @Builder.Default
    @Column(nullable = false, columnDefinition = "text")
    private String remarks = "";

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
