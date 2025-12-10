using inv_flow_backend.DTOs;

namespace inv_flow_backend.Services.Interfaces;

public interface ICompanySettingsService
{
    Task<CompanySettingsDto> GetSettingsAsync();
    Task<CompanySettingsDto> UpdateSettingsAsync(UpdateCompanySettingsDto dto);
    Task<CompanySettingsDto> UpdateLogoAsync(UpdateLogoDto dto);
    Task<CompanySettingsDto> SetActiveSignatureAsync(int signatureId);
    Task<CompanySettingsDto> ClearLogoAsync();
    Task<CompanySettingsDto> GetEmailSettingsAsync();
    Task<CompanySettingsDto> UpdateEmailSettingsAsync(UpdateCompanySettingsDto dto);
}



