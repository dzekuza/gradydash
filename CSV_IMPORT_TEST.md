# CSV Import Test Guide

This guide will help you test the CSV import functionality to ensure it's
working correctly.

## ✅ What's Been Fixed

1. **Field Mapping Interface**: Users can now map CSV columns to app fields
2. **Demo Mode Support**: CSV import now works in demo environment without
   authentication
3. **Proper Error Handling**: Better validation and error messages
4. **Category Validation**: Validates categories against the system's category
   list
5. **Location Mapping**: Maps location names to existing location IDs
6. **Batch Processing**: Handles large imports in batches
7. **Auto-Mapping**: Automatically maps common column names

## 🎯 New Field Mapping Feature

The import now has a 3-step process:

1. **Upload CSV**: Select your CSV file
2. **Map Fields**: Map CSV columns to app fields
3. **Preview & Import**: Review data and import

### How Field Mapping Works

- Upload any CSV with your own column names
- The system will auto-map common variations (e.g., "Product Name" → name)
- Manually adjust mappings as needed
- Only "Product Name" and "Status" are required
- Skip columns you don't want to import

## 📋 Testing the Import

### ✅ Test File

Use the updated test file: `public/templates/test_import.csv`

This file contains:

- User-friendly column names
- 4 sample products
- Valid categories from the system
- Different statuses (taken, selling)

### ✅ Valid Import

The test file includes:

- **iPhone 13 Pro** (taken status)
- **MacBook Air M1** (selling status)
- **Sony WH-1000XM4** (selling status)
- **Nespresso Vertuo** (taken status)

### ❌ Test Error Cases

Try these to test validation:

1. **Missing required fields**: Remove "Product Name" or "Status" columns
2. **Invalid status**: Use status not in: `taken`, `in_repair`, `selling`,
   `sold`, `returned`, `discarded`
3. **Invalid categories**: Use category IDs not in the system
4. **Invalid prices**: Use negative or non-numeric prices

## 🔧 How to Test

### 1. Access the Import Dialog

1. Go to `/demo/products` or any environment's products page
2. Click "Import CSV" button
3. The dialog will open with the new 3-step interface

### 2. Test the Field Mapping

1. **Upload**: Select `public/templates/test_import.csv`
2. **Mapping**: You'll see the CSV columns on the left, app fields on the right
3. **Auto-mapping**: Notice how "Product Name" maps to "Product Name (Required)"
4. **Manual mapping**: Try changing some mappings
5. **Preview**: Click "Preview Import" to see the parsed data
6. **Import**: Click "Import Products" to complete the import

### 3. Verify Results

- Check that products appear in the products table
- Verify categories are correctly assigned
- Confirm prices and statuses are correct
- Check that locations are properly linked

## ✅ Expected Behavior

### ✅ Successful Import

- Shows field mapping interface
- Auto-maps common column names
- Displays preview of first 5 rows
- Shows validation success
- Imports all products correctly
- Shows success toast message

### ❌ Failed Import

- Shows validation errors in mapping step
- Lists specific issues in preview step
- Prevents import if errors exist
- Shows error toast message

## 📊 Supported Fields

### Required Fields

- `name`: Product name (required)
- `status`: Must be one of: `taken`, `in_repair`, `selling`, `sold`, `returned`,
  `discarded`

### Optional Fields

- `id`: External ID
- `type`: Product type
- `sku`: Stock keeping unit
- `gtin`: Global Trade Item Number
- `upc`: Universal Product Code
- `ean`: European Article Number
- `isbn`: International Standard Book Number
- `short_description`: Brief product description
- `description`: Full product description
- `purchase_price`: Cost price (numeric)
- `selling_price`: Sale price (numeric)
- `categories`: Semicolon-separated category IDs
- `tags`: Semicolon-separated tags
- `location_name`: Name of existing location
- `in_stock`: Boolean (true/false, 1/0, yes/no)
- `images`: Image URLs (comma-separated)

## 🔍 Troubleshooting

### "Invalid file type"

- Make sure file has `.csv` extension
- Check file is actually CSV format

### "Missing required field mappings"

- Ensure CSV has columns that can be mapped to "Product Name" and "Status"
- Check column names are clear and recognizable

### "Invalid status"

- Status must be exactly: `taken`, `in_repair`, `selling`, `sold`, `returned`,
  `discarded`

### "Invalid category IDs"

- Use category IDs from the system (e.g., `mobile-phones-main`, `laptops-main`)
- Check the categories utility for valid IDs

### "Location not found"

- Location names must match existing locations exactly
- Check case sensitivity

### "Invalid price"

- Prices must be positive numbers
- Use decimal format (e.g., "100.50")

## 📝 Test File Format

The test file includes:

```
Product Name,Status,Purchase Price,Selling Price,SKU,Categories,Location,Description
"iPhone 13 Pro","taken","800.00","1200.00","IP13P001","mobile-phones-main;phone-case","Main Store","Excellent condition iPhone 13 Pro with 256GB storage"
"MacBook Air M1","selling","900.00","1400.00","MBA001","laptops-main;laptop-accessories","Online Store","Like new MacBook Air with M1 chip"
```

## 🚀 Production Usage

For production environments:

1. Create locations first
2. Use valid category IDs
3. Ensure proper authentication
4. Test with small files first
5. Use the field mapping to match your CSV format

## ✅ Summary

The import system now works in both demo and production environments!

**Key Features:**

- ✅ Flexible field mapping
- ✅ Auto-mapping of common column names
- ✅ 3-step import process
- ✅ Comprehensive validation
- ✅ Demo mode support
- ✅ Error handling and user feedback

The field mapping makes the import much more user-friendly - users can upload
any CSV format and map it to the app's fields!
