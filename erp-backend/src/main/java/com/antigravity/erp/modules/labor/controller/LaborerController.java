package com.antigravity.erp.modules.labor.controller;

import com.antigravity.erp.modules.labor.dto.ExcelImportResultDTO;
import com.antigravity.erp.modules.labor.dto.LaborerDTO;
import com.antigravity.erp.modules.labor.service.ExcelImportService;
import com.antigravity.erp.modules.labor.service.LaborerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/laborers")
@CrossOrigin(origins = "http://localhost:5173")
public class LaborerController {

    @Autowired
    private LaborerService laborService;

    @Autowired
    private ExcelImportService excelImportService;

    @GetMapping
    public Page<LaborerDTO> getAllLaborers(
            @RequestParam(name = "name", required = false) String name,
            @RequestParam(name = "grNo", required = false) String grNo,
            @RequestParam(name = "designation", required = false) String designation,
            @RequestParam(name = "contactNo", required = false) String contactNo,
            @RequestParam(name = "siteId", required = false) Long siteId,
            @RequestParam(name = "onlyActive", defaultValue = "false") boolean onlyActive,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "50") int size) {

        System.out.println("Search Request: name=" + name + ", grNo=" + grNo + ", designation=" + designation + ", contactNo=" + contactNo + ", onlyActive=" + onlyActive + ", page=" + page + ", size=" + size);

        org.springframework.data.domain.Pageable pageable = PageRequest.of(page, size);

        if ((name != null && !name.isEmpty()) ||
            (grNo != null && !grNo.isEmpty()) ||
            (designation != null && !designation.isEmpty()) ||
            (contactNo != null && !contactNo.isEmpty()) ||
            siteId != null ||
            onlyActive) {
            return laborService.searchLaborers(name, grNo, designation, contactNo, siteId, onlyActive, pageable);
        }
        return laborService.getAllLaborers(pageable);
    }

    @PostMapping
    public ResponseEntity<LaborerDTO> addLaborer(@RequestBody LaborerDTO laborerDTO) {
        LaborerDTO savedLaborer = laborService.addLaborer(laborerDTO);
        return ResponseEntity.ok(savedLaborer);
    }

    @PutMapping("/{grNo}")
    public ResponseEntity<LaborerDTO> updateLaborer(@PathVariable(name = "grNo") String grNo, @RequestBody LaborerDTO laborerDTO) {
        LaborerDTO updatedLaborer = laborService.updateLaborer(grNo, laborerDTO);
        return ResponseEntity.ok(updatedLaborer);
    }

    // ──────────────────────────────────────────────────────────────────
    //  Excel Import Endpoints
    // ──────────────────────────────────────────────────────────────────
    
    @GetMapping("/import/template")
    public ResponseEntity<byte[]> downloadTemplate() {
        byte[] template = excelImportService.generateTemplate();
        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=laborer_import_template.xlsx")
                .contentType(org.springframework.http.MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(template);
    }

    /**
     * Dry-run: Parse and validate the Excel file without writing to the DB.
     */
    @PostMapping("/import/preview")
    public ResponseEntity<ExcelImportResultDTO> previewImport(
            @RequestParam("file") MultipartFile file,
            @RequestParam("siteId") Long siteId) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        ExcelImportResultDTO result = excelImportService.preview(file, siteId);
        return ResponseEntity.ok(result);
    }

    /**
     * Confirm import: Re-parse the same file and persist only valid rows.
     * Invalid rows are skipped silently (they were shown in the preview step).
     */
    @PostMapping("/import/confirm")
    public ResponseEntity<ExcelImportResultDTO> confirmImport(
            @RequestParam("file") MultipartFile file,
            @RequestParam("siteId") Long siteId) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        // Re-parse to get valid rows
        ExcelImportResultDTO preview = excelImportService.preview(file, siteId);

        List<LaborerDTO> saved = new ArrayList<>();
        List<ExcelImportResultDTO.RowError> saveErrors = new ArrayList<>();

        for (LaborerDTO dto : preview.getValidRows()) {
            try {
                saved.add(laborService.addLaborer(dto));
            } catch (Exception e) {
                saveErrors.add(ExcelImportResultDTO.RowError.builder()
                        .grNo(dto.getGrNo())
                        .message("Failed to save: " + e.getMessage())
                        .build());
            }
        }

        ExcelImportResultDTO result = ExcelImportResultDTO.builder()
                .totalRows(saved.size() + saveErrors.size())
                .validCount(saved.size())
                .errorCount(saveErrors.size() + preview.getErrorCount())
                .validRows(saved)
                .errors(saveErrors)
                .build();

        return ResponseEntity.ok(result);
    }
}
