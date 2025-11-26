using AutoMapper;
using inv_flow_backend.Data;
using inv_flow_backend.DTOs;
using inv_flow_backend.Models;
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
        // Get invoices that are in progress - unpaid or partially paid (not fully paid yet)
        // Load all invoices with includes first, then filter in memory to avoid DateOnly query issues
        var allInvoices = await _context.Invoices
            .Include(i => i.Customer)
            .Include(i => i.Driver)
            .Include(i => i.InvoiceServices)
            .Include(i => i.InvoiceExpenses)
            .Include(i => i.Payments)
                .ThenInclude(p => p.Account)
            .ToListAsync();

        // Filter in memory - only invoices that are not fully paid
        var invoices = allInvoices
            .Where(i => i.Status != "paid")
            .OrderByDescending(i => i.Date)
            .ToList();

        if (!invoices.Any())
            return new List<InvoiceDto>();

        return _mapper.Map<List<InvoiceDto>>(invoices);
    }

    public async Task<List<InvoiceDto>> GetClosedInvoicesAsync()
    {
        // Get all fully paid and completed invoices
        // Load all invoices with includes first, then filter in memory to avoid DateOnly query issues
        var allInvoices = await _context.Invoices
            .Include(i => i.Customer)
            .Include(i => i.Driver)
            .Include(i => i.InvoiceServices)
            .Include(i => i.InvoiceExpenses)
            .Include(i => i.Payments)
                .ThenInclude(p => p.Account)
            .ToListAsync();

        // Filter in memory - only fully paid invoices
        var invoices = allInvoices
            .Where(i => i.Status == "paid")
            .OrderByDescending(i => i.Date)
            .ToList();

        if (!invoices.Any())
            return new List<InvoiceDto>();

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
            .Include(i => i.Payments)
                .ThenInclude(p => p.Account)
            .FirstOrDefaultAsync(i => i.Id == id);

        return invoice == null ? null : _mapper.Map<InvoiceDto>(invoice);
    }

    public async Task<string> GetNextInvoiceNumberAsync()
    {
        var currentYear = DateTime.Now.Year;
        var invoices = await _context.Invoices
            .Where(i => !string.IsNullOrEmpty(i.Number) && i.Number.StartsWith($"INV-{currentYear}-"))
            .ToListAsync();

        if (!invoices.Any())
            return $"INV-{currentYear}-0001";

        int maxNum = 0;
        foreach (var invoice in invoices)
        {
            var parts = invoice.Number.Split('-');
            if (parts.Length == 3 && int.TryParse(parts[2], out int num) && num > maxNum)
                maxNum = num;
        }

        return $"INV-{currentYear}-{(maxNum + 1).ToString().PadLeft(4, '0')}";
    }

    public async Task<InvoiceDto> CreateAsync(CreateInvoiceDto dto)
    {
        var invoiceNumber = await GetNextInvoiceNumberAsync();
        var total = dto.Services.Sum(s => s.Rate);
        var paid = dto.Payments.Sum(p => p.Amount);
        var status = paid >= total ? "paid" : paid > 0 ? "partial" : "unpaid";

        var invoice = new Invoice
        {
            Number = invoiceNumber,
            Date = dto.Date,
            CustomerId = dto.CustomerId,
            DriverId = dto.DriverId,
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
                    Date = expenseDto.Date
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
        invoice.Status = invoice.Paid >= invoice.Total ? "paid" : invoice.Paid > 0 ? "partial" : "unpaid";
        invoice.UpdatedAt = DateTime.UtcNow;

        // Create transaction
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

        var invoiceExpense = new InvoiceExpense
        {
            InvoiceId = invoiceId,
            ExpenseTypeId = dto.ExpenseTypeId,
            Type = expenseType.Name,
            Amount = dto.Amount,
            Date = dto.Date
        };

        _context.InvoiceExpenses.Add(invoiceExpense);
        invoice.UpdatedAt = DateTime.UtcNow;

        // Create transaction
        var account = await _context.Accounts.FirstOrDefaultAsync(a => a.AccountType == "cash");
        if (account != null)
        {
            _context.Transactions.Add(new Transaction
            {
                Date = dto.Date,
                Description = $"{expenseType.Name} expense for {invoice.Number}",
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
        invoice.Status = invoice.Paid >= invoice.Total ? "paid" : invoice.Paid > 0 ? "partial" : "unpaid";
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
        invoice.Status = invoice.Paid >= invoice.Total ? "paid" : invoice.Paid > 0 ? "partial" : "unpaid";
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
        invoice.Status = invoice.Paid >= invoice.Total ? "paid" : invoice.Paid > 0 ? "partial" : "unpaid";
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

        expense.ExpenseTypeId = dto.ExpenseTypeId;
        expense.Type = expenseType.Name;
        expense.Amount = dto.Amount;
        expense.Date = dto.Date;
        expense.UpdatedAt = DateTime.UtcNow;

        // Update transaction
        var transaction = await _context.Transactions
            .FirstOrDefaultAsync(t => t.InvoiceId == invoiceId && t.Reference == $"EXP-{expenseId}");

        if (transaction != null)
        {
            transaction.Date = dto.Date;
            transaction.Description = $"{expenseType.Name} expense for {invoice.Number}";
            transaction.Debit = dto.Amount;
            transaction.ExpenseType = expenseType.Name;
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
}

