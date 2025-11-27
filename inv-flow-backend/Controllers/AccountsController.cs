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
public class AccountsController : ControllerBase
{
    private readonly IAccountService _accountService;
    private readonly IValidator<CreateAccountDto> _createValidator;
    private readonly IValidator<UpdateAccountDto> _updateValidator;

    public AccountsController(
        IAccountService accountService,
        IValidator<CreateAccountDto> createValidator,
        IValidator<UpdateAccountDto> updateValidator)
    {
        _accountService = accountService;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    [HttpGet]
    [RequirePermission("accounts.read")]
    public async Task<ActionResult<List<AccountDto>>> GetAll()
    {
        var accounts = await _accountService.GetAllAsync();
        return Ok(accounts);
    }

    [HttpGet("{id}")]
    [RequirePermission("accounts.read")]
    public async Task<ActionResult<AccountDto>> GetById(int id)
    {
        var account = await _accountService.GetByIdAsync(id);
        if (account == null)
        {
            return NotFound();
        }
        return Ok(account);
    }

    [HttpPost]
    [RequirePermission("accounts.write")]
    public async Task<ActionResult<AccountDto>> Create([FromBody] CreateAccountDto dto)
    {
        var validationResult = await _createValidator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.Errors);
        }

        var account = await _accountService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = account.Id }, account);
    }

    [HttpPut("{id}")]
    [RequirePermission("accounts.write")]
    public async Task<ActionResult<AccountDto>> Update(int id, [FromBody] UpdateAccountDto dto)
    {
        var validationResult = await _updateValidator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.Errors);
        }

        var account = await _accountService.UpdateAsync(id, dto);
        if (account == null)
        {
            return NotFound();
        }
        return Ok(account);
    }

    [HttpDelete("{id}")]
    [RequirePermission("accounts.delete")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var result = await _accountService.DeleteAsync(id);
            if (!result)
            {
                return NotFound(new { message = "Account not found" });
            }
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

