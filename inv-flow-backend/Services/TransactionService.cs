using AutoMapper;
using inv_flow_backend.Data;
using inv_flow_backend.DTOs;
using inv_flow_backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace inv_flow_backend.Services;

public class TransactionService : ITransactionService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public TransactionService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<TransactionDto>> GetAllAsync()
    {
        var transactions = await _context.Transactions
            .Include(t => t.Account)
            .OrderByDescending(t => t.Date)
            .ToListAsync();

        return _mapper.Map<List<TransactionDto>>(transactions);
    }

    public async Task<List<TransactionDto>> GetByAccountIdAsync(int accountId)
    {
        var transactions = await _context.Transactions
            .Include(t => t.Account)
            .Where(t => t.AccountId == accountId)
            .OrderByDescending(t => t.Date)
            .ToListAsync();

        return _mapper.Map<List<TransactionDto>>(transactions);
    }

    public async Task<List<TransactionDto>> GetByInvoiceIdAsync(int invoiceId)
    {
        var transactions = await _context.Transactions
            .Include(t => t.Account)
            .Where(t => t.InvoiceId == invoiceId)
            .OrderByDescending(t => t.Date)
            .ToListAsync();

        return _mapper.Map<List<TransactionDto>>(transactions);
    }
}

