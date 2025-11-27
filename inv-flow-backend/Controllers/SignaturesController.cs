using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using inv_flow_backend.DTOs;
using inv_flow_backend.Services.Interfaces;

namespace inv_flow_backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SignaturesController : ControllerBase
{
    private readonly ISignatureService _signatureService;
    private readonly ILogger<SignaturesController> _logger;

    public SignaturesController(ISignatureService signatureService, ILogger<SignaturesController> logger)
    {
        _signatureService = signatureService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SignatureDto>>> GetAll()
    {
        var signatures = await _signatureService.GetAllAsync();
        return Ok(signatures);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<SignatureDto>> GetById(int id)
    {
        var signature = await _signatureService.GetByIdAsync(id);
        if (signature == null)
        {
            return NotFound(new { message = $"Signature with ID {id} not found" });
        }
        return Ok(signature);
    }

    [HttpGet("active")]
    public async Task<ActionResult<SignatureDto>> GetActive()
    {
        var signature = await _signatureService.GetActiveSignatureAsync();
        if (signature == null)
        {
            return NotFound(new { message = "No active signature found" });
        }
        return Ok(signature);
    }

    [HttpPost]
    public async Task<ActionResult<SignatureDto>> Create([FromBody] CreateSignatureDto dto)
    {
        if (string.IsNullOrEmpty(dto.Name))
        {
            return BadRequest(new { message = "Signature name is required" });
        }

        if (string.IsNullOrEmpty(dto.ImageData))
        {
            return BadRequest(new { message = "Signature image data is required" });
        }

        var signature = await _signatureService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = signature.Id }, signature);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<SignatureDto>> Update(int id, [FromBody] UpdateSignatureDto dto)
    {
        var signature = await _signatureService.UpdateAsync(id, dto);
        if (signature == null)
        {
            return NotFound(new { message = $"Signature with ID {id} not found" });
        }
        return Ok(signature);
    }

    [HttpPost("{id}/set-active")]
    public async Task<ActionResult> SetActive(int id)
    {
        var result = await _signatureService.SetActiveAsync(id);
        if (!result)
        {
            return NotFound(new { message = $"Signature with ID {id} not found" });
        }
        return Ok(new { message = "Signature set as active" });
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var result = await _signatureService.DeleteAsync(id);
        if (!result)
        {
            return NotFound(new { message = $"Signature with ID {id} not found" });
        }
        return Ok(new { message = "Signature deleted successfully" });
    }
}
