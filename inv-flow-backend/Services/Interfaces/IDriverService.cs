using inv_flow_backend.DTOs;

namespace inv_flow_backend.Services.Interfaces;

public interface IDriverService
{
    Task<List<DriverDto>> GetAllAsync();
    Task<DriverDto?> GetByIdAsync(int id);
    Task<DriverDto> CreateAsync(CreateDriverDto dto);
    Task<DriverDto?> UpdateAsync(int id, UpdateDriverDto dto);
    Task<bool> DeleteAsync(int id);
}

