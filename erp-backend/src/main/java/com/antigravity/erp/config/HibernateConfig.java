package com.antigravity.erp.config;

import org.hibernate.cfg.AvailableSettings;
import org.springframework.boot.autoconfigure.orm.jpa.HibernatePropertiesCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Map;

@Configuration
public class HibernateConfig {

    private final HibernateQueryInspector hibernateQueryInspector;

    public HibernateConfig(HibernateQueryInspector hibernateQueryInspector) {
        this.hibernateQueryInspector = hibernateQueryInspector;
    }

    @Bean
    public HibernatePropertiesCustomizer hibernatePropertiesCustomizer() {
        return hibernateProperties -> hibernateProperties.put(AvailableSettings.STATEMENT_INSPECTOR, hibernateQueryInspector);
    }
}
