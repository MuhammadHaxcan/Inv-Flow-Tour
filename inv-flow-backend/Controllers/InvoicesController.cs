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
    private readonly IValidator<CreateInvoiceDto> _createValidator;
    private readonly IValidator<AddPaymentDto> _addPaymentValidator;
    private readonly IValidator<AddExpenseDto> _addExpenseValidator;
    private readonly IValidator<AddInvoiceServiceDto> _addServiceValidator;
    private readonly IValidator<UpdateInvoiceServiceDto> _updateServiceValidator;
    private readonly IValidator<UpdateExpenseDto> _updateExpenseValidator;

    public InvoicesController(
        IInvoiceService invoiceService,
        IValidator<CreateInvoiceDto> createValidator,
        IValidator<AddPaymentDto> addPaymentValidator,
        IValidator<AddExpenseDto> addExpenseValidator,
        IValidator<AddInvoiceServiceDto> addServiceValidator,
        IValidator<UpdateInvoiceServiceDto> updateServiceValidator,
        IValidator<UpdateExpenseDto> updateExpenseValidator)
    {
        _invoiceService = invoiceService;
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
        try
        {
            var invoices = await _invoiceService.GetOpenInvoicesAsync();
            return Ok(invoices);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in GetOpenInvoices: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            return StatusCode(500, new { error = ex.Message, stackTrace = ex.StackTrace });
        }
    }

    [HttpGet("closed")]
    [RequirePermission("invoices.read")]
    public async Task<ActionResult<List<InvoiceDto>>> GetClosedInvoices()
    {
        try
        {
            var invoices = await _invoiceService.GetClosedInvoicesAsync();
            return Ok(invoices);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in GetClosedInvoices: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            return StatusCode(500, new { error = ex.Message, stackTrace = ex.StackTrace });
        }
    }

    [HttpGet("next-number")]
    [RequirePermission("invoices.read")]
    public async Task<ActionResult<object>> GetNextInvoiceNumber()
    {
        try
        {
            var number = await _invoiceService.GetNextInvoiceNumberAsync();
            return Ok(new { number });
        }
        catch (Exception ex)
        {
            // Log the error for debugging
            Console.WriteLine($"Error in GetNextInvoiceNumber: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            return StatusCode(500, new { error = ex.Message, stackTrace = ex.StackTrace });
        }
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
        try
        {
            var validationResult = await _createValidator.ValidateAsync(dto);
            if (!validationResult.IsValid)
            {
                return BadRequest(validationResult.Errors);
            }

            var invoice = await _invoiceService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = invoice.Id }, invoice);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in Create Invoice: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            return StatusCode(500, new { error = ex.Message, stackTrace = ex.StackTrace });
        }
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
}

