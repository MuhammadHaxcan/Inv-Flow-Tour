using AutoMapper;
using inv_flow_backend.Data;
using inv_flow_backend.DTOs;
using inv_flow_backend.Models;
using inv_flow_backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace inv_flow_backend.Services;

public class ExpenseTypeService : IExpenseTypeService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public ExpenseTypeService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<ExpenseTypeDto>> GetAllAsync()
    {
        var expenseTypes = await _context.ExpenseTypes.ToListAsync();
        return _mapper.Map<List<ExpenseTypeDto>>(expenseTypes);
    }

    public async Task<ExpenseTypeDto?> GetByIdAsync(int id)
    {
        var expenseType = await _context.ExpenseTypes.FindAsync(id);
        return expenseType == null ? null : _mapper.Map<ExpenseTypeDto>(expenseType);
    }

    public async Task<ExpenseTypeDto> CreateAsync(CreateExpenseTypeDto dto)
    {
        var expenseType = _mapper.Map<ExpenseType>(dto);
        _context.ExpenseTypes.Add(expenseType);
        await _context.SaveChangesAsync();
        return _mapper.Map<ExpenseTypeDto>(expenseType);
    }

    public async Task<ExpenseTypeDto?> UpdateAsync(int id, UpdateExpenseTypeDto dto)
    {
        var expenseType = await _context.ExpenseTypes.FindAsync(id);
        if (expenseType == null) return null;

        _mapper.Map(dto, expenseType);
        expenseType.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return _mapper.Map<ExpenseTypeDto>(expenseType);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var expenseType = await _context.ExpenseTypes.FindAsync(id);
        if (expenseType == null) return false;

        _context.ExpenseTypes.Remove(expenseType);
        await _context.SaveChangesAsync();
        return true;
    }
}

