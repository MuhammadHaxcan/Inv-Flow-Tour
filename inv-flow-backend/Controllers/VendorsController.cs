using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using inv_flow_backend.DTOs;
using inv_flow_backend.Services.Interfaces;
using FluentValidation;
using inv_flow_backend.Attributes;

namespace inv_flow_backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class VendorsController : ControllerBase
{
    private readonly IVendorService _vendorService;
    private readonly IValidator<CreateVendorDto> _createValidator;
    private readonly IValidator<UpdateVendorDto> _updateValidator;

    public VendorsController(
        IVendorService vendorService,
        IValidator<CreateVendorDto> createValidator,
        IValidator<UpdateVendorDto> updateValidator)
    {
        _vendorService = vendorService;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    [HttpGet]
    [RequirePermission("expenses.read")]
    public async Task<ActionResult<List<VendorDto>>> GetAll()
    {
        var vendors = await _vendorService.GetAllAsync();
        return Ok(vendors);
    }

    [HttpGet("{id}")]
    [RequirePermission("expenses.read")]
    public async Task<ActionResult<VendorDto>> GetById(int id)
    {
        var vendor = await _vendorService.GetByIdAsync(id);
        if (vendor == null)
        {
            return NotFound();
        }
        return Ok(vendor);
    }

    [HttpPost]
    [RequirePermission("expenses.write")]
    public async Task<ActionResult<VendorDto>> Create([FromBody] CreateVendorDto dto)
    {
        var validationResult = await _createValidator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.Errors);
        }

        var vendor = await _vendorService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = vendor.Id }, vendor);
    }

    [HttpPut("{id}")]
    [RequirePermission("expenses.write")]
    public async Task<ActionResult<VendorDto>> Update(int id, [FromBody] UpdateVendorDto dto)
    {
        var validationResult = await _updateValidator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.Errors);
        }

        var vendor = await _vendorService.UpdateAsync(id, dto);
        if (vendor == null)
        {
            return NotFound();
        }
        return Ok(vendor);
    }

    [HttpDelete("{id}")]
    [RequirePermission("expenses.delete")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _vendorService.DeleteAsync(id);
        if (!result)
        {
            return NotFound();
        }
        return NoContent();
    }
}

