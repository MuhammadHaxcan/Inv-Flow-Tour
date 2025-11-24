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
public class DriversController : ControllerBase
{
    private readonly IDriverService _driverService;
    private readonly IValidator<CreateDriverDto> _createValidator;
    private readonly IValidator<UpdateDriverDto> _updateValidator;

    public DriversController(
        IDriverService driverService,
        IValidator<CreateDriverDto> createValidator,
        IValidator<UpdateDriverDto> updateValidator)
    {
        _driverService = driverService;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    [HttpGet]
    [RequirePermission("drivers.read")]
    public async Task<ActionResult<List<DriverDto>>> GetAll()
    {
        var drivers = await _driverService.GetAllAsync();
        return Ok(drivers);
    }

    [HttpGet("{id}")]
    [RequirePermission("drivers.read")]
    public async Task<ActionResult<DriverDto>> GetById(int id)
    {
        var driver = await _driverService.GetByIdAsync(id);
        if (driver == null)
        {
            return NotFound();
        }
        return Ok(driver);
    }

    [HttpPost]
    [RequirePermission("drivers.write")]
    public async Task<ActionResult<DriverDto>> Create([FromBody] CreateDriverDto dto)
    {
        var validationResult = await _createValidator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.Errors);
        }

        var driver = await _driverService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = driver.Id }, driver);
    }

    [HttpPut("{id}")]
    [RequirePermission("drivers.write")]
    public async Task<ActionResult<DriverDto>> Update(int id, [FromBody] UpdateDriverDto dto)
    {
        var validationResult = await _updateValidator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.Errors);
        }

        var driver = await _driverService.UpdateAsync(id, dto);
        if (driver == null)
        {
            return NotFound();
        }
        return Ok(driver);
    }

    [HttpDelete("{id}")]
    [RequirePermission("drivers.delete")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _driverService.DeleteAsync(id);
        if (!result)
        {
            return NotFound();
        }
        return NoContent();
    }
}

