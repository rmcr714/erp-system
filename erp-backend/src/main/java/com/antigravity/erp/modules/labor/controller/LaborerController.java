package com.antigravity.erp.modules.labor.controller;

import com.antigravity.erp.modules.labor.dto.LaborerDTO;
import com.antigravity.erp.modules.labor.service.LaborerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/laborers")
@CrossOrigin(origins = "http://localhost:5173") // Allow frontend access
public class LaborerController {

    @Autowired
    private LaborerService laborService;

    @GetMapping
    public List<LaborerDTO> getAllLaborers(
            @RequestParam(name = "name", required = false) String name,
            @RequestParam(name = "grNo", required = false) String grNo,
            @RequestParam(name = "designation", required = false) String designation,
            @RequestParam(name = "contactNo", required = false) String contactNo,
            @RequestParam(name = "onlyActive", defaultValue = "false") boolean onlyActive) {
        
        System.out.println("Search Request: name=" + name + ", grNo=" + grNo + ", designation=" + designation + ", contactNo=" + contactNo + ", onlyActive=" + onlyActive);

        if ((name != null && !name.isEmpty()) || 
            (grNo != null && !grNo.isEmpty()) || 
            (designation != null && !designation.isEmpty()) || 
            (contactNo != null && !contactNo.isEmpty()) || 
            onlyActive) {
            return laborService.searchLaborers(name, grNo, designation, contactNo, onlyActive);
        }
        return laborService.getAllLaborers();
    }

    @PostMapping
    public ResponseEntity<LaborerDTO> addLaborer(@RequestBody LaborerDTO laborerDTO) {
        LaborerDTO savedLaborer = laborService.addLaborer(laborerDTO);
        return ResponseEntity.ok(savedLaborer);
    }
}
