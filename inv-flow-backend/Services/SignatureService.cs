using AutoMapper;
using Microsoft.EntityFrameworkCore;
using inv_flow_backend.Data;
using inv_flow_backend.DTOs;
using inv_flow_backend.Models;
using inv_flow_backend.Services.Interfaces;

namespace inv_flow_backend.Services;

public class SignatureService : ISignatureService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<SignatureService> _logger;

    public SignatureService(ApplicationDbContext context, IMapper mapper, ILogger<SignatureService> logger)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<IEnumerable<SignatureDto>> GetAllAsync()
    {
        var signatures = await _context.Signatures
            .OrderByDescending(s => s.IsActive)
            .ThenByDescending(s => s.CreatedAt)
            .ToListAsync();

        return _mapper.Map<IEnumerable<SignatureDto>>(signatures);
    }

    public async Task<SignatureDto?> GetByIdAsync(int id)
    {
        var signature = await _context.Signatures.FindAsync(id);
        return signature != null ? _mapper.Map<SignatureDto>(signature) : null;
    }

    public async Task<SignatureDto?> GetActiveSignatureAsync()
    {
        var signature = await _context.Signatures
            .FirstOrDefaultAsync(s => s.IsActive);
        
        return signature != null ? _mapper.Map<SignatureDto>(signature) : null;
    }

    public async Task<SignatureDto> CreateAsync(CreateSignatureDto dto)
    {
        var signature = _mapper.Map<Signature>(dto);
        
        // Check if there's no existing active signature, make this one active
        var hasActive = await _context.Signatures.AnyAsync(s => s.IsActive);
        if (!hasActive)
        {
            signature.IsActive = true;
        }

        _context.Signatures.Add(signature);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Created signature: {Name} (ID: {Id})", signature.Name, signature.Id);
        return _mapper.Map<SignatureDto>(signature);
    }

    public async Task<SignatureDto?> UpdateAsync(int id, UpdateSignatureDto dto)
    {
        var signature = await _context.Signatures.FindAsync(id);
        if (signature == null)
        {
            return null;
        }

        if (!string.IsNullOrEmpty(dto.Name))
        {
            signature.Name = dto.Name;
        }

        if (!string.IsNullOrEmpty(dto.ImageData))
        {
            signature.ImageData = dto.ImageData;
        }

        signature.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        _logger.LogInformation("Updated signature: {Name} (ID: {Id})", signature.Name, signature.Id);
        return _mapper.Map<SignatureDto>(signature);
    }

    public async Task<bool> SetActiveAsync(int id)
    {
        var signature = await _context.Signatures.FindAsync(id);
        if (signature == null)
        {
            return false;
        }

        // Deactivate all signatures
        await _context.Signatures
            .Where(s => s.IsActive)
            .ExecuteUpdateAsync(s => s.SetProperty(x => x.IsActive, false));

        // Activate the selected signature
        signature.IsActive = true;
        signature.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        // Also update CompanySettings
        var settings = await _context.CompanySettings.FirstOrDefaultAsync();
        if (settings != null)
        {
            settings.ActiveSignatureId = id;
            settings.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }

        _logger.LogInformation("Set signature as active: {Name} (ID: {Id})", signature.Name, signature.Id);
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var signature = await _context.Signatures.FindAsync(id);
        if (signature == null)
        {
            return false;
        }

        // If this signature is active, clear the active signature in CompanySettings
        if (signature.IsActive)
        {
            var settings = await _context.CompanySettings.FirstOrDefaultAsync();
            if (settings != null && settings.ActiveSignatureId == id)
            {
                settings.ActiveSignatureId = null;
                settings.UpdatedAt = DateTime.UtcNow;
            }
        }

        _context.Signatures.Remove(signature);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Deleted signature: {Name} (ID: {Id})", signature.Name, signature.Id);
        return true;
    }
}
