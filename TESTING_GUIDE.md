# Invoice Flow Tour - Testing Guide

## Overview
This guide provides comprehensive testing instructions for the Invoice Flow Tour application after applying the backend and frontend fixes.

---

## Prerequisites

### Backend Setup
1. Ensure PostgreSQL is running
2. Update connection string in `appsettings.json` if needed
3. Run migrations (should auto-apply on startup)

### Frontend Setup
1. Ensure Node.js is installed (v16+ recommended)
2. Install dependencies if not already done: `npm install`

---

## Starting the Application

### 1. Start Backend (Terminal 1)
```bash
cd inv-flow-backend
dotnet run
```

Expected output:
- Application should start on `http://localhost:5104` or `https://localhost:7291`
- Swagger UI available at `http://localhost:5104/swagger`
- Database migrations applied automatically
- Seed data created (admin user, default roles, etc.)

### 2. Start Frontend (Terminal 2)
```bash
cd inv-flow
npm run dev
```

Expected output:
- Application should start on `http://localhost:5173`
- Browser should open automatically

### 3. Login
- Default credentials should be in your seed data
- Navigate to login page
- Enter credentials
- Should redirect to dashboard

---

## Test Scenarios

### Test 1: Invoice Generation ✓

**Purpose**: Verify that invoices can be created with services, expenses, and payments.

**Steps**:
1. Navigate to "Generate Invoice" page
2. **Select Customer**:
   - Click customer dropdown
   - Select an existing customer OR
   - Click "+" to add a new customer
3. **Set Service Date**:
   - Use date picker or keep today's date
4. **Add Service** (REQUIRED):
   - Select a service from dropdown
   - Verify rate auto-fills
   - You can modify the rate if needed
5. **Set Person Accommodation** (REQUIRED):
   - Enter number of persons (e.g., 2)
6. **Optional: Assign Driver**:
   - Click "Assign Driver"
   - Select from dropdown
7. **Optional: Add Expense**:
   - Click "Add Expense"
   - Select expense type
   - Enter amount and date
8. **Optional: Add Payment**:
   - Click "Add Payment" (in ServiceForm modal or later)
   - Select account/method
   - Enter amount
9. **Save Invoice**:
   - Click "Save Invoice"
   - Should redirect to "Open Invoices"
   - New invoice should appear in the list

**Expected Results**:
- ✅ Invoice created successfully
- ✅ Invoice number auto-generated (e.g., INV-2025-0001)
- ✅ Invoice appears in "Open Invoices" if not fully paid
- ✅ Invoice appears in "Closed Invoices" if fully paid
- ✅ All data displays correctly (customer, services, totals)

---

### Test 2: Open Invoices - Add Service ✓

**Purpose**: Verify that services can be added to existing invoices.

**Steps**:
1. Navigate to "Open Invoices"
2. Click on an invoice to expand it
3. In the Services section, click "Add Service"
4. Select a service from dropdown
5. Enter or confirm the rate
6. Click "Save"

**Expected Results**:
- ✅ Service added successfully
- ✅ Invoice total updated immediately
- ✅ Service appears in the services list
- ✅ Invoice status updated if needed (unpaid → partial → paid)

---

### Test 3: Open Invoices - Edit Service ✓

**Purpose**: Verify that existing services can be modified.

**Steps**:
1. Navigate to "Open Invoices"
2. Expand an invoice with multiple services
3. Click "Edit" button (pencil icon) on a service
4. Change the rate
5. Click "Save"

**Expected Results**:
- ✅ Service updated successfully
- ✅ Invoice total recalculated immediately
- ✅ Changes reflect in the UI
- ✅ No duplicate services created

---

### Test 4: Open Invoices - Delete Service ✓

**Purpose**: Verify that services can be removed from invoices (except the last one).

**Steps**:
1. Navigate to "Open Invoices"
2. Expand an invoice with MORE than one service
3. Click "Delete" button (trash icon) on a service
4. Confirm deletion

