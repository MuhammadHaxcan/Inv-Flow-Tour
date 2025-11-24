namespace inv_flow_backend.DTOs;

public class InvoiceDto
{
    public int Id { get; set; }
    public string Number { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public int CustomerId { get; set; }
    public string Customer { get; set; } = string.Empty;
    public int? DriverId { get; set; }
    public string? Driver { get; set; }
    public int Persons { get; set; }
    public decimal Total { get; set; }
    public decimal Paid { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal? Vat { get; set; }
    public List<InvoiceServiceDto> Services { get; set; } = new();
    public List<InvoiceExpenseDto> Expenses { get; set; } = new();
    public List<PaymentDto> Payments { get; set; } = new();
}

public class InvoiceServiceDto
{
    public int Id { get; set; }
    public int ServiceId { get; set; }
    public string Service { get; set; } = string.Empty;
    public decimal Rate { get; set; }
}

public class InvoiceExpenseDto
{
    public int Id { get; set; }
    public int ExpenseTypeId { get; set; }
    public string Type { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime Date { get; set; }
}

public class PaymentDto
{
    public int Id { get; set; }
    public int AccountId { get; set; }
    public string Method { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime Date { get; set; }
    public string? Reference { get; set; }
    public decimal Vat { get; set; }
    public string? Notes { get; set; }
}

public class CreateInvoiceDto
{
    public DateTime Date { get; set; }
    public int CustomerId { get; set; }
    public int? DriverId { get; set; }
    public int Persons { get; set; }
    public List<CreateInvoiceServiceDto> Services { get; set; } = new();
    public List<CreateInvoiceExpenseDto> Expenses { get; set; } = new();
    public List<CreatePaymentDto> Payments { get; set; } = new();
}

public class CreateInvoiceServiceDto
{
    public int ServiceId { get; set; }
    public decimal Rate { get; set; }
}

public class CreateInvoiceExpenseDto
{
    public int ExpenseTypeId { get; set; }
    public decimal Amount { get; set; }
    public DateTime Date { get; set; }
}

public class CreatePaymentDto
{
    public int AccountId { get; set; }
    public decimal Amount { get; set; }
    public DateTime Date { get; set; }
    public string? Reference { get; set; }
    public string? Notes { get; set; }
}

public class AddPaymentDto
{
    public int AccountId { get; set; }
    public decimal Amount { get; set; }
    public DateTime Date { get; set; }
    public string? Reference { get; set; }
    public string? Notes { get; set; }
}

public class AddExpenseDto
{
    public int ExpenseTypeId { get; set; }
    public decimal Amount { get; set; }
    public DateTime Date { get; set; }
}

public class AddInvoiceServiceDto
{
    public int ServiceId { get; set; }
    public decimal Rate { get; set; }
}

public class UpdateInvoiceServiceDto
{
    public int Id { get; set; }
    public int ServiceId { get; set; }
    public decimal Rate { get; set; }
}

public class UpdateExpenseDto
{
    public int ExpenseTypeId { get; set; }
    public decimal Amount { get; set; }
    public DateTime Date { get; set; }
}

public class AssignDriverDto
{
    public int? DriverId { get; set; }
}

