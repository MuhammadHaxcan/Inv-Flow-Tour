using AutoMapper;
using inv_flow_backend.Data;
using inv_flow_backend.DTOs;
using inv_flow_backend.Models;
using inv_flow_backend.Models.Enums;
using inv_flow_backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace inv_flow_backend.Services;

public class InvoiceService : IInvoiceService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public InvoiceService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<InvoiceDto>> GetOpenInvoicesAsync()
    {
        // Get invoices that are in progress - unpaid or partially paid
        var invoices = await _context.Invoices
            .Where(i => i.Status != InvoiceStatus.Paid)
            .Include(i => i.Customer)
            .Include(i => i.Driver)
            .Include(i => i.InvoiceServices)
                .ThenInclude(isr => isr.Service)
            .Include(i => i.InvoiceExpenses)
                .ThenInclude(ie => ie.ExpenseType)
            .Include(i => i.InvoiceExpenses)
                .ThenInclude(ie => ie.Account)
            .Include(i => i.InvoiceExpenses)
                .ThenInclude(ie => ie.Vendor)
            .Include(i => i.Payments)
                .ThenInclude(p => p.Account)
            .OrderByDescending(i => i.Date)
            .AsNoTracking() // Performance optimization for read-only queries
            .ToListAsync();

        return _mapper.Map<List<InvoiceDto>>(invoices);
    }

    public async Task<List<InvoiceDto>> GetClosedInvoicesAsync()
    {
        // Get all fully paid and completed invoices
        var invoices = await _context.Invoices
            .Where(i => i.Status == InvoiceStatus.Paid)
            .Include(i => i.Customer)
            .Include(i => i.Driver)
            .Include(i => i.InvoiceServices)
                .ThenInclude(isr => isr.Service)
            .Include(i => i.InvoiceExpenses)
                .ThenInclude(ie => ie.ExpenseType)
            .Include(i => i.InvoiceExpenses)
                .ThenInclude(ie => ie.Account)
            .Include(i => i.InvoiceExpenses)
                .ThenInclude(ie => ie.Vendor)
            .Include(i => i.Payments)
                .ThenInclude(p => p.Account)
            .OrderByDescending(i => i.Date)
            .AsNoTracking() // Performance optimization for read-only queries
            .ToListAsync();

        return _mapper.Map<List<InvoiceDto>>(invoices);
    }

    public async Task<InvoiceDto?> GetByIdAsync(int id)
    {
        var invoice = await _context.Invoices
            .Include(i => i.Customer)
            .Include(i => i.Driver)
            .Include(i => i.InvoiceServices)
                .ThenInclude(isr => isr.Service)
            .Include(i => i.InvoiceExpenses)
                .ThenInclude(ie => ie.ExpenseType)
            .Include(i => i.InvoiceExpenses)
                .ThenInclude(ie => ie.Account)
            .Include(i => i.InvoiceExpenses)
                .ThenInclude(ie => ie.Vendor)
            .Include(i => i.Payments)
                .ThenInclude(p => p.Account)
            .FirstOrDefaultAsync(i => i.Id == id);

        return invoice == null ? null : _mapper.Map<InvoiceDto>(invoice);
    }

    public async Task<string> GetNextInvoiceNumberAsync()
    {
        var currentYear = DateTime.Now.Year;
        var prefix = $"INV-{currentYear}-";
        
        // Use SQL LIKE for better performance (PostgreSQL compatible)
        var lastInvoice = await _context.Invoices
            .Where(i => EF.Functions.Like(i.Number, $"{prefix}%"))
            .OrderByDescending(i => i.Number)
            .Select(i => i.Number)
            .FirstOrDefaultAsync();

        if (string.IsNullOrEmpty(lastInvoice))
            return $"{prefix}0001";

        var parts = lastInvoice.Split('-');
        if (parts.Length == 3 && int.TryParse(parts[2], out int lastNum))
        {
            return $"{prefix}{(lastNum + 1).ToString().PadLeft(4, '0')}";
        }

        return $"{prefix}0001";
    }

    public async Task<InvoiceDto> CreateAsync(CreateInvoiceDto dto)
    {
        var invoiceNumber = await GetNextInvoiceNumberAsync();
        var total = dto.Services.Sum(s => s.Rate);
        var paid = dto.Payments.Sum(p => p.Amount);
        var status = CalculateInvoiceStatus(paid, total);

        var invoice = new Invoice
        {
            Number = invoiceNumber,
            Date = dto.Date,
            CustomerId = dto.CustomerId,
            DriverId = dto.DriverId,
            DriverNotes = dto.DriverNotes,
            Persons = dto.Persons,
            Total = total,
            Paid = paid,
            Status = status
        };

        _context.Invoices.Add(invoice);
        await _context.SaveChangesAsync();

        // Add services
        foreach (var serviceDto in dto.Services)
        {
            var service = await _context.Services.FindAsync(serviceDto.ServiceId);
            if (service != null)
            {
                _context.InvoiceServices.Add(new InvoiceServiceItem
                {
                    InvoiceId = invoice.Id,
                    ServiceId = serviceDto.ServiceId,
                    ServiceName = service.Name,
                    Rate = serviceDto.Rate
                });
            }
        }

        // Add expenses
        foreach (var expenseDto in dto.Expenses)
        {
            var expenseType = await _context.ExpenseTypes.FindAsync(expenseDto.ExpenseTypeId);
            if (expenseType != null)
            {
                var invoiceExpense = new InvoiceExpense
                {
                    InvoiceId = invoice.Id,
                    ExpenseTypeId = expenseDto.ExpenseTypeId,
                    Type = expenseType.Name,
                    Amount = expenseDto.Amount,
                    Date = expenseDto.Date,
                    Pax = expenseDto.Pax
                };
                _context.InvoiceExpenses.Add(invoiceExpense);

                // Create transaction
                var account = await _context.Accounts.FirstOrDefaultAsync(a => a.AccountType == "cash");
                if (account != null)
                {
                    _context.Transactions.Add(new Transaction
                    {
                        Date = expenseDto.Date,
                        Description = $"{expenseType.Name} expense for {invoiceNumber}",
                        InvoiceId = invoice.Id,
                        InvoiceNumber = invoiceNumber,
                        AccountId = account.Id,
                        Debit = expenseDto.Amount,
                        Reference = $"EXP-{invoiceExpense.Id}",
                        ExpenseType = expenseType.Name
                    });
                }
            }
        }

        // Add payments
        foreach (var paymentDto in dto.Payments)
        {
            var account = await _context.Accounts.FindAsync(paymentDto.AccountId);
            if (account != null)
            {
                var vat = account.AccountType == "bank" ? paymentDto.Amount * 0.05m : 0;
                var payment = new Payment
                {
                    InvoiceId = invoice.Id,
                    AccountId = paymentDto.AccountId,
                    Amount = paymentDto.Amount,
                    Date = paymentDto.Date,
                    Reference = paymentDto.Reference,
                    Vat = vat,
                    Notes = paymentDto.Notes
                };
                _context.Payments.Add(payment);

                // Create transaction
                _context.Transactions.Add(new Transaction
                {
                    Date = paymentDto.Date,
                    Description = $"Payment for {invoiceNumber}",
                    InvoiceId = invoice.Id,
                    InvoiceNumber = invoiceNumber,
                    AccountId = paymentDto.AccountId,
                    Credit = paymentDto.Amount,
                    Reference = paymentDto.Reference,
                    Notes = paymentDto.Notes ?? "Invoice payment"
                });
            }
        }

        await _context.SaveChangesAsync();
        return await GetByIdAsync(invoice.Id) ?? throw new Exception("Failed to create invoice");
    }

    public async Task<InvoiceDto?> AddPaymentAsync(int invoiceId, AddPaymentDto dto)
    {
        var invoice = await _context.Invoices
            .Include(i => i.Payments)
            .Include(i => i.InvoiceExpenses)
            .FirstOrDefaultAsync(i => i.Id == invoiceId);

        if (invoice == null) return null;

        var account = await _context.Accounts.FindAsync(dto.AccountId);
        if (account == null) return null;

        var vat = account.AccountType == "bank" ? dto.Amount * 0.05m : 0;
        var payment = new Payment
        {
            InvoiceId = invoiceId,
            AccountId = dto.AccountId,
            Amount = dto.Amount,
            Date = dto.Date,
            Reference = dto.Reference,
            Vat = vat,
            Notes = dto.Notes
        };

        _context.Payments.Add(payment);
        invoice.Paid += dto.Amount;
        var previousStatus = invoice.Status;
        invoice.Status = CalculateInvoiceStatus(invoice.Paid, invoice.Total);
        invoice.UpdatedAt = DateTime.UtcNow;

        // Create transaction for payment (credit)
        _context.Transactions.Add(new Transaction
        {
            Date = dto.Date,
            Description = $"Payment for {invoice.Number}",
            InvoiceId = invoiceId,
            InvoiceNumber = invoice.Number,
            AccountId = dto.AccountId,
            Credit = dto.Amount,
            Reference = dto.Reference,
            Notes = dto.Notes ?? "Invoice payment"
        });

        // Note: Expenses are NOT automatically marked as paid when invoice is paid
        // Users must manually mark expenses as paid through the Outstanding Expenses page

        await _context.SaveChangesAsync();
        return await GetByIdAsync(invoiceId);
    }

    public async Task<InvoiceDto?> AddExpenseAsync(int invoiceId, AddExpenseDto dto)
    {
        var invoice = await _context.Invoices
            .Include(i => i.InvoiceExpenses)
            .FirstOrDefaultAsync(i => i.Id == invoiceId);

        if (invoice == null) return null;

        var expenseType = await _context.ExpenseTypes.FindAsync(dto.ExpenseTypeId);
        if (expenseType == null) return null;

        // Get the specified account or default to cash
        Account? account;
        if (dto.AccountId.HasValue)
        {
            account = await _context.Accounts.FindAsync(dto.AccountId.Value);
        }
        else
        {
            account = await _context.Accounts.FirstOrDefaultAsync(a => a.AccountType == "cash");
        }

        // Get vendor if specified
        Vendor? vendor = null;
        if (dto.VendorId.HasValue)
        {
            vendor = await _context.Vendors.FindAsync(dto.VendorId.Value);
        }

        var invoiceExpense = new InvoiceExpense
        {
            InvoiceId = invoiceId,
            ExpenseTypeId = dto.ExpenseTypeId,
            Type = expenseType.Name,
            Amount = dto.Amount,
            Date = dto.Date,
            AccountId = account?.Id,
            VendorId = dto.VendorId,
            VendorName = vendor?.Name,
            Pax = dto.Pax,
            PaymentStatus = ExpensePaymentStatus.Unpaid
        };

        _context.InvoiceExpenses.Add(invoiceExpense);
        invoice.UpdatedAt = DateTime.UtcNow;

        // Create transaction for expense (debit)
        if (account != null)
        {
            _context.Transactions.Add(new Transaction
            {
                Date = dto.Date,
                Description = $"{expenseType.Name} expense for {invoice.Number}" + (vendor != null ? $" - {vendor.Name}" : ""),
                InvoiceId = invoiceId,
                InvoiceNumber = invoice.Number,
                AccountId = account.Id,
                Debit = dto.Amount,
                Reference = $"EXP-{invoiceExpense.Id}",
                ExpenseType = expenseType.Name
            });
        }

        await _context.SaveChangesAsync();
        return await GetByIdAsync(invoiceId);
    }

    public async Task<InvoiceDto?> AddServiceAsync(int invoiceId, AddInvoiceServiceDto dto)
    {
        var invoice = await _context.Invoices
            .Include(i => i.InvoiceServices)
            .FirstOrDefaultAsync(i => i.Id == invoiceId);

        if (invoice == null) return null;

        var service = await _context.Services.FindAsync(dto.ServiceId);
        if (service == null) return null;

        var invoiceService = new InvoiceServiceItem
        {
            InvoiceId = invoiceId,
            ServiceId = dto.ServiceId,
            ServiceName = service.Name,
            Rate = dto.Rate
        };

        _context.InvoiceServices.Add(invoiceService);
        invoice.Total += dto.Rate;
        invoice.Status = CalculateInvoiceStatus(invoice.Paid, invoice.Total);
        invoice.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return await GetByIdAsync(invoiceId);
    }

    public async Task<InvoiceDto?> UpdateServiceAsync(int invoiceId, UpdateInvoiceServiceDto dto)
    {
        var invoice = await _context.Invoices
            .Include(i => i.InvoiceServices)
            .FirstOrDefaultAsync(i => i.Id == invoiceId);

        if (invoice == null) return null;

        var invoiceService = invoice.InvoiceServices.FirstOrDefault(isr => isr.Id == dto.Id);
        if (invoiceService == null) return null;

        var oldRate = invoiceService.Rate;
        invoiceService.Rate = dto.Rate;
        invoice.Total = invoice.Total - oldRate + dto.Rate;
        invoice.Status = CalculateInvoiceStatus(invoice.Paid, invoice.Total);
        invoice.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return await GetByIdAsync(invoiceId);
    }

    public async Task<InvoiceDto?> RemoveServiceAsync(int invoiceId, int serviceId)
    {
        var invoice = await _context.Invoices
            .Include(i => i.InvoiceServices)
            .FirstOrDefaultAsync(i => i.Id == invoiceId);

        if (invoice == null) return null;

        var invoiceService = invoice.InvoiceServices.FirstOrDefault(isr => isr.Id == serviceId);
        if (invoiceService == null) return null;

        invoice.Total -= invoiceService.Rate;
        invoice.Status = CalculateInvoiceStatus(invoice.Paid, invoice.Total);
        invoice.UpdatedAt = DateTime.UtcNow;

        _context.InvoiceServices.Remove(invoiceService);
        await _context.SaveChangesAsync();
        return await GetByIdAsync(invoiceId);
    }

    public async Task<InvoiceDto?> AssignDriverAsync(int invoiceId, AssignDriverDto dto)
    {
        var invoice = await _context.Invoices.FindAsync(invoiceId);
        if (invoice == null) return null;

        invoice.DriverId = dto.DriverId;
        invoice.DriverNotes = dto.DriverNotes;
        invoice.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return await GetByIdAsync(invoiceId);
    }

    public async Task<InvoiceDto?> UpdateExpenseAsync(int invoiceId, int expenseId, UpdateExpenseDto dto)
    {
        var invoice = await _context.Invoices
            .Include(i => i.InvoiceExpenses)
            .FirstOrDefaultAsync(i => i.Id == invoiceId);

        if (invoice == null) return null;

        var expense = invoice.InvoiceExpenses.FirstOrDefault(e => e.Id == expenseId);
        if (expense == null) return null;

        var expenseType = await _context.ExpenseTypes.FindAsync(dto.ExpenseTypeId);
        if (expenseType == null) return null;

        // Get the specified account or default to cash
        Account? account;
        if (dto.AccountId.HasValue)
        {
            account = await _context.Accounts.FindAsync(dto.AccountId.Value);
        }
        else
        {
            account = await _context.Accounts.FirstOrDefaultAsync(a => a.AccountType == "cash");
        }

        // Get vendor if specified
        Vendor? vendor = null;
        if (dto.VendorId.HasValue)
        {
            vendor = await _context.Vendors.FindAsync(dto.VendorId.Value);
        }

        expense.ExpenseTypeId = dto.ExpenseTypeId;
        expense.Type = expenseType.Name;
        expense.Amount = dto.Amount;
        expense.Date = dto.Date;
        expense.AccountId = account?.Id;
        expense.VendorId = dto.VendorId;
        expense.VendorName = vendor?.Name;
        expense.Pax = dto.Pax;
        expense.UpdatedAt = DateTime.UtcNow;

        // Update transaction
        var transaction = await _context.Transactions
            .FirstOrDefaultAsync(t => t.InvoiceId == invoiceId && t.Reference == $"EXP-{expenseId}");

        if (transaction != null)
        {
            transaction.Date = dto.Date;
            transaction.Description = $"{expenseType.Name} expense for {invoice.Number}" + (vendor != null ? $" - {vendor.Name}" : "");
            transaction.Debit = dto.Amount;
            transaction.ExpenseType = expenseType.Name;
            if (account != null)
            {
                transaction.AccountId = account.Id;
            }
        }

        invoice.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return await GetByIdAsync(invoiceId);
    }

    public async Task<InvoiceDto?> RemoveExpenseAsync(int invoiceId, int expenseId)
    {
        var invoice = await _context.Invoices
            .Include(i => i.InvoiceExpenses)
            .FirstOrDefaultAsync(i => i.Id == invoiceId);

        if (invoice == null) return null;

        var expense = invoice.InvoiceExpenses.FirstOrDefault(e => e.Id == expenseId);
        if (expense == null) return null;

        _context.InvoiceExpenses.Remove(expense);

        // Remove transaction
        var transaction = await _context.Transactions
            .FirstOrDefaultAsync(t => t.InvoiceId == invoiceId && t.Reference == $"EXP-{expenseId}");

        if (transaction != null)
        {
            _context.Transactions.Remove(transaction);
        }

        invoice.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return await GetByIdAsync(invoiceId);
    }

    public async Task<List<OutstandingExpenseDto>> GetOutstandingExpensesAsync()
    {
        var expenses = await _context.InvoiceExpenses
            .Where(e => e.PaymentStatus == ExpensePaymentStatus.Unpaid)
            .Include(e => e.Invoice)
                .ThenInclude(i => i.Customer)
            .Include(e => e.ExpenseType)
            .Include(e => e.Vendor)
            .OrderByDescending(e => e.Date)
            .AsNoTracking()
            .ToListAsync();

        return expenses.Select(e => new OutstandingExpenseDto
        {
            Id = e.Id,
            InvoiceId = e.InvoiceId,
            InvoiceNumber = e.Invoice.Number,
            Customer = e.Invoice.Customer?.Name ?? string.Empty,
            ExpenseTypeId = e.ExpenseTypeId,
            Type = e.Type,
            Amount = e.Amount,
            Date = e.Date,
            VendorId = e.VendorId,
            VendorName = e.VendorName ?? e.Vendor?.Name,
            Pax = e.Pax,
            PaymentStatus = e.PaymentStatus.ToString().ToLower()
        }).ToList();
    }

    public async Task<bool> MarkExpensePaidAsync(int expenseId, MarkExpensePaidDto dto)
    {
        var expense = await _context.InvoiceExpenses
            .Include(e => e.Invoice)
            .Include(e => e.ExpenseType)
            .FirstOrDefaultAsync(e => e.Id == expenseId);

        if (expense == null) return false;

        var account = await _context.Accounts.FindAsync(dto.AccountId);
        if (account == null) return false;

        // Mark expense as paid
        expense.PaymentStatus = ExpensePaymentStatus.Paid;
        expense.PaidDate = dto.Date;
        expense.AccountId = dto.AccountId;
        expense.UpdatedAt = DateTime.UtcNow;

        // Create transaction for expense payment (debit from account)
        _context.Transactions.Add(new Transaction
        {
            Date = dto.Date,
            Description = $"{expense.Type} expense payment for {expense.Invoice.Number}",
            InvoiceId = expense.InvoiceId,
            InvoiceNumber = expense.Invoice.Number,
            AccountId = dto.AccountId,
            Debit = expense.Amount,
            Reference = dto.Reference ?? $"EXP-PAY-{expense.Id}",
            ExpenseType = expense.Type
        });

        await _context.SaveChangesAsync();
        return true;
    }

    /// <summary>
    /// Calculates the invoice status based on paid and total amounts
    /// </summary>
    private static InvoiceStatus CalculateInvoiceStatus(decimal paid, decimal total)
    {
        if (paid >= total) return InvoiceStatus.Paid;
        if (paid > 0) return InvoiceStatus.Partial;
        return InvoiceStatus.Unpaid;
    }
}

