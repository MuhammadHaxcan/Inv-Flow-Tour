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
    [RequirePermission("invoices.read")]
    public async Task<ActionResult<ServiceReportDto>> GetServiceReport([FromBody] ReportFilterDto filter)
    {
        try
        {
            if (filter == null)
                filter = new ReportFilterDto();
            
            var report = await _reportService.GetServiceReportAsync(filter);
            return Ok(report);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while generating the service report", error = ex.Message });
        }
    }

    [HttpPost("customer")]
    [RequirePermission("invoices.read")]
    public async Task<ActionResult<CustomerReportDto>> GetCustomerReport([FromBody] ReportFilterDto filter)
    {
        try
        {
            if (filter == null)
                filter = new ReportFilterDto();
            
            var report = await _reportService.GetCustomerReportAsync(filter);
            return Ok(report);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while generating the customer report", error = ex.Message });
        }
    }

    [HttpPost("driver")]
    [RequirePermission("invoices.read")]
    public async Task<ActionResult<DriverReportDto>> GetDriverReport([FromBody] ReportFilterDto filter)
    {
        try
        {
            if (filter == null)
                filter = new ReportFilterDto();
            
            var report = await _reportService.GetDriverReportAsync(filter);
            return Ok(report);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while generating the driver report", error = ex.Message });
        }
    }

    [HttpPost("summary")]
    [RequirePermission("invoices.read")]
    public async Task<ActionResult<SummaryReportDto>> GetSummaryReport([FromBody] ReportFilterDto filter)
    {
        try
        {
            if (filter == null)
                filter = new ReportFilterDto();
            
            var report = await _reportService.GetSummaryReportAsync(filter);
            return Ok(report);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while generating the summary report", error = ex.Message });
        }
    }
}

