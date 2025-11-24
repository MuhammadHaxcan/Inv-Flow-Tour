using inv_flow_backend.DTOs;

namespace inv_flow_backend.Services.Interfaces;

public interface IAccountService
{
    Task<List<AccountDto>> GetAllAsync();
    Task<AccountDto?> GetByIdAsync(int id);
    Task<AccountDto> CreateAsync(CreateAccountDto dto);
    Task<AccountDto?> UpdateAsync(int id, UpdateAccountDto dto);
    Task<bool> DeleteAsync(int id);
}

