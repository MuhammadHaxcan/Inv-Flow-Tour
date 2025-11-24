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
public class ServicesController : ControllerBase
{
    private readonly IServiceService _serviceService;
    private readonly IValidator<CreateServiceDto> _createValidator;
    private readonly IValidator<UpdateServiceDto> _updateValidator;

    public ServicesController(
        IServiceService serviceService,
        IValidator<CreateServiceDto> createValidator,
        IValidator<UpdateServiceDto> updateValidator)
    {
        _serviceService = serviceService;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    [HttpGet]
    [RequirePermission("services.read")]
    public async Task<ActionResult<List<ServiceDto>>> GetAll()
    {
        var services = await _serviceService.GetAllAsync();
        return Ok(services);
    }

    [HttpGet("{id}")]
    [RequirePermission("services.read")]
    public async Task<ActionResult<ServiceDto>> GetById(int id)
    {
        var service = await _serviceService.GetByIdAsync(id);
        if (service == null)
        {
            return NotFound();
        }
        return Ok(service);
    }

    [HttpPost]
    [RequirePermission("services.write")]
    public async Task<ActionResult<ServiceDto>> Create([FromBody] CreateServiceDto dto)
    {
        var validationResult = await _createValidator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.Errors);
        }

        var service = await _serviceService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = service.Id }, service);
    }

    [HttpPut("{id}")]
    [RequirePermission("services.write")]
    public async Task<ActionResult<ServiceDto>> Update(int id, [FromBody] UpdateServiceDto dto)
    {
        var validationResult = await _updateValidator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.Errors);
        }

        var service = await _serviceService.UpdateAsync(id, dto);
        if (service == null)
        {
            return NotFound();
        }
        return Ok(service);
    }

    [HttpDelete("{id}")]
    [RequirePermission("services.delete")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _serviceService.DeleteAsync(id);
        if (!result)
        {
            return NotFound();
        }
        return NoContent();
    }
}

