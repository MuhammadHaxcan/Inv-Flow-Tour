namespace inv_flow_backend.DTOs;

public class SummaryReportDto
{
    public decimal TotalRevenue { get; set; }
    public decimal TotalPaid { get; set; }
    public decimal TotalOutstanding { get; set; }
    public int TotalInvoices { get; set; }
    public List<StatusBreakdownDto> StatusBreakdown { get; set; } = new();
    public List<TopServiceDto> TopServices { get; set; } = new();
}

public class StatusBreakdownDto
{
    public string Status { get; set; } = string.Empty;
    public int Count { get; set; }
    public decimal Amount { get; set; }
}

public class TopServiceDto
{
    public string ServiceName { get; set; } = string.Empty;
    public decimal Revenue { get; set; }
}

