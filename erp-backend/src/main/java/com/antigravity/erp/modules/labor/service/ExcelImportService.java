package com.antigravity.erp.modules.labor.service;

import com.antigravity.erp.modules.labor.dto.ExcelImportResultDTO;
import com.antigravity.erp.modules.labor.dto.LaborerDTO;
import com.antigravity.erp.modules.labor.enums.LaborerStatus;
import com.antigravity.erp.modules.labor.repository.LaborerRepository;
import com.antigravity.erp.modules.site.model.Site;
import com.antigravity.erp.modules.site.service.SiteService;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;

@Service
public class ExcelImportService {

    private final LaborerRepository laborerRepository;
    private final SiteService siteService;

    private static final String NOT_AVAILABLE = "Not Available";
    private static final String DEFAULT_EMPLOYER = "AD Group";
    private static final LaborerStatus DEFAULT_STATUS = LaborerStatus.INACTIVE;

    private static final List<DateTimeFormatter> DATE_FORMATS = Arrays.asList(
            DateTimeFormatter.ofPattern("dd/MM/yyyy"),
            DateTimeFormatter.ofPattern("dd-MM-yyyy"),
            DateTimeFormatter.ofPattern("yyyy-MM-dd"),
            DateTimeFormatter.ofPattern("d/M/yyyy"),
            new java.time.format.DateTimeFormatterBuilder()
                    .appendValue(java.time.temporal.ChronoField.DAY_OF_MONTH, 1, 2,
                            java.time.format.SignStyle.NOT_NEGATIVE)
                    .appendLiteral('/')
                    .appendValue(java.time.temporal.ChronoField.MONTH_OF_YEAR, 1, 2,
                            java.time.format.SignStyle.NOT_NEGATIVE)
                    .appendLiteral('/')
                    .appendValueReduced(java.time.temporal.ChronoField.YEAR, 2, 2, 1950)
                    .toFormatter(),
            new java.time.format.DateTimeFormatterBuilder()
                    .appendValue(java.time.temporal.ChronoField.DAY_OF_MONTH, 1, 2,
                            java.time.format.SignStyle.NOT_NEGATIVE)
                    .appendLiteral('-')
                    .appendValue(java.time.temporal.ChronoField.MONTH_OF_YEAR, 1, 2,
                            java.time.format.SignStyle.NOT_NEGATIVE)
                    .appendLiteral('-')
                    .appendValueReduced(java.time.temporal.ChronoField.YEAR, 2, 2, 1950)
                    .toFormatter());

    public ExcelImportService(LaborerRepository laborerRepository, SiteService siteService) {
        this.laborerRepository = laborerRepository;
        this.siteService = siteService;
    }

    public byte[] generateTemplate() {
        try (Workbook workbook = new XSSFWorkbook();
                java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Laborer Import Template");
            Row header = sheet.createRow(0);

            String[] columns = {
                    "GR No", "Full Name", "Designation", "Contact No", "Employer Name",
                    "Height", "Weight", "Blood Group", "Date of Joining", "Date of Birth",
                    "Join by Reference", "PF No", "Salary Per Day", "Address", "State",
                    "Pincode", "ID Type", "ID Number", "Bank Name", "Branch",
                    "Account No", "IFSC Code", "Status", "Remarks"
            };

            for (int i = 0; i < columns.length; i++) {
                header.createCell(i).setCellValue(columns[i]);
            }

            // Add a sample row
            Row sample = sheet.createRow(1);
            sample.createCell(0).setCellValue("GR001");
            sample.createCell(1).setCellValue("John Doe");
            sample.createCell(2).setCellValue("Carpenter");
            sample.createCell(3).setCellValue("9876543210");
            sample.createCell(4).setCellValue("AD Group");
            sample.createCell(8).setCellValue("10/05/2026");
            sample.createCell(12).setCellValue(500);
            sample.createCell(22).setCellValue("ACTIVE");

            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate Excel template", e);
        }
    }

