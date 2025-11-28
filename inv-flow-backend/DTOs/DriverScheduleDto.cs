namespace inv_flow_backend.DTOs;

public class DriverScheduleDto
{
    public int DriverId { get; set; }
    public string DriverName { get; set; } = string.Empty;
    public string? DriverPhone { get; set; }
    public DateOnly Date { get; set; }
    public List<DriverScheduleInvoiceDto> Invoices { get; set; } = new();
}

public class DriverScheduleInvoiceDto
{
    public int InvoiceId { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public string Customer { get; set; } = string.Empty;
    public int Persons { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal Total { get; set; }
    public string? DriverNotes { get; set; }
    public List<string> Services { get; set; } = new();
}

