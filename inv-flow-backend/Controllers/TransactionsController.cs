using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using inv_flow_backend.DTOs;
using inv_flow_backend.Services.Interfaces;
using inv_flow_backend.Attributes;

namespace inv_flow_backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TransactionsController : ControllerBase
{
    private readonly ITransactionService _transactionService;

    public TransactionsController(ITransactionService transactionService)
    {
        _transactionService = transactionService;
    }

    [HttpGet]
    [RequirePermission("transactions.read")]
    public async Task<ActionResult<List<TransactionDto>>> GetAll()
    {
        var transactions = await _transactionService.GetAllAsync();
        return Ok(transactions);
    }

    [HttpGet("account/{accountId}")]
    [RequirePermission("transactions.read")]
    public async Task<ActionResult<List<TransactionDto>>> GetByAccount(int accountId)
    {
        var transactions = await _transactionService.GetByAccountIdAsync(accountId);
        return Ok(transactions);
    }

    [HttpGet("invoice/{invoiceId}")]
    [RequirePermission("transactions.read")]
    public async Task<ActionResult<List<TransactionDto>>> GetByInvoice(int invoiceId)
    {
        var transactions = await _transactionService.GetByInvoiceIdAsync(invoiceId);
        return Ok(transactions);
    }
}

