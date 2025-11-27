using inv_flow_backend.DTOs;

namespace inv_flow_backend.Services.Interfaces;

public interface ISignatureService
{
    Task<IEnumerable<SignatureDto>> GetAllAsync();
    Task<SignatureDto?> GetByIdAsync(int id);
    Task<SignatureDto?> GetActiveSignatureAsync();
    Task<SignatureDto> CreateAsync(CreateSignatureDto dto);
    Task<SignatureDto?> UpdateAsync(int id, UpdateSignatureDto dto);
    Task<bool> SetActiveAsync(int id);
    Task<bool> DeleteAsync(int id);
}

