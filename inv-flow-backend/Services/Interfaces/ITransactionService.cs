using inv_flow_backend.DTOs;

namespace inv_flow_backend.Services.Interfaces;

public interface ITransactionService
{
    Task<List<TransactionDto>> GetAllAsync();
    Task<List<TransactionDto>> GetByAccountIdAsync(int accountId);
    Task<List<TransactionDto>> GetByInvoiceIdAsync(int invoiceId);
}

