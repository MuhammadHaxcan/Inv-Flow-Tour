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
public class ExpenseTypesController : ControllerBase
{
    private readonly IExpenseTypeService _expenseTypeService;
    private readonly IValidator<CreateExpenseTypeDto> _createValidator;
    private readonly IValidator<UpdateExpenseTypeDto> _updateValidator;

    public ExpenseTypesController(
        IExpenseTypeService expenseTypeService,
        IValidator<CreateExpenseTypeDto> createValidator,
        IValidator<UpdateExpenseTypeDto> updateValidator)
    {
        _expenseTypeService = expenseTypeService;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    [HttpGet]
    [RequirePermission("expenses.read")]
    public async Task<ActionResult<List<ExpenseTypeDto>>> GetAll()
    {
        var expenseTypes = await _expenseTypeService.GetAllAsync();
        return Ok(expenseTypes);
    }

    [HttpGet("{id}")]
    [RequirePermission("expenses.read")]
    public async Task<ActionResult<ExpenseTypeDto>> GetById(int id)
    {
        var expenseType = await _expenseTypeService.GetByIdAsync(id);
        if (expenseType == null)
        {
            return NotFound();
        }
        return Ok(expenseType);
    }

    [HttpPost]
    [RequirePermission("expenses.write")]
    public async Task<ActionResult<ExpenseTypeDto>> Create([FromBody] CreateExpenseTypeDto dto)
    {
        var validationResult = await _createValidator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.Errors);
        }

        var expenseType = await _expenseTypeService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = expenseType.Id }, expenseType);
    }

    [HttpPut("{id}")]
    [RequirePermission("expenses.write")]
    public async Task<ActionResult<ExpenseTypeDto>> Update(int id, [FromBody] UpdateExpenseTypeDto dto)
    {
        var validationResult = await _updateValidator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.Errors);
        }

        var expenseType = await _expenseTypeService.UpdateAsync(id, dto);
        if (expenseType == null)
        {
            return NotFound();
        }
        return Ok(expenseType);
    }

    [HttpDelete("{id}")]
    [RequirePermission("expenses.delete")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _expenseTypeService.DeleteAsync(id);
        if (!result)
        {
            return NotFound();
        }
        return NoContent();
    }
}

