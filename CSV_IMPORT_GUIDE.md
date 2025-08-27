# CSV Import Guide for Products

This guide explains how to use the CSV import functionality to bulk import
products into your Grady Dashboard.

## Overview

The CSV import feature allows you to import multiple products at once using a
CSV file. This is useful for:

- Bulk product onboarding
- Data migration from other systems
- Regular inventory updates

## CSV Template

Download the template from the import dialog or use the following structure:

```csv
id,type,sku,gtin,upc,ean,isbn,name,short_description,description,in_stock,categories,tags,images,status,purchase_price,selling_price,location_name
```

## Field Descriptions

### Required Fields

- **name**: Product name/title (required)
- **status**: Product status (required) - must be one of: `taken`, `in_repair`,
  `selling`, `sold`, `returned`, `discarded`

### Optional Fields

- **id**: External ID from your system
- **type**: Product type/category (e.g., "Electronics", "Books", "Clothing")
- **sku**: Stock Keeping Unit
- **gtin**: Global Trade Item Number
- **upc**: Universal Product Code
- **ean**: European Article Number
- **isbn**: International Standard Book Number
- **short_description**: Brief product description
- **description**: Full product description
- **in_stock**: Whether product is in stock (true/false, 1/0, yes/no)
- **categories**: Product categories separated by semicolons (e.g.,
  "Electronics;Smartphones")
- **tags**: Product tags separated by semicolons (e.g., "Apple;iPhone;5G")
- **images**: Image URLs (comma-separated if multiple)
- **purchase_price**: Purchase price in EUR
- **selling_price**: Selling price in EUR
- **location_name**: Location name (must exist in your environment)

## Example CSV

```csv
id,type,sku,gtin,upc,ean,isbn,name,short_description,description,in_stock,categories,tags,images,status,purchase_price,selling_price,location_name
"PROD001","Electronics","IP13P001","1234567890123","","","","iPhone 13 Pro","Excellent condition iPhone 13 Pro","Excellent condition iPhone 13 Pro with 256GB storage",true,"Electronics;Smartphones","Apple;iPhone;5G",,taken,800.00,1200.00,"Main Store"
"PROD002","Electronics","MBA001","","9876543210987","","","MacBook Air M1","Like new MacBook Air","Like new MacBook Air with M1 chip",true,"Electronics;Computers","Apple;MacBook;M1",,selling,900.00,1400.00,"Online Store"
```

## How to Import

1. **Navigate to Products Page**: Go to your environment's products page
2. **Click Import CSV**: Click the "Import CSV" button in the top right
3. **Download Template**: Click "Download template" to get the CSV template
4. **Prepare Your Data**: Fill in your product data following the template
   format
5. **Upload File**: Select your CSV file in the import dialog
6. **Review Preview**: Check the preview of the first 5 rows
7. **Import**: Click "Import Products" to complete the import

## Validation Rules

The import system validates your data and will show errors for:

- Missing required fields (name, status)
- Invalid status values
- Invalid price formats
- Missing locations (location names must exist in your environment)

## Data Mapping

- CSV `name` field maps to database `title` field
- CSV `id` field maps to database `external_id` field
- CSV `type` field maps to database `product_type` field
- Categories and tags are stored as arrays in the database
- Location names are matched to existing location IDs

## Permissions

Only users with the following roles can import products:

- `reseller_manager`
- `grady_staff`
- `grady_admin`

## Error Handling

If there are validation errors:

- The import will be blocked
- Error details will be shown in the dialog
- You can fix the errors and try again

## Best Practices

1. **Use the Template**: Always start with the provided template
2. **Test with Small Files**: Test with a few products first
3. **Check Locations**: Ensure all location names exist in your environment
4. **Validate Data**: Review your data before importing
5. **Backup**: Consider backing up your data before large imports

## Database Schema

The import creates products with the following fields:

- `environment_id`: Automatically set to current environment
- `title`: Product name from CSV
- `external_id`: External ID from CSV
- `product_type`: Product type from CSV
- `sku`, `gtin`, `upc`, `ean`, `isbn`: Various barcode fields
- `short_description`, `description`: Product descriptions
- `categories`, `tags`: Arrays of categories and tags
- `status`: Product status
- `purchase_price`, `selling_price`: Price fields
- `location_id`: Mapped from location name
- `status_updated_at`: Automatically set to current timestamp

## Support

If you encounter issues with the import:

1. Check the validation errors in the import dialog
2. Verify your CSV format matches the template
3. Ensure all location names exist in your environment
4. Contact support if problems persist
