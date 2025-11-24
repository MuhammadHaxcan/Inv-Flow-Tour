using inv_flow_backend.DTOs;

namespace inv_flow_backend.Services.Interfaces;

public interface IRoleService
{
    Task<List<RoleDto>> GetAllAsync();
    Task<RoleDto?> GetByIdAsync(int id);
    Task<RoleDto> CreateAsync(CreateRoleDto dto);
    Task<RoleDto?> UpdateAsync(int id, UpdateRoleDto dto);
    Task<bool> DeleteAsync(int id);
}

