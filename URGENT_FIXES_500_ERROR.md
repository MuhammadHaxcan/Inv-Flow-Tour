# Urgent Fixes for 500 Internal Server Error

## Problem
The Invoice endpoints were returning 500 Internal Server Error while Reports endpoints worked fine.

## Root Causes Found

### 1. **LINQ SQL Translation Issue in GetNextInvoiceNumberAsync**
**Problem**: The query using `StartsWith` with string interpolation didn't translate well to PostgreSQL SQL.

**Fix**: Changed to load invoice numbers first, then filter in memory.

```csharp
// Before (causing SQL translation error):
var invoices = await _context.Invoices
    .Where(i => !string.IsNullOrEmpty(i.Number) && i.Number.StartsWith($"INV-{currentYear}-"))
    .ToListAsync();

// After (loads only numbers, filters in memory):
var allInvoices = await _context.Invoices
    .Select(i => i.Number)
    .ToListAsync();

var invoices = allInvoices
    .Where(number => !string.IsNullOrEmpty(number) && number.StartsWith(prefix))
    .ToList();
```

---

### 2. **Missing ThenInclude for Related Entities**
**Problem**: When loading invoices, we weren't including the related Service and ExpenseType entities that are needed for mapping to DTOs.

**Fix**: Added `.ThenInclude()` for Service and ExpenseType:

```csharp
var allInvoices = await _context.Invoices
    .Include(i => i.Customer)
    .Include(i => i.Driver)
    .Include(i => i.InvoiceServices)
        .ThenInclude(isr => isr.Service)  // ← ADDED
    .Include(i => i.InvoiceExpenses)
        .ThenInclude(ie => ie.ExpenseType)  // ← ADDED
    .Include(i => i.Payments)
        .ThenInclude(p => p.Account)
    .ToListAsync();
```

---

### 3. **Added Comprehensive Error Logging**
**Problem**: Errors were happening silently, making debugging impossible.

**Fix**: Added try-catch blocks with detailed logging to all critical methods:

```csharp
public async Task<ActionResult<object>> GetNextInvoiceNumber()
{
    try
    {
        var number = await _invoiceService.GetNextInvoiceNumberAsync();
        return Ok(new { number });
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error in GetNextInvoiceNumber: {ex.Message}");
        Console.WriteLine($"Stack trace: {ex.StackTrace}");
        return StatusCode(500, new { error = ex.Message, stackTrace = ex.StackTrace });
    }
}
```

---

## Files Modified

### Backend (C#/.NET Core)
1. **`inv-flow-backend/Services/InvoiceService.cs`**
   - Fixed `GetNextInvoiceNumberAsync()` - SQL translation issue
   - Added `.ThenInclude()` in `GetOpenInvoicesAsync()`
   - Added `.ThenInclude()` in `GetClosedInvoicesAsync()`
   - Added try-catch error logging to all methods

2. **`inv-flow-backend/Controllers/InvoicesController.cs`**
   - Added try-catch blocks to `GetNextInvoiceNumber()`
   - Added try-catch blocks to `GetOpenInvoices()`
   - Added try-catch blocks to `GetClosedInvoices()`
   - Added try-catch blocks to `Create()`
   - All errors now return detailed error messages

---

## How to Apply the Fix

### Step 1: Stop the Backend
- Go to the terminal running the backend
- Press `Ctrl+C` to stop it

### Step 2: Restart the Backend
```bash
cd inv-flow-backend
dotnet run
```

### Step 3: Watch for Startup Errors
The backend should start successfully. Watch for:
- ✅ Database migrations applied
- ✅ Seed data created
- ✅ Server listening on http://localhost:5104

### Step 4: Refresh the Frontend
- Refresh your browser (F5)
- The 500 errors should be gone

---

## Testing

### 1. Test Next Invoice Number
- Navigate to "Generate Invoice"
- You should see an invoice number like `INV-2025-0001`
- No errors in console

### 2. Test Open Invoices
- Navigate to "Open Invoices"
- List should load (may be empty if no invoices exist)
- No 500 errors

### 3. Test Closed Invoices  
- Navigate to "Closed Invoices"
- List should load (may be empty if no invoices exist)
- No 500 errors

### 4. Test Invoice Creation
- Navigate to "Generate Invoice"
- Fill in the form (customer, service, persons)
- Click "Save Invoice"
- Invoice should be created successfully

---

## If You Still See Errors

### Check Backend Console
Look for error messages like:
```
Error in GetNextInvoiceNumber: <error message>
Stack trace: <stack trace>
```

This will tell us exactly what's failing.

### Common Issues

#### Database Connection Error
**Symptom**: `Cannot connect to database` or `Connection refused`

**Fix**: 
1. Ensure PostgreSQL is running
2. Check connection string in `appsettings.json`
3. Run migrations: `dotnet ef database update`

#### Permission Error
**Symptom**: 401 or 403 errors (not 500)

**Fix**:
1. Check that you're logged in
2. Verify your user has "invoices.read" and "invoices.write" permissions
3. Check the admin user in seed data has the Admin role

#### AutoMapper Error
**Symptom**: Error about missing mappings

**Fix**:
1. Verify `MappingProfile.cs` has all required mappings
2. Restart backend to reload mappings

---

## Why Reports Work But Invoices Don't

**Reports** use:
- POST methods (more robust)
- Simple queries without complex LINQ
- Minimal related entity loading

**Invoices** had issues with:
- Complex LINQ queries (StartsWith, string interpolation)
- Multiple levels of related entity loading
- Missing ThenInclude causing null reference issues

---

## Technical Details

### LINQ to SQL Translation
PostgreSQL has specific requirements for how LINQ queries translate to SQL. Operations like `StartsWith` with string interpolation don't always translate well. The solution is to:

1. Load data with simple queries
2. Filter in memory using regular C# LINQ
3. This is fast for small datasets (invoice numbers are small strings)

### Entity Framework Include Chain
When you have relationships like:
```
Invoice → InvoiceServiceItem → Service
```

You need:
```csharp
.Include(i => i.InvoiceServices)
    .ThenInclude(isr => isr.Service)
```

Not just:
```csharp
.Include(i => i.InvoiceServices)  // Missing Service entity!
```

### AutoMapper Requirements
AutoMapper needs all related entities loaded to map them correctly. If you try to map:
```csharp
InvoiceServiceItem → InvoiceServiceDto
```

And ServiceName comes from the Service entity, you must load Service first.

---

## Summary

✅ **Fixed**: SQL translation issue in GetNextInvoiceNumberAsync
✅ **Fixed**: Missing ThenInclude for related entities
✅ **Added**: Comprehensive error logging
✅ **Added**: Try-catch blocks in all endpoints

**Status**: Ready to test after backend restart

---

**Created**: November 26, 2025
**Priority**: URGENT
**Impact**: High - Blocks all invoice operations
**Resolution**: Restart backend after applying fixes

