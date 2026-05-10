package com.antigravity.erp.modules.site.controller;

import com.antigravity.erp.modules.site.dto.SiteDTO;
import com.antigravity.erp.modules.site.service.SiteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sites")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SiteController {
    private final SiteService siteService;

    @GetMapping
    public List<SiteDTO> getSites() {
        return siteService.getSites();
    }

    @PostMapping
    public ResponseEntity<SiteDTO> addSite(@RequestBody SiteDTO siteDTO) {
        return ResponseEntity.ok(siteService.addSite(siteDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SiteDTO> updateSite(@PathVariable Long id, @RequestBody SiteDTO siteDTO) {
        return ResponseEntity.ok(siteService.updateSite(id, siteDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSite(@PathVariable Long id) {
        siteService.deleteSite(id);
        return ResponseEntity.noContent().build();
    }

}
