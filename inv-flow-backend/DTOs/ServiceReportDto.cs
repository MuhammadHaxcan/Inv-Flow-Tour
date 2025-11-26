namespace inv_flow_backend.DTOs;

public class ServiceReportDto
{
    public List<ServiceReportItemDto> Services { get; set; } = new();
}

public class ServiceReportItemDto
{
    public string ServiceName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal AveragePrice { get; set; }
    public int InvoiceCount { get; set; }
}