    public ExcelImportResultDTO preview(MultipartFile file, Long siteId) {
        List<LaborerDTO> validRows = new ArrayList<>();
        List<ExcelImportResultDTO.RowError> errors = new ArrayList<>();
        Set<String> seenInFile = new HashSet<>();

        try (InputStream is = file.getInputStream();
                Workbook workbook = new XSSFWorkbook(is)) {

            Sheet sheet = workbook.getSheetAt(0);
            
            // --- OPTIMIZATION: Collect all GR numbers first to do a batch DB check ---
            List<String> grNosInFile = new ArrayList<>();
            Map<String, Integer> tempColIndex = null;
            
            Iterator<Row> firstPass = sheet.iterator();
            if (firstPass.hasNext()) {
                Row header = firstPass.next();
                tempColIndex = buildColumnIndex(header);
                while (firstPass.hasNext()) {
                    Row row = firstPass.next();
                    if (isRowBlank(row)) continue;
                    String g = lookup(row, tempColIndex, "gr no", "grno");
                    if (g != null && !g.equalsIgnoreCase(NOT_AVAILABLE)) {
                        grNosInFile.add(g.replaceAll("\\s+", "").toLowerCase());
                    }
                }
            }

            if (grNosInFile.isEmpty() && (tempColIndex == null || (!tempColIndex.containsKey("gr no") && !tempColIndex.containsKey("grno")))) {
                errors.add(rowError(0, "", "Missing required column 'GR No' or file is empty."));
                return buildResult(validRows, errors);
            }

            // Single DB query for all GR numbers in the file
            Set<String> existingInDb = grNosInFile.isEmpty() ? Collections.emptySet() : 
                                     laborerRepository.findAllExistingGrNos(grNosInFile);

            // --- SECOND PASS: Process and map rows ---
            Iterator<Row> rows = sheet.iterator();
            rows.next(); // Skip header
            Map<String, Integer> colIndex = tempColIndex;

            while (rows.hasNext()) {
                Row row = rows.next();
                if (isRowBlank(row))
                    continue;

                int excelRowNum = row.getRowNum() + 1;
                String grNo = lookup(row, colIndex, "gr no", "grno");

                if (grNo == null || grNo.equalsIgnoreCase(NOT_AVAILABLE)) {
                    errors.add(rowError(excelRowNum, "", "GR No is missing or empty."));
                    continue;
                }

                grNo = grNo.replaceAll("\\s+", "").toUpperCase();

                // Check DB duplicate using our pre-fetched set (Optimized!)
                if (existingInDb.contains(grNo.toLowerCase())) {
                    errors.add(rowError(excelRowNum, grNo, "GR No '" + grNo + "' already exists in the database."));
                    continue;
                }

                // Check intra-file duplicate
                if (seenInFile.contains(grNo)) {
                    errors.add(
                            rowError(excelRowNum, grNo, "GR No '" + grNo + "' appears more than once in this file."));
                    continue;
                }
                seenInFile.add(grNo);

                // Build DTO with safe defaults
                LaborerDTO dto = LaborerDTO.builder()
                        .grNo(grNo)
                        .fullName(lookup(row, colIndex, "full name", "name", "laborer name"))
                        .designation(lookup(row, colIndex, "designation", "post", "role"))
                        .contactNo(lookup(row, colIndex, "contact no", "phone", "mobile", "contact", "contact_no"))
                        .employerName(lookup(row, colIndex, DEFAULT_EMPLOYER, "employer", "company", "employer name"))
                        .currentSiteId(siteId)
                        .status(parseStatus(row, colIndex))
                        .height(lookupOrNull(row, colIndex, "height"))
                        .weight(lookupOrNull(row, colIndex, "weight"))
                        .bloodGroup(lookupOrNull(row, colIndex, "blood group", "bloodgroup", "bg", "blood_group"))
                        .joinByReference(lookupOrNull(row, colIndex, "join by reference", "reference", "ref"))
                        .dateOfJoining(
                                parseDate(row, colIndex, "date of joining", "doj", "joining date", "date_of_joining"))
                        .dateOfBirth(parseDate(row, colIndex, "date of birth", "dob", "birth date", "date_of_birth"))
                        .permanentAddress(buildAddress(row, colIndex))
                        .idProof(buildIdProof(row, colIndex))
                        .bankDetails(buildBankDetails(row, colIndex))
                        .hasPf(hasAnyValue(row, colIndex, "pf no", "pf number", "pf_no"))
                        .pfNo(lookupOrNull(row, colIndex, "pf no", "pf number", "pf_no"))
                        .salaryPerDay(parseBigDecimal(row, colIndex, "salary", "rate", "base rate", "salary per day", "daily rate"))
                        .remarks(lookupOrNull(row, colIndex, "remarks", "note", "comments"))
                        .build();

                validRows.add(dto);
            }

        } catch (Exception e) {
            errors.add(rowError(0, "", "Failed to read Excel file: " + e.getMessage()));
        }

        return buildResult(validRows, errors);
    }

