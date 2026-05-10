package com.antigravity.erp.config;

import org.hibernate.resource.jdbc.spi.StatementInspector;
import org.springframework.stereotype.Component;

@Component
public class HibernateQueryInspector implements StatementInspector {
    @Override
    public String inspect(String sql) {
        System.out.println("DEBUG: SQL Executed - Incrementing Count");
        QueryCountHolder.increment();
        return sql;
    }
}