**Expected Results**:
- ✅ Service removed successfully
- ✅ Invoice total updated immediately
- ✅ Service disappears from the list
- ✅ Cannot delete the last/only service (button disabled or warning shown)

---

### Test 5: Open Invoices - Add Payment ✓

**Purpose**: Verify that payments can be added to invoices.

**Steps**:
1. Navigate to "Open Invoices"
2. Expand an unpaid or partially paid invoice
3. Click "Add Payment" button
4. Select payment method/account
5. Enter amount (try partial amount first)
6. Enter optional reference and notes
7. Click "Save"

**Expected Results**:
- ✅ Payment added successfully
- ✅ Invoice status updated (unpaid → partial → paid)
- ✅ Payment appears in payments list
- ✅ Balance due updated
- ✅ If fully paid, invoice moves to "Closed Invoices"
- ✅ Transaction created in accounts

---

### Test 6: Open Invoices - Add Expense ✓

**Purpose**: Verify that expenses can be added to invoices.

**Steps**:
1. Navigate to "Open Invoices"
2. Expand an invoice
3. Click "Add Expense" button
4. Select expense type
5. Enter amount
6. Enter date
7. Add optional description
8. Click "Save"

**Expected Results**:
- ✅ Expense added successfully
- ✅ Expense appears in expenses list
- ✅ Total expenses calculated
- ✅ Net amount updated
- ✅ Transaction created in accounts

---

### Test 7: Open Invoices - Edit Expense ✓

**Purpose**: Verify that expenses can be modified.

**Steps**:
1. Navigate to "Open Invoices"
2. Expand an invoice with expenses
3. Click "Edit" button on an expense
4. Change amount or type
5. Click "Save"

**Expected Results**:
- ✅ Expense updated successfully
- ✅ Totals recalculated
- ✅ Transaction updated in accounts

---

### Test 8: Open Invoices - Delete Expense ✓

**Purpose**: Verify that expenses can be removed.

**Steps**:
1. Navigate to "Open Invoices"
2. Expand an invoice with expenses
3. Click "Delete" button on an expense
4. Confirm deletion

**Expected Results**:
- ✅ Expense removed successfully
- ✅ Totals recalculated
- ✅ Transaction removed from accounts

---

### Test 9: Open Invoices - Assign/Change Driver ✓

**Purpose**: Verify that drivers can be assigned or changed.

**Steps**:
1. Navigate to "Open Invoices"
2. Expand an invoice
3. Click "Edit" button next to driver field OR "Assign Driver"
4. Select a driver from dropdown
5. Click "Save"

**Expected Results**:
- ✅ Driver assigned successfully
- ✅ Driver name displays in invoice
- ✅ Changes reflect immediately

---

### Test 10: Closed Invoices - View Details ✓

**Purpose**: Verify that closed (fully paid) invoices display correctly.

**Steps**:
1. Navigate to "Closed Invoices"
2. Click on an invoice to expand it
3. Review all sections:
   - Services
   - Expenses
   - Payments
   - Summary

**Expected Results**:
- ✅ All data displays correctly
- ✅ Status shows "Paid"
- ✅ Balance due is 0.00
- ✅ VAT calculations are correct
- ✅ Net amount calculations are correct
- ✅ All payment records are visible

---

### Test 11: Closed Invoices - Print ✓

**Purpose**: Verify that invoices can be printed.

**Steps**:
1. Navigate to "Closed Invoices"
2. Click on an invoice to expand it
3. Click "Print" button
4. Review print preview

**Expected Results**:
- ✅ Print dialog opens
- ✅ Invoice formatted correctly for printing
- ✅ All data is visible and readable
- ✅ Company information displays
- ✅ Service details with VAT breakdown
- ✅ Payment information included

---

### Test 12: Calendar View ✓

**Purpose**: Verify that invoices display correctly in calendar view.

