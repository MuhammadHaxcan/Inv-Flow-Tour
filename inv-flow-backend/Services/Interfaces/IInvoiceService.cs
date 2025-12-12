using inv_flow_backend.DTOs;

namespace inv_flow_backend.Services.Interfaces;

public interface IInvoiceService
{
    Task<List<InvoiceDto>> GetOpenInvoicesAsync();
    Task<List<InvoiceDto>> GetClosedInvoicesAsync();
    Task<InvoiceDto?> GetByIdAsync(int id);
    Task<string> GetNextInvoiceNumberAsync();
    Task<InvoiceDto> CreateAsync(CreateInvoiceDto dto, int? userId = null);
    Task<InvoiceDto?> AddPaymentAsync(int invoiceId, AddPaymentDto dto);
    Task<InvoiceDto?> AddExpenseAsync(int invoiceId, AddExpenseDto dto);
    Task<InvoiceDto?> AddServiceAsync(int invoiceId, AddInvoiceServiceDto dto);
    Task<InvoiceDto?> UpdateServiceAsync(int invoiceId, UpdateInvoiceServiceDto dto);
    Task<InvoiceDto?> RemoveServiceAsync(int invoiceId, int serviceId);
    Task<InvoiceDto?> AssignDriverAsync(int invoiceId, AssignDriverDto dto);
    Task<InvoiceDto?> UpdateExpenseAsync(int invoiceId, int expenseId, UpdateExpenseDto dto);
    Task<InvoiceDto?> RemoveExpenseAsync(int invoiceId, int expenseId);
    Task<List<OutstandingExpenseDto>> GetOutstandingExpensesAsync();
    Task<bool> MarkExpensePaidAsync(int expenseId, MarkExpensePaidDto dto);
    Task<List<DriverScheduleDto>> GetDriverScheduleAsync();
    Task<bool> DeleteAsync(int id);
}

