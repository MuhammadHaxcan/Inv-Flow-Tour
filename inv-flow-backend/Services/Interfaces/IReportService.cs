using inv_flow_backend.DTOs;

namespace inv_flow_backend.Services.Interfaces;

public interface IReportService
{
    Task<ServiceReportDto> GetServiceReportAsync(ReportFilterDto filter);
    Task<CustomerReportDto> GetCustomerReportAsync(ReportFilterDto filter);
    Task<DriverReportDto> GetDriverReportAsync(ReportFilterDto filter);
    Task<SummaryReportDto> GetSummaryReportAsync(ReportFilterDto filter);
}

