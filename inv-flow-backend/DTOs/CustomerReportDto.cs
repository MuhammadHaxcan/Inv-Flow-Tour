namespace inv_flow_backend.DTOs;

public class CustomerReportDto
{
    public List<CustomerReportItemDto> Customers { get; set; } = new();
}

public class CustomerReportItemDto
{
    public string CustomerName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public decimal TotalRevenue { get; set; }
    public int InvoiceCount { get; set; }
    public decimal AverageInvoice { get; set; }
    public decimal Outstanding { get; set; }
}

