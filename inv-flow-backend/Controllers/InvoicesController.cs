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
public class InvoicesController : ControllerBase
{
    private readonly IInvoiceService _invoiceService;
    private readonly IEmailService _emailService;
    private readonly IValidator<CreateInvoiceDto> _createValidator;
    private readonly IValidator<AddPaymentDto> _addPaymentValidator;
    private readonly IValidator<AddExpenseDto> _addExpenseValidator;
    private readonly IValidator<AddInvoiceServiceDto> _addServiceValidator;
    private readonly IValidator<UpdateInvoiceServiceDto> _updateServiceValidator;
    private readonly IValidator<UpdateExpenseDto> _updateExpenseValidator;

    public InvoicesController(
        IInvoiceService invoiceService,
        IEmailService emailService,
        IValidator<CreateInvoiceDto> createValidator,
        IValidator<AddPaymentDto> addPaymentValidator,
        IValidator<AddExpenseDto> addExpenseValidator,
        IValidator<AddInvoiceServiceDto> addServiceValidator,
        IValidator<UpdateInvoiceServiceDto> updateServiceValidator,
        IValidator<UpdateExpenseDto> updateExpenseValidator)
    {
        _invoiceService = invoiceService;
        _emailService = emailService;
        _createValidator = createValidator;
        _addPaymentValidator = addPaymentValidator;
        _addExpenseValidator = addExpenseValidator;
        _addServiceValidator = addServiceValidator;
        _updateServiceValidator = updateServiceValidator;
        _updateExpenseValidator = updateExpenseValidator;
    }

    [HttpGet("open")]
    [RequirePermission("invoices.read")]
    public async Task<ActionResult<List<InvoiceDto>>> GetOpenInvoices()
    {
        var invoices = await _invoiceService.GetOpenInvoicesAsync();
        return Ok(invoices);
    }

    [HttpGet("closed")]
    [RequirePermission("closedinvoices.read")]
    public async Task<ActionResult<List<InvoiceDto>>> GetClosedInvoices()
    {
        var invoices = await _invoiceService.GetClosedInvoicesAsync();
        return Ok(invoices);
    }

    [HttpGet("next-number")]
    [RequirePermission("invoices.read")]
    public async Task<ActionResult<object>> GetNextInvoiceNumber()
    {
        var number = await _invoiceService.GetNextInvoiceNumberAsync();
        return Ok(new { number });
    }

    [HttpGet("{id}")]
    [RequirePermission("invoices.read")]
    public async Task<ActionResult<InvoiceDto>> GetById(int id)
    {
        var invoice = await _invoiceService.GetByIdAsync(id);
        if (invoice == null)
        {
            return NotFound();
        }
        return Ok(invoice);
    }

