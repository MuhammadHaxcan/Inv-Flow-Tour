using System.Text.Json.Serialization;

namespace inv_flow_backend.DTOs;

public class ReportFilterDto
{
    [JsonPropertyName("startDate")]
    public DateOnly? StartDate { get; set; }
    
    [JsonPropertyName("endDate")]
    public DateOnly? EndDate { get; set; }
    
    [JsonPropertyName("serviceId")]
    public int? ServiceId { get; set; }
    
    [JsonPropertyName("customerId")]
    public int? CustomerId { get; set; }
    
    [JsonPropertyName("driverId")]
    public int? DriverId { get; set; }

    [JsonPropertyName("agentId")]
    public int? AgentId { get; set; }
}