    private Map<String, Integer> buildColumnIndex(Row headerRow) {
        Map<String, Integer> map = new LinkedHashMap<>();
        for (Cell cell : headerRow) {
            String header = getCellString(cell);
            if (header != null) {
                String normalized = header.trim().toLowerCase().replace('_', ' ');
                map.put(normalized, cell.getColumnIndex());
                // Also add the original normalized string without space replacement just in
                // case
                map.put(header.trim().toLowerCase(), cell.getColumnIndex());
            }
        }
        return map;
    }

    private String lookup(Row row, Map<String, Integer> colIndex, String... keys) {
        for (String key : keys) {
            String normalizedKey = key.toLowerCase().replace('_', ' ');
            Integer idx = colIndex.get(normalizedKey);
            if (idx == null)
                idx = colIndex.get(key.toLowerCase());

            if (idx != null) {
                String val = getCellString(row, idx);
                if (val != null && !val.isBlank())
                    return val.trim();
            }
        }
        return NOT_AVAILABLE;
    }

    private String lookupOrNull(Row row, Map<String, Integer> colIndex, String... keys) {
        for (String key : keys) {
            String normalizedKey = key.toLowerCase().replace('_', ' ');
            Integer idx = colIndex.get(normalizedKey);
            if (idx == null)
                idx = colIndex.get(key.toLowerCase());

            if (idx != null) {
                String val = getCellString(row, idx);
                if (val != null && !val.isBlank())
                    return val.trim();
            }
        }
        return null;
    }

    private boolean hasAnyValue(Row row, Map<String, Integer> colIndex, String... keys) {
        return lookupOrNull(row, colIndex, keys) != null;
    }

    private java.math.BigDecimal parseBigDecimal(Row row, Map<String, Integer> colIndex, String... keys) {
        String val = lookupOrNull(row, colIndex, keys);
        if (val == null || val.isBlank())
            return null;
        try {
            return new java.math.BigDecimal(val.replaceAll("[^0-9.]", ""));
        } catch (Exception e) {
            return null;
        }
    }

    private LaborerStatus parseStatus(Row row, Map<String, Integer> colIndex) {
        String val = lookupOrNull(row, colIndex, "status");
        if (val == null || val.isBlank())
            return DEFAULT_STATUS;
        try {
            return LaborerStatus.valueOf(val.trim().toUpperCase());
        } catch (Exception e) {
            // Check for common variations
            String s = val.trim().toLowerCase();
            if (s.contains("active")) return LaborerStatus.ACTIVE;
            if (s.contains("leave")) return LaborerStatus.ON_LEAVE;
            return LaborerStatus.INACTIVE;
        }
    }

