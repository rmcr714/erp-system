package com.antigravity.erp.modules.site.repository;

import com.antigravity.erp.modules.site.model.Site;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SiteRepository extends JpaRepository<Site, Long> {
    boolean existsBySiteCodeIgnoreCase(String siteCode);
    Optional<Site> findBySiteCodeIgnoreCase(String siteCode);
}
