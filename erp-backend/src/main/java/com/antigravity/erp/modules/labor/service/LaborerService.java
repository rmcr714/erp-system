package com.antigravity.erp.modules.labor.service;

import com.antigravity.erp.modules.labor.dto.LaborerDTO;
import java.util.List;

public interface LaborerService {
    List<LaborerDTO> getAllLaborers();
    List<LaborerDTO> searchLaborers(String fullName, String grNo, String designation, String contactNo, boolean onlyActive);
    LaborerDTO addLaborer(LaborerDTO laborerDTO);
}