    private LocalDate parseDate(Row row, Map<String, Integer> colIndex, String... keys) {
        for (String key : keys) {
            String normalizedKey = key.toLowerCase().replace('_', ' ');
            Integer idx = colIndex.get(normalizedKey);
            if (idx == null)
                idx = colIndex.get(key.toLowerCase());
            if (idx == null)
                continue;

            Cell cell = row.getCell(idx, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
            if (cell == null)
                continue;

            if (cell.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(cell)) {
                return cell.getLocalDateTimeCellValue().toLocalDate();
            }

            String val = getCellString(cell);
            if (val == null || val.isBlank())
                continue;

            for (DateTimeFormatter fmt : DATE_FORMATS) {
                try {
                    return LocalDate.parse(val.trim(), fmt);
                } catch (DateTimeParseException ignored) {
                }
            }
        }
        return null;
    }

    private LaborerDTO.AddressDTO buildAddress(Row row, Map<String, Integer> colIndex) {
        String line = lookupOrNull(row, colIndex, "address", "permanent address", "home address");
        String state = lookupOrNull(row, colIndex, "state");
        String pincode = lookupOrNull(row, colIndex, "pincode", "pin", "zip");

        if (line == null && state == null && pincode == null)
            return null;

        return LaborerDTO.AddressDTO.builder()
                .line(line != null ? line : NOT_AVAILABLE)
                .state(state != null ? state : NOT_AVAILABLE)
                .pincode(pincode != null ? pincode : NOT_AVAILABLE)
                .build();
    }

    private LaborerDTO.IdProofDTO buildIdProof(Row row, Map<String, Integer> colIndex) {
        String type = lookupOrNull(row, colIndex, "id type", "identity type", "id_type");
        String number = lookupOrNull(row, colIndex, "id number", "identity number", "aadhar", "voter id", "id_number");

        if (type == null && number == null)
            return null;

        return LaborerDTO.IdProofDTO.builder()
                .type(type != null ? type.toUpperCase() : NOT_AVAILABLE)
                .idNumber(number != null ? number : NOT_AVAILABLE)
                .build();
    }

    private LaborerDTO.BankDetailsDTO buildBankDetails(Row row, Map<String, Integer> colIndex) {
        String bank = lookupOrNull(row, colIndex, "bank name", "bank", "bank_name");
        String branch = lookupOrNull(row, colIndex, "branch");
        String account = lookupOrNull(row, colIndex, "account no", "account number", "acc no", "account_no");
        String ifsc = lookupOrNull(row, colIndex, "ifsc code", "ifsc", "ifsc_code");

        if (bank == null && branch == null && account == null && ifsc == null)
            return null;

        return LaborerDTO.BankDetailsDTO.builder()
                .bankName(bank != null ? bank : NOT_AVAILABLE)
                .branch(branch != null ? branch : NOT_AVAILABLE)
                .accountNo(account != null ? account : NOT_AVAILABLE)
                .ifscCode(ifsc != null ? ifsc : NOT_AVAILABLE)
                .build();
    }

    private ExcelImportResultDTO buildResult(List<LaborerDTO> valid, List<ExcelImportResultDTO.RowError> errors) {
        return ExcelImportResultDTO.builder()
                .totalRows(valid.size() + errors.size())
                .validCount(valid.size())
                .errorCount(errors.size())
                .validRows(valid)
                .errors(errors)
                .build();
    }

    private ExcelImportResultDTO.RowError rowError(int row, String grNo, String msg) {
        return ExcelImportResultDTO.RowError.builder()
                .rowNumber(row)
                .grNo(grNo)
                .message(msg)
                .build();
    }

    private boolean isRowBlank(Row row) {
        for (Cell cell : row) {
            if (cell != null && cell.getCellType() != CellType.BLANK) {
                String val = getCellString(cell);
                if (val != null && !val.isBlank())
                    return false;
            }
        }
        return true;
    }

    private String getCellString(Row row, int colIdx) {
        Cell cell = row.getCell(colIdx, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
        return getCellString(cell);
    }

    private String getCellString(Cell cell) {
        if (cell == null)
            return null;
        return switch (cell.getCellType()) {
            case STRING -> {
                String s = cell.getStringCellValue();
                yield (s == null || s.isBlank()) ? null : s;
            }
            case NUMERIC -> {
                if (DateUtil.isCellDateFormatted(cell))
                    yield null;
                yield numericToString(cell.getNumericCellValue());
            }
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            case FORMULA -> {
                switch (cell.getCachedFormulaResultType()) {
                    case STRING -> {
                        yield cell.getStringCellValue();
                    }
                    case NUMERIC -> {
                        if (DateUtil.isCellDateFormatted(cell))
                            yield null;
                        yield numericToString(cell.getNumericCellValue());
                    }
                    default -> {
                        yield null;
                    }
                }
            }
            default -> null;
        };
    }

    private String numericToString(double d) {
        if (d == Math.floor(d) && !Double.isInfinite(d)) {
            return String.valueOf((long) d);
        }
        return String.valueOf(d);
    }
}
