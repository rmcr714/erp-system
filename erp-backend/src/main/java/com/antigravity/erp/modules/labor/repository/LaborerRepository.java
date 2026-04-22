package com.antigravity.erp.modules.labor.repository;

import com.antigravity.erp.modules.labor.model.Laborer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.antigravity.erp.modules.labor.enums.LaborerStatus;
import org.springframework.data.repository.query.Param;
import java.util.List;

@Repository
public interface LaborerRepository extends JpaRepository<Laborer, String> {
    
    @Query("SELECT l FROM Laborer l WHERE " +
           "(:fullName IS NULL OR :fullName = '' OR LOWER(COALESCE(l.fullName, '')) LIKE LOWER(CONCAT('%', LOWER(:fullName), '%'))) AND " +
           "(:grNo IS NULL OR :grNo = '' OR LOWER(COALESCE(l.grNo, '')) LIKE LOWER(CONCAT('%', LOWER(:grNo), '%'))) AND " +
           "(:designation IS NULL OR :designation = '' OR LOWER(COALESCE(l.designation, '')) LIKE LOWER(CONCAT('%', LOWER(:designation), '%'))) AND " +
           "(:contactNo IS NULL OR :contactNo = '' OR COALESCE(l.contactNo, '') LIKE CONCAT('%', :contactNo, '%')) AND " +
           "(:onlyActive = false OR l.status = com.antigravity.erp.modules.labor.enums.LaborerStatus.ACTIVE)")
    List<Laborer> findLaborers(
            @Param("fullName") String fullName, 
            @Param("grNo") String grNo, 
            @Param("designation") String designation, 
            @Param("contactNo") String contactNo, 
            @Param("onlyActive") boolean onlyActive);
}
