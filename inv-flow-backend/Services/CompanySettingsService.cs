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
    private readonly IConfiguration _configuration;

    public CompanySettingsService(ApplicationDbContext context, IMapper mapper, ILogger<CompanySettingsService> logger, IConfiguration configuration)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
        _configuration = configuration;
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
                TRN = "104082040700003",
                SmtpHost = _configuration["Email:SmtpHost"],
                SmtpPort = int.TryParse(_configuration["Email:SmtpPort"], out var port) ? port : 587,
                SmtpUser = _configuration["Email:SmtpUser"],
                SmtpPassword = _configuration["Email:SmtpPassword"],
                FromEmail = _configuration["Email:FromEmail"] ?? _configuration["Email:SmtpUser"],
                FromName = _configuration["Email:FromName"] ?? "Invoice System",
                EnableSsl = bool.TryParse(_configuration["Email:EnableSsl"], out var ssl) ? ssl : true
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

        if (!string.IsNullOrEmpty(dto.SmtpHost))
            settings.SmtpHost = dto.SmtpHost;

        if (dto.SmtpPort.HasValue)
            settings.SmtpPort = dto.SmtpPort;

        if (!string.IsNullOrEmpty(dto.SmtpUser))
            settings.SmtpUser = dto.SmtpUser;

        if (!string.IsNullOrEmpty(dto.SmtpPassword))
            settings.SmtpPassword = dto.SmtpPassword;

        if (!string.IsNullOrEmpty(dto.FromEmail))
            settings.FromEmail = dto.FromEmail;

        if (!string.IsNullOrEmpty(dto.FromName))
            settings.FromName = dto.FromName;

        if (dto.EnableSsl.HasValue)
            settings.EnableSsl = dto.EnableSsl.Value;

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

    public async Task<CompanySettingsDto> GetEmailSettingsAsync()
    {
        var settings = await GetOrCreateSettingsAsync();
        return _mapper.Map<CompanySettingsDto>(settings);
    }

    public async Task<CompanySettingsDto> UpdateEmailSettingsAsync(UpdateCompanySettingsDto dto)
    {
        var settings = await GetOrCreateSettingsAsync();

        if (!string.IsNullOrEmpty(dto.SmtpHost))
            settings.SmtpHost = dto.SmtpHost;

        if (dto.SmtpPort.HasValue)
            settings.SmtpPort = dto.SmtpPort;

        if (!string.IsNullOrEmpty(dto.SmtpUser))
            settings.SmtpUser = dto.SmtpUser;

        if (!string.IsNullOrEmpty(dto.SmtpPassword))
            settings.SmtpPassword = dto.SmtpPassword;

        if (!string.IsNullOrEmpty(dto.FromEmail))
            settings.FromEmail = dto.FromEmail;

        if (!string.IsNullOrEmpty(dto.FromName))
            settings.FromName = dto.FromName;

        if (dto.EnableSsl.HasValue)
            settings.EnableSsl = dto.EnableSsl.Value;

        settings.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return _mapper.Map<CompanySettingsDto>(settings);
    }
}