    [HttpPost]
    [RequirePermission("invoices.write")]
    public async Task<ActionResult<InvoiceDto>> Create([FromBody] CreateInvoiceDto dto)
    {
        var validationResult = await _createValidator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.Errors);
        }

        // Get current user ID from claims
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        int? userId = null;
        if (int.TryParse(userIdClaim, out var parsedUserId))
        {
            userId = parsedUserId;
        }

        var invoice = await _invoiceService.CreateAsync(dto, userId);
        return CreatedAtAction(nameof(GetById), new { id = invoice.Id }, invoice);
    }

    [HttpPost("{id}/payments")]
    [RequirePermission("invoices.write")]
    public async Task<ActionResult<InvoiceDto>> AddPayment(int id, [FromBody] AddPaymentDto dto)
    {
        var validationResult = await _addPaymentValidator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.Errors);
        }

        var invoice = await _invoiceService.AddPaymentAsync(id, dto);
        if (invoice == null)
        {
            return NotFound();
        }
        return Ok(invoice);
    }

    [HttpPost("{id}/expenses")]
    [RequirePermission("invoices.write")]
    public async Task<ActionResult<InvoiceDto>> AddExpense(int id, [FromBody] AddExpenseDto dto)
    {
        var validationResult = await _addExpenseValidator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.Errors);
        }

        var invoice = await _invoiceService.AddExpenseAsync(id, dto);
        if (invoice == null)
        {
            return NotFound();
        }
        return Ok(invoice);
    }

    [HttpPost("{id}/services")]
    [RequirePermission("invoices.write")]
    public async Task<ActionResult<InvoiceDto>> AddService(int id, [FromBody] AddInvoiceServiceDto dto)
    {
        var validationResult = await _addServiceValidator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.Errors);
        }

        var invoice = await _invoiceService.AddServiceAsync(id, dto);
        if (invoice == null)
        {
            return NotFound();
        }
        return Ok(invoice);
    }

    [HttpPut("{id}/services")]
    [RequirePermission("invoices.write")]
    public async Task<ActionResult<InvoiceDto>> UpdateService(int id, [FromBody] UpdateInvoiceServiceDto dto)
    {
        var validationResult = await _updateServiceValidator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.Errors);
        }

        var invoice = await _invoiceService.UpdateServiceAsync(id, dto);
        if (invoice == null)
        {
            return NotFound();
        }
        return Ok(invoice);
    }

    [HttpDelete("{id}/services/{serviceId}")]
    [RequirePermission("invoices.write")]
    public async Task<ActionResult<InvoiceDto>> RemoveService(int id, int serviceId)
    {
        var invoice = await _invoiceService.RemoveServiceAsync(id, serviceId);
        if (invoice == null)
        {
            return NotFound();
        }
        return Ok(invoice);
    }

    [HttpPut("{id}/driver")]
    [RequirePermission("invoices.write")]
    public async Task<ActionResult<InvoiceDto>> AssignDriver(int id, [FromBody] AssignDriverDto dto)
    {
        var invoice = await _invoiceService.AssignDriverAsync(id, dto);
        if (invoice == null)
        {
            return NotFound();
        }
        return Ok(invoice);
    }

    [HttpPut("{id}/expenses/{expenseId}")]
    [RequirePermission("invoices.write")]
    public async Task<ActionResult<InvoiceDto>> UpdateExpense(int id, int expenseId, [FromBody] UpdateExpenseDto dto)
    {
        var validationResult = await _updateExpenseValidator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.Errors);
        }

        var invoice = await _invoiceService.UpdateExpenseAsync(id, expenseId, dto);
        if (invoice == null)
        {
            return NotFound();
        }
        return Ok(invoice);
    }

    [HttpDelete("{id}/expenses/{expenseId}")]
    [RequirePermission("invoices.write")]
    public async Task<ActionResult<InvoiceDto>> RemoveExpense(int id, int expenseId)
    {
        var invoice = await _invoiceService.RemoveExpenseAsync(id, expenseId);
        if (invoice == null)
        {
            return NotFound();
        }
        return Ok(invoice);
    }

    [HttpGet("expenses/outstanding")]
    [RequirePermission("invoices.read")]
    public async Task<ActionResult<List<OutstandingExpenseDto>>> GetOutstandingExpenses()
    {
        var expenses = await _invoiceService.GetOutstandingExpensesAsync();
        return Ok(expenses);
    }

    [HttpPost("expenses/{expenseId}/mark-paid")]
    [RequirePermission("invoices.write")]
    public async Task<ActionResult> MarkExpensePaid(int expenseId, [FromBody] MarkExpensePaidDto dto)
    {
        var result = await _invoiceService.MarkExpensePaidAsync(expenseId, dto);
        if (!result)
        {
            return NotFound();
        }
        return Ok(new { success = true, message = "Expense marked as paid" });
    }

    [HttpPost("{id}/send-email")]
    [RequirePermission("invoices.write")]
    public async Task<ActionResult> SendInvoiceEmail(int id)
    {
        try
        {
            var result = await _emailService.SendInvoiceEmailAsync(id);
            if (result)
            {
                return Ok(new { success = true, message = "Invoice email sent successfully" });
            }
            return BadRequest(new { success = false, message = "Failed to send email" });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { success = false, message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    [HttpGet("driver-schedule")]
    [RequirePermission("invoices.read")]
    public async Task<ActionResult<List<DriverScheduleDto>>> GetDriverSchedule()
    {
        var schedule = await _invoiceService.GetDriverScheduleAsync();
        return Ok(schedule);
    }

    [HttpDelete("{id}")]
    [RequirePermission("invoices.delete")]
    public async Task<ActionResult> Delete(int id)
    {
        var result = await _invoiceService.DeleteAsync(id);
        if (!result)
        {
            return NotFound(new { success = false, message = "Invoice not found" });
        }

        return Ok(new { success = true, message = "Invoice deleted successfully" });
    }
}

