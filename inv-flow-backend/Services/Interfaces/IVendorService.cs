using inv_flow_backend.DTOs;

namespace inv_flow_backend.Services.Interfaces;

public interface IVendorService
{
    Task<List<VendorDto>> GetAllAsync();
    Task<VendorDto?> GetByIdAsync(int id);
    Task<VendorDto> CreateAsync(CreateVendorDto dto);
    Task<VendorDto?> UpdateAsync(int id, UpdateVendorDto dto);
    Task<bool> DeleteAsync(int id);
}

