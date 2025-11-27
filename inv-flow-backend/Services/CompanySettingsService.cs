using AutoMapper;
using Microsoft.EntityFrameworkCore;
using inv_flow_backend.Data;
using inv_flow_backend.DTOs;
using inv_flow_backend.Models;
using inv_flow_backend.Services.Interfaces;

namespace inv_flow_backend.Services;

public class CompanySettingsService : ICompanySettingsService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<CompanySettingsService> _logger;

    public CompanySettingsService(ApplicationDbContext context, IMapper mapper, ILogger<CompanySettingsService> logger)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    private async Task<CompanySettings> GetOrCreateSettingsAsync()
    {
        var settings = await _context.CompanySettings
            .Include(cs => cs.ActiveSignature)
            .FirstOrDefaultAsync();

        if (settings == null)
        {
            // Create default settings
            settings = new CompanySettings
            {
                CompanyName = "SIYYAD KHAN TOURISM LLC",
                Address = "1513, 15th floor, Tamani Art Building, Dubai, UAE",
                Phone = "+971 55 752 3374",
                Email = "info@skt.ae",
                Website = "www.skt.ae",
                TRN = "104082040700003"
            };
            _context.CompanySettings.Add(settings);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Created default company settings");
        }

        return settings;
    }

    public async Task<CompanySettingsDto> GetSettingsAsync()
    {
        var settings = await GetOrCreateSettingsAsync();
        return _mapper.Map<CompanySettingsDto>(settings);
    }

    public async Task<CompanySettingsDto> UpdateSettingsAsync(UpdateCompanySettingsDto dto)
    {
        var settings = await GetOrCreateSettingsAsync();

        if (!string.IsNullOrEmpty(dto.CompanyName))
            settings.CompanyName = dto.CompanyName;

        if (dto.LogoImageData != null)
            settings.LogoImageData = dto.LogoImageData;

        if (dto.LogoFileName != null)
            settings.LogoFileName = dto.LogoFileName;

        if (dto.ActiveSignatureId.HasValue)
            settings.ActiveSignatureId = dto.ActiveSignatureId;

        if (!string.IsNullOrEmpty(dto.Address))
            settings.Address = dto.Address;

        if (!string.IsNullOrEmpty(dto.Phone))
            settings.Phone = dto.Phone;

        if (!string.IsNullOrEmpty(dto.Email))
            settings.Email = dto.Email;

        if (!string.IsNullOrEmpty(dto.Website))
            settings.Website = dto.Website;

        if (!string.IsNullOrEmpty(dto.TRN))
            settings.TRN = dto.TRN;

        settings.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        // Reload with include
        settings = await _context.CompanySettings
            .Include(cs => cs.ActiveSignature)
            .FirstOrDefaultAsync(cs => cs.Id == settings.Id);

        _logger.LogInformation("Updated company settings");
        return _mapper.Map<CompanySettingsDto>(settings!);
    }

    public async Task<CompanySettingsDto> UpdateLogoAsync(UpdateLogoDto dto)
    {
        var settings = await GetOrCreateSettingsAsync();

        settings.LogoImageData = dto.LogoImageData;
        settings.LogoFileName = dto.FileName;
        settings.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        // Reload with include
        settings = await _context.CompanySettings
            .Include(cs => cs.ActiveSignature)
            .FirstOrDefaultAsync(cs => cs.Id == settings.Id);

        _logger.LogInformation("Updated company logo: {FileName}", dto.FileName);
        return _mapper.Map<CompanySettingsDto>(settings!);
    }

    public async Task<CompanySettingsDto> SetActiveSignatureAsync(int signatureId)
    {
        var settings = await GetOrCreateSettingsAsync();

        // Verify signature exists
        var signatureExists = await _context.Signatures.AnyAsync(s => s.Id == signatureId);
        if (!signatureExists)
        {
            throw new ArgumentException($"Signature with ID {signatureId} not found");
        }

        // Deactivate all signatures
        await _context.Signatures
            .Where(s => s.IsActive)
            .ExecuteUpdateAsync(s => s.SetProperty(x => x.IsActive, false));

        // Activate the selected signature
        await _context.Signatures
            .Where(s => s.Id == signatureId)
            .ExecuteUpdateAsync(s => s.SetProperty(x => x.IsActive, true));

        settings.ActiveSignatureId = signatureId;
        settings.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        // Reload with include
        settings = await _context.CompanySettings
            .Include(cs => cs.ActiveSignature)
            .FirstOrDefaultAsync(cs => cs.Id == settings.Id);

        _logger.LogInformation("Set active signature to ID: {SignatureId}", signatureId);
        return _mapper.Map<CompanySettingsDto>(settings!);
    }

    public async Task<CompanySettingsDto> ClearLogoAsync()
    {
        var settings = await GetOrCreateSettingsAsync();

        settings.LogoImageData = null;
        settings.LogoFileName = null;
        settings.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        // Reload with include
        settings = await _context.CompanySettings
            .Include(cs => cs.ActiveSignature)
            .FirstOrDefaultAsync(cs => cs.Id == settings.Id);

        _logger.LogInformation("Cleared company logo");
        return _mapper.Map<CompanySettingsDto>(settings!);
    }
}
