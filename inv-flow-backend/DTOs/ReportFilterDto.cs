using System.Text.Json.Serialization;

namespace inv_flow_backend.DTOs;

/// <summary>
/// Filter DTO for reports. 
/// If StartDate or EndDate are null/empty, all data is returned (no date filtering applied).
/// </summary>
public class ReportFilterDto
{
    /// <summary>
    /// Start date filter. If null, no start date filter is applied (returns all data from beginning).
    /// Defaults to null to show all data.
    /// </summary>
    [JsonPropertyName("startDate")]
    public DateOnly? StartDate { get; set; } = null;
    
    /// <summary>
    /// End date filter. If null, no end date filter is applied (returns all data until end).
    /// Defaults to null to show all data.
    /// </summary>
    [JsonPropertyName("endDate")]
    public DateOnly? EndDate { get; set; } = null;
    
    [JsonPropertyName("serviceId")]
    public int? ServiceId { get; set; }
    
    [JsonPropertyName("customerId")]
    public int? CustomerId { get; set; }
    
    [JsonPropertyName("driverId")]
    public int? DriverId { get; set; }

    [JsonPropertyName("agentId")]
    public int? AgentId { get; set; }
}

