using inv_flow_backend.DTOs;

namespace inv_flow_backend.Services.Interfaces;

public interface IExpenseTypeService
{
    Task<List<ExpenseTypeDto>> GetAllAsync();
    Task<ExpenseTypeDto?> GetByIdAsync(int id);
    Task<ExpenseTypeDto> CreateAsync(CreateExpenseTypeDto dto);
    Task<ExpenseTypeDto?> UpdateAsync(int id, UpdateExpenseTypeDto dto);
    Task<bool> DeleteAsync(int id);
}

