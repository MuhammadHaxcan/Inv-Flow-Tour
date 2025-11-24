using inv_flow_backend.DTOs;

namespace inv_flow_backend.Services.Interfaces;

public interface IPermissionService
{
    Task<List<PermissionDto>> GetAllAsync();
    Task<PermissionDto?> GetByIdAsync(int id);
}

