package com.antigravity.erp.modules.labor.service;

import com.antigravity.erp.modules.labor.dto.LaborerDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface LaborerService {
    Page<LaborerDTO> getAllLaborers(Pageable pageable);
    Page<LaborerDTO> searchLaborers(String fullName, String grNo, String designation, String contactNo, Long siteId, boolean onlyActive, Pageable pageable);
    LaborerDTO addLaborer(LaborerDTO laborerDTO);
    LaborerDTO updateLaborer(String grNo, LaborerDTO laborerDTO);
}
