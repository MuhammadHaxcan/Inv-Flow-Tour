namespace inv_flow_backend.DTOs;

public class TransactionDto
{
    public int Id { get; set; }
    public DateOnly Date { get; set; }
    public string Description { get; set; } = string.Empty;
    public int? InvoiceId { get; set; }
    public string? InvoiceNumber { get; set; }
    public int AccountId { get; set; }
    public string Account { get; set; } = string.Empty;
    public decimal Credit { get; set; }
    public decimal Debit { get; set; }
    public string? Reference { get; set; }
    public string? ExpenseType { get; set; }
    public string? Notes { get; set; }
}