**Steps**:
1. Navigate to "Calendar View"
2. Check that invoices appear on their respective dates
3. Click on an invoice event
4. Review the invoice details in the modal

**Expected Results**:
- ✅ Open invoices show in yellow
- ✅ Closed invoices show in green
- ✅ Clicking an event shows invoice details
- ✅ Customer name displays correctly
- ✅ Services list displays correctly
- ✅ Dates are correct

---

### Test 13: Reports ✓

**Purpose**: Verify that reports generate correctly with updated data.

**Steps**:
1. Navigate to "Reports" page
2. **Service Report**:
   - Generate without filters
   - Apply date range filter
   - Apply service filter
3. **Customer Report**:
   - Generate without filters
   - Apply date range filter
   - Apply customer filter
4. **Driver Report**:
   - Generate without filters
   - Apply date range filter
   - Apply driver filter
5. **Summary Report**:
   - Generate without filters
   - Apply various filters

**Expected Results**:
- ✅ All reports generate successfully
- ✅ Data is accurate and consistent
- ✅ Filters work correctly
- ✅ Totals are calculated correctly
- ✅ Date ranges apply correctly

---

## Data Validation Tests

### Test 14: Required Field Validation ✓

**Purpose**: Verify that required fields are enforced.

**Steps**:
1. Try to create an invoice without:
   - Customer (should fail)
   - Service (should fail)
   - Person accommodation (should fail)
2. Try to add a payment without:
   - Amount (should fail)
   - Account (should fail)
3. Try to add an expense without:
   - Type (should fail)
   - Amount (should fail)

**Expected Results**:
- ✅ Validation messages appear
- ✅ Form doesn't submit
- ✅ User is guided to fix errors

---

### Test 15: Numeric Field Validation ✓

**Purpose**: Verify that numeric fields accept only valid values.

**Steps**:
1. Try to enter negative values for:
   - Service rate
   - Payment amount
   - Expense amount
   - Person accommodation
2. Try to enter zero values
3. Try to enter non-numeric values

**Expected Results**:
- ✅ Only positive numbers accepted
- ✅ Zero values rejected (with appropriate messages)
- ✅ Non-numeric input prevented or rejected

---

### Test 16: Date Handling ✓

**Purpose**: Verify that dates are handled correctly.

**Steps**:
1. Create an invoice with today's date
2. Create an invoice with a past date
3. Create an invoice with a future date
4. Add expense with different date than invoice
5. Add payment with different date than invoice

**Expected Results**:
- ✅ All dates accepted and stored correctly
- ✅ Dates display in correct format (local format)
- ✅ Date filtering works in reports
- ✅ Calendar view shows invoices on correct dates

---

## Edge Cases

### Test 17: Multiple Services on One Invoice ✓

**Steps**:
1. Create/edit an invoice
2. Add 5+ different services
3. Edit one of them
4. Delete one of them

**Expected Results**:
- ✅ All services display correctly
- ✅ Total calculates correctly
- ✅ Operations work smoothly

---

### Test 18: Large Amounts ✓

**Steps**:
1. Create an invoice with very large service rates (e.g., 99999.99)
2. Add large payment amounts
3. Add large expense amounts

**Expected Results**:
- ✅ Large numbers handled correctly
- ✅ No overflow errors
- ✅ Display formatting remains correct

---

### Test 19: Decimal Precision ✓

**Steps**:
1. Enter amounts with various decimal places:
   - 100.1
   - 100.12
   - 100.123 (should round to 100.12)
2. Verify totals calculate correctly

**Expected Results**:
- ✅ Values rounded to 2 decimal places
- ✅ Calculations accurate
- ✅ No rounding errors in totals

---

### Test 20: Concurrent Operations ✓

**Steps**:
1. Open same invoice in two browser tabs
2. Make changes in one tab (add service)
3. Make different changes in other tab (add payment)
4. Refresh both tabs

