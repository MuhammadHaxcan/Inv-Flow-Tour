namespace inv_flow_backend.DTOs;

public class AgentReportDto
{
    public List<AgentReportItemDto> Agents { get; set; } = new();
}

public class AgentReportItemDto
{
    public int UserId { get; set; }
    public string AgentName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Username { get; set; }
    public int InvoiceCount { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal AverageInvoice { get; set; }
    public decimal TotalPaid { get; set; }
    public decimal TotalOutstanding { get; set; }
}

