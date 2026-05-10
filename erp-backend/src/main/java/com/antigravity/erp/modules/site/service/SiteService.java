package com.antigravity.erp.modules.site.service;

import com.antigravity.erp.modules.site.dto.SiteDTO;
import com.antigravity.erp.modules.site.model.Site;
import com.antigravity.erp.modules.site.repository.SiteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SiteService {
    private final SiteRepository siteRepository;

    @Transactional(readOnly = true)
    public List<SiteDTO> getSites() {
        return siteRepository.findAll().stream().map(this::toDto).toList();
    }

    @Transactional
    public SiteDTO addSite(SiteDTO dto) {
        String siteCode = normalize(dto.getSiteCode());
        if (siteCode == null || siteCode.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Site code is required.");
        }
        if (dto.getName() == null || dto.getName().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Site name is required.");
        }
        if (siteRepository.existsBySiteCodeIgnoreCase(siteCode)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Site code already exists.");
        }

        Site site = Site.builder()
                .siteCode(siteCode)
                .name(dto.getName().trim())
                .address(valueOrEmpty(dto.getAddress()))
                .active(dto.getActive() == null || dto.getActive())
                .build();
        return toDto(siteRepository.save(site));
    }

    @Transactional(readOnly = true)
    public Site requireSite(Long siteId) {
        if (siteId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Site is required.");
        }
        return siteRepository.findById(siteId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Site not found."));
    }

    private SiteDTO toDto(Site site) {
        return SiteDTO.builder()
                .id(site.getId())
                .siteCode(site.getSiteCode())
                .name(site.getName())
                .address(valueOrEmpty(site.getAddress()))
                .active(site.getActive())
                .build();
    }

    private String normalize(String value) {
        return value != null ? value.trim().toUpperCase() : null;
    }

    private String valueOrEmpty(String value) {
        return value != null ? value : "";
    }
}
