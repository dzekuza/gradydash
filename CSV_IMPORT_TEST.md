# CSV Import Test Guide

This guide helps you test the CSV import functionality for products in the Grady
ReSellOps dashboard.

## Overview

The CSV import system allows you to bulk import products from a CSV file with
the following features:

1. **Multi-Environment Support**: CSV import works in any environment
2. **Validation**: Comprehensive validation of all fields
3. **Error Handling**: Detailed error reporting for failed imports
4. **Category Support**: Import products with categories
5. **Flexible Mapping**: Map CSV columns to product fields

## Test Setup

### 1. Prepare Test Data

1. Download the template: `public/templates/products_template.csv`
2. Open the template in Excel, Google Sheets, or any CSV editor
3. Fill in test data following the format guidelines

### 2. Test the Import

1. Go to any environment's products page (e.g., `/your-env/products`)
2. Click the "Import Products" button
3. Select your CSV file
4. Review the preview and click "Import"

## CSV Format

### Required Fields

- `title` - Product title (required)
- `status` - Product status (required, must be one of: taken, in_repair,
  selling, sold, returned, discarded)

### Optional Fields

- `sku` - Stock keeping unit
- `barcode` - Product barcode
- `description` - Product description
- `location_id` - Location ID (must exist in the environment)
- `purchase_price` - Purchase price (numeric)
- `selling_price` - Selling price (numeric)
- `categories` - Semicolon-separated category IDs (e.g.,
  "mobile-phones-main;smartphones")

### Example CSV

```csv
title,sku,barcode,description,status,location_id,purchase_price,selling_price,categories
iPhone 13,IPH13-001,1234567890123,Excellent condition iPhone 13,selling,1,500.00,650.00,mobile-phones-main;smartphones
MacBook Pro,MBP-001,9876543210987,MacBook Pro 2021 model,selling,1,800.00,1000.00,laptops-main;macbooks
```

## Validation Rules

### Status Validation

- Must be one of: `taken`, `in_repair`, `selling`, `sold`, `returned`,
  `discarded`
- Case-sensitive

### Price Validation

- Must be numeric values
- Can include decimal places
- Negative values are not allowed

### Location Validation

- `location_id` must exist in the current environment
- If not provided, product will be created without a location

### Category Validation

- Categories must be valid category IDs from the system
- Multiple categories separated by semicolons
- Invalid categories will be ignored

## Error Handling

### Import Errors

The system provides detailed error messages for:

1. **Validation Errors**: Invalid data format or values
2. **Database Errors**: Issues with data insertion
3. **Permission Errors**: User doesn't have permission to create products

### Error Reporting

- Each row with errors is reported individually
- Import continues for valid rows
- Summary shows total imported vs failed rows

## Testing Scenarios

### 1. Basic Import

**Goal**: Test basic product import functionality

**Steps**:

1. Create a CSV with 5-10 products
2. Include all required fields
3. Use valid status values
4. Import and verify products appear in the list

**Expected Result**: All products imported successfully

### 2. Validation Testing

**Goal**: Test validation error handling

**Steps**:

1. Create a CSV with invalid data:
   - Invalid status values
   - Non-numeric prices
   - Missing required fields
2. Attempt import
3. Review error messages

**Expected Result**: Clear error messages for each invalid row

### 3. Category Testing

**Goal**: Test category import functionality

**Steps**:

1. Create a CSV with category IDs
2. Use valid category IDs from the system
3. Import and verify categories are assigned

**Expected Result**: Products show correct category badges

### 4. Large Import

**Goal**: Test performance with large datasets

**Steps**:

1. Create a CSV with 100+ products
2. Include various data types
3. Monitor import performance
4. Verify all products imported

**Expected Result**: Import completes successfully within reasonable time

### 5. Mixed Data

**Goal**: Test import with mixed valid/invalid data

**Steps**:

1. Create a CSV with some valid and some invalid rows
2. Import and check error reporting
3. Verify only valid products are created

**Expected Result**: Valid products imported, invalid ones reported as errors

## Troubleshooting

### Common Issues

1. **"Invalid status" errors**
   - Check that status values match exactly: `taken`, `in_repair`, `selling`,
     `sold`, `returned`, `discarded`
   - Status is case-sensitive

2. **"Invalid price" errors**
   - Ensure prices are numeric values
   - Remove currency symbols and commas
   - Use decimal points, not commas

3. **"Location not found" errors**
   - Verify location_id exists in the current environment
   - Check that you're importing to the correct environment

4. **"Category not found" errors**
   - Use valid category IDs from the system
   - Check spelling and format of category IDs
   - Separate multiple categories with semicolons

### Performance Tips

1. **Batch Size**: For large imports, consider splitting into smaller files
2. **Data Quality**: Clean data before import to reduce validation errors
3. **Network**: Ensure stable internet connection for large imports

## API Reference

### Import Endpoint

The import functionality uses the following server action:

```typescript
importProducts(products: ImportProduct[], environmentId?: string)
```

### ImportProduct Interface

```typescript
interface ImportProduct {
   title: string;
   sku?: string;
   barcode?: string;
   description?: string;
   status: string;
   location_id?: string;
   purchase_price?: number;
   selling_price?: number;
   categories?: string[];
}
```

## Conclusion

The import system now works in all environments with comprehensive validation
and error handling!

### Key Features

- ✅ Multi-environment support
- ✅ Comprehensive validation
- ✅ Detailed error reporting
- ✅ Category support
- ✅ Flexible field mapping
- ✅ Performance optimized
