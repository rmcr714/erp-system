package com.antigravity.erp.modules.labor.controller;

import com.antigravity.erp.modules.labor.dto.LaborerDTO;
import com.antigravity.erp.modules.labor.service.MockLaborService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/laborers")
@CrossOrigin(origins = "http://localhost:5173") // Allow frontend access
public class LaborerController {

    @Autowired
    private MockLaborService laborService;

    @GetMapping
    public List<LaborerDTO> getAllLaborers(@RequestParam(required = false) String search) {
        if (search != null) {
            return laborService.searchLaborers(search);
        }
        return laborService.getAllLaborers();
    }
}
