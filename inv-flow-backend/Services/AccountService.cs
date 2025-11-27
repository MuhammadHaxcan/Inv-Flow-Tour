using AutoMapper;
using inv_flow_backend.Data;
using inv_flow_backend.DTOs;
using inv_flow_backend.Models;
using inv_flow_backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace inv_flow_backend.Services;

public class AccountService : IAccountService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public AccountService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<AccountDto>> GetAllAsync()
    {
        var accounts = await _context.Accounts.ToListAsync();
        return _mapper.Map<List<AccountDto>>(accounts);
    }

    public async Task<AccountDto?> GetByIdAsync(int id)
    {
        var account = await _context.Accounts.FindAsync(id);
        return account == null ? null : _mapper.Map<AccountDto>(account);
    }

    public async Task<AccountDto> CreateAsync(CreateAccountDto dto)
    {
        var account = _mapper.Map<Account>(dto);
        _context.Accounts.Add(account);
        await _context.SaveChangesAsync();
        return _mapper.Map<AccountDto>(account);
    }

    public async Task<AccountDto?> UpdateAsync(int id, UpdateAccountDto dto)
    {
        var account = await _context.Accounts.FindAsync(id);
        if (account == null) return null;

        _mapper.Map(dto, account);
        account.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return _mapper.Map<AccountDto>(account);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var account = await _context.Accounts
            .Include(a => a.Transactions)
            .Include(a => a.Payments)
            .FirstOrDefaultAsync(a => a.Id == id);
            
        if (account == null) return false;

        // Check if account has related transactions or payments
        if (account.Transactions.Any() || account.Payments.Any())
        {
            throw new InvalidOperationException(
                $"Cannot delete account '{account.Name}' because it has {account.Transactions.Count} transaction(s) and {account.Payments.Count} payment(s) associated with it. " +
                "Please remove or reassign these records first.");
        }

        _context.Accounts.Remove(account);
        await _context.SaveChangesAsync();
        return true;
    }
}

