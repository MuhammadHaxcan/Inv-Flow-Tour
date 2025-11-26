namespace inv_flow_backend.DTOs;

public class DriverReportDto
{
    public List<DriverReportItemDto> Drivers { get; set; } = new();
}

public class DriverReportItemDto
{
    public string DriverName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public decimal TotalRevenue { get; set; }
    public int InvoiceCount { get; set; }
    public decimal AverageInvoice { get; set; }
}

