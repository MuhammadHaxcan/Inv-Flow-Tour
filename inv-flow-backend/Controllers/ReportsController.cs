using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using inv_flow_backend.DTOs;
using inv_flow_backend.Services.Interfaces;
using inv_flow_backend.Attributes;

namespace inv_flow_backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly IReportService _reportService;

    public ReportsController(IReportService reportService)
    {
        _reportService = reportService;
    }

    [HttpPost("service")]
    [RequirePermission("reports.read")]
    public async Task<ActionResult<ServiceReportDto>> GetServiceReport([FromBody] ReportFilterDto? filter)
    {
        if (filter == null)
            filter = new ReportFilterDto();
        
        var report = await _reportService.GetServiceReportAsync(filter);
        return Ok(report);
    }

    [HttpPost("customer")]
    [RequirePermission("reports.read")]
    public async Task<ActionResult<CustomerReportDto>> GetCustomerReport([FromBody] ReportFilterDto? filter)
    {
        if (filter == null)
            filter = new ReportFilterDto();
        
        var report = await _reportService.GetCustomerReportAsync(filter);
        return Ok(report);
    }

    [HttpPost("driver")]
    [RequirePermission("reports.read")]
    public async Task<ActionResult<DriverReportDto>> GetDriverReport([FromBody] ReportFilterDto? filter)
    {
        if (filter == null)
            filter = new ReportFilterDto();
        
        var report = await _reportService.GetDriverReportAsync(filter);
        return Ok(report);
    }

    [HttpPost("summary")]
    [RequirePermission("reports.read")]
    public async Task<ActionResult<SummaryReportDto>> GetSummaryReport([FromBody] ReportFilterDto? filter)
    {
        if (filter == null)
            filter = new ReportFilterDto();
        
        var report = await _reportService.GetSummaryReportAsync(filter);
        return Ok(report);
    }

    [HttpPost("agent")]
    [RequirePermission("reports.read")]
    public async Task<ActionResult<AgentReportDto>> GetAgentReport([FromBody] ReportFilterDto? filter)
    {
        if (filter == null)
            filter = new ReportFilterDto();
        
        var report = await _reportService.GetAgentReportAsync(filter);
        return Ok(report);
    }
}
