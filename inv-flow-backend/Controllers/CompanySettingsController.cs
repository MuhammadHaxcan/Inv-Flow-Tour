using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using inv_flow_backend.DTOs;
using inv_flow_backend.Services.Interfaces;
using inv_flow_backend.Attributes;

namespace inv_flow_backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CompanySettingsController : ControllerBase
{
    private readonly ICompanySettingsService _settingsService;
    private readonly ILogger<CompanySettingsController> _logger;

    public CompanySettingsController(ICompanySettingsService settingsService, ILogger<CompanySettingsController> logger)
    {
        _settingsService = settingsService;
        _logger = logger;
    }

    [HttpGet]
    // No specific permission required - company settings (logo, etc.) are needed for invoice printing
    // which is accessible to anyone who can read invoices
    public async Task<ActionResult<CompanySettingsDto>> GetSettings()
    {
        var settings = await _settingsService.GetSettingsAsync();
        return Ok(settings);
    }

    [HttpPut]
    [RequirePermission("companysettings.write")]
    public async Task<ActionResult<CompanySettingsDto>> UpdateSettings([FromBody] UpdateCompanySettingsDto dto)
    {
        var settings = await _settingsService.UpdateSettingsAsync(dto);
        return Ok(settings);
    }

    [HttpPost("logo")]
    [RequirePermission("companysettings.write")]
    public async Task<ActionResult<CompanySettingsDto>> UpdateLogo([FromBody] UpdateLogoDto dto)
    {
        if (string.IsNullOrEmpty(dto.LogoImageData))
        {
            return BadRequest(new { message = "Logo image data is required" });
        }

        var settings = await _settingsService.UpdateLogoAsync(dto);
        return Ok(settings);
    }

    [HttpDelete("logo")]
    [RequirePermission("companysettings.write")]
    public async Task<ActionResult<CompanySettingsDto>> ClearLogo()
    {
        var settings = await _settingsService.ClearLogoAsync();
        return Ok(settings);
    }

    [HttpPost("signature/{signatureId}")]
    [RequirePermission("companysettings.write")]
    public async Task<ActionResult<CompanySettingsDto>> SetActiveSignature(int signatureId)
    {
        try
        {
            var settings = await _settingsService.SetActiveSignatureAsync(signatureId);
            return Ok(settings);
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}
