package com.antigravity.erp.modules.labor.enums;

import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;

@Getter
public enum LaborerStatus {
    ACTIVE("Active"),
    INACTIVE("Inactive"),
    ON_LEAVE("On Leave");

    @JsonValue
    private final String label;

    LaborerStatus(String label) {
        this.label = label;
    }
}