**Expected Results**:
- ✅ Both changes applied
- ✅ No data loss
- ✅ State synchronized after refresh

---

## API Testing (Optional)

### Using Swagger UI

1. Navigate to `http://localhost:5104/swagger`
2. Authorize with JWT token:
   - Login via `/api/auth/login`
   - Copy the token from response
   - Click "Authorize" button
   - Enter: `Bearer {your-token}`
3. Test each endpoint:
   - GET requests return data in camelCase
   - POST requests accept camelCase data
   - PUT requests update correctly
   - DELETE requests remove data

---

## Performance Testing

### Test 21: Load Time ✓

**Steps**:
1. Navigate to different pages
2. Note load times
3. Check browser console for errors

**Expected Results**:
- ✅ Pages load in < 2 seconds
- ✅ No JavaScript errors in console
- ✅ No 404 errors for resources
- ✅ API calls complete successfully

---

### Test 22: Large Dataset ✓

**Steps**:
1. Create 50+ invoices
2. Navigate to "Open Invoices"
3. Navigate to "Closed Invoices"
4. Generate reports

**Expected Results**:
- ✅ Lists render smoothly
- ✅ Filtering works correctly
- ✅ No performance degradation
- ✅ Reports generate in reasonable time

---

## Regression Testing

### Test 23: Other CRUD Operations ✓

**Purpose**: Ensure that changes didn't break other parts of the app.

**Steps**:
1. **Customers**:
   - Create new customer
   - Edit customer
   - Delete customer
2. **Drivers**:
   - Create new driver
   - Edit driver
   - Delete driver
3. **Services**:
   - Create new service
   - Edit service
   - Delete service
4. **Accounts**:
   - Create new account
   - Edit account
   - Delete account
5. **Expense Types**:
   - Create new expense type
   - Edit expense type
   - Delete expense type

**Expected Results**:
- ✅ All CRUD operations work correctly
- ✅ Data displays in camelCase
- ✅ No errors in console

---

## Browser Compatibility

### Test 24: Cross-Browser Testing ✓

**Browsers to Test**:
- Chrome (latest)
- Firefox (latest)
- Edge (latest)
- Safari (if available)

**Steps**:
1. Open application in each browser
2. Perform key operations:
   - Login
   - Create invoice
   - Add payment
   - View reports

**Expected Results**:
- ✅ Application works in all browsers
- ✅ UI renders correctly
- ✅ No browser-specific errors

---

## Troubleshooting

### Common Issues

#### 1. Backend Not Starting
- Check PostgreSQL is running
- Verify connection string in appsettings.json
- Check for port conflicts (5104 or 7291)

#### 2. Frontend Can't Connect to Backend
- Verify backend is running
- Check CORS configuration in Program.cs
- Check API_BASE_URL in frontend api.js

#### 3. Data Not Displaying
- Check browser console for errors
- Verify API responses in Network tab
- Check that data is in camelCase format

#### 4. Login Issues
- Verify user exists in database
- Check JWT token configuration
- Clear browser storage and retry

---

## Test Results Template

Use this template to record test results:

```
Test #: [Number]
Test Name: [Name]
Date: [Date]
Tester: [Name]
Status: [Pass/Fail]
Notes: [Any observations]
Issues Found: [List issues]
```

---

## Automated Testing (Future)

### Backend Unit Tests
- Create tests for InvoiceService
- Create tests for validators
- Create tests for mapping profiles

### Frontend Unit Tests
- Create tests for DataContext
- Create tests for API calls
- Create tests for components

### Integration Tests
- Create end-to-end tests using Playwright or Cypress
- Test complete invoice lifecycle
- Test user authentication flow

---

## Conclusion

After completing all tests:
1. Document any issues found
2. Verify all critical paths work
3. Get stakeholder sign-off
4. Plan for deployment

---

**Last Updated**: November 26, 2025
**Version**: 1.0
**Status**: Ready for Testing

