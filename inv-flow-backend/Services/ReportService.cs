using inv_flow_backend.Data;
using inv_flow_backend.DTOs;
using Microsoft.EntityFrameworkCore;
using inv_flow_backend.Services.Interfaces;

namespace inv_flow_backend.Services;

public class ReportService : IReportService
{
    private readonly ApplicationDbContext _context;

    public ReportService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ServiceReportDto> GetServiceReportAsync(ReportFilterDto filter)
    {
        filter ??= new ReportFilterDto();

        // Build query with all filters applied at SQL level
        var query = _context.InvoiceServices
            .Include(isr => isr.Invoice)
            .Where(isr => isr.ServiceName != null && isr.ServiceId > 0)
            .AsQueryable();

        // Apply date filters - if StartDate or EndDate are null, no date filtering is applied (returns all data)
        if (filter.StartDate.HasValue)
            query = query.Where(isr => isr.Invoice.Date >= filter.StartDate.Value);
        if (filter.EndDate.HasValue)
            query = query.Where(isr => isr.Invoice.Date <= filter.EndDate.Value);
        if (filter.CustomerId.HasValue)
            query = query.Where(isr => isr.Invoice.CustomerId == filter.CustomerId.Value);
        if (filter.DriverId.HasValue)
            query = query.Where(isr => isr.Invoice.DriverId == filter.DriverId.Value);
        if (filter.ServiceId.HasValue)
            query = query.Where(isr => isr.ServiceId == filter.ServiceId.Value);

        // Apply agent filter if specified
        if (filter.AgentId.HasValue)
            query = query.Where(isr => isr.Invoice.CreatedByUserId == filter.AgentId.Value);

        // Execute query and group in memory (grouping is more efficient in memory for aggregations)
        var serviceItems = await query
            .AsNoTracking()
            .ToListAsync();

        if (!serviceItems.Any())
            return new ServiceReportDto { Services = new List<ServiceReportItemDto>() };

        var serviceGroups = serviceItems
            .GroupBy(isr => new { isr.ServiceId, isr.ServiceName })
            .Select(g => new ServiceReportItemDto
            {
                ServiceName = g.Key.ServiceName ?? "Unknown",
                Quantity = g.Count(),
                TotalRevenue = g.Sum(s => s.Rate),
                AveragePrice = g.Average(s => s.Rate),
                InvoiceCount = g.Select(s => s.InvoiceId).Distinct().Count()
            })
            .OrderByDescending(s => s.TotalRevenue)
            .ToList();

        return new ServiceReportDto { Services = serviceGroups };
    }

    public async Task<CustomerReportDto> GetCustomerReportAsync(ReportFilterDto filter)
    {
        filter ??= new ReportFilterDto();

        // Build query with filters
        var query = _context.Invoices
            .Include(i => i.Customer)
            .Include(i => i.InvoiceServices)
            .AsQueryable();

        // Apply date filters - if StartDate or EndDate are null, no date filtering is applied (returns all data)
        if (filter.StartDate.HasValue)
            query = query.Where(i => i.Date >= filter.StartDate.Value);
        if (filter.EndDate.HasValue)
            query = query.Where(i => i.Date <= filter.EndDate.Value);
        if (filter.CustomerId.HasValue)
            query = query.Where(i => i.CustomerId == filter.CustomerId.Value);
        if (filter.DriverId.HasValue)
            query = query.Where(i => i.DriverId == filter.DriverId.Value);

        // Apply service filter if specified
        if (filter.ServiceId.HasValue)
            query = query.Where(i => i.InvoiceServices.Any(isr => isr.ServiceId == filter.ServiceId.Value));

        // Apply agent filter if specified
        if (filter.AgentId.HasValue)
            query = query.Where(i => i.CreatedByUserId == filter.AgentId.Value);

        var invoices = await query
            .Where(i => i.Customer != null)
            .AsNoTracking()
            .ToListAsync();

        if (!invoices.Any())
            return new CustomerReportDto { Customers = new List<CustomerReportItemDto>() };

        var customerGroups = invoices
            .GroupBy(i => new { i.CustomerId, CustomerName = i.Customer!.Name, i.Customer.Email, i.Customer.Phone })
            .Select(g => new CustomerReportItemDto
            {
                CustomerName = g.Key.CustomerName,
                Email = g.Key.Email,
                Phone = g.Key.Phone,
                TotalRevenue = g.Sum(i => i.Total),
                InvoiceCount = g.Count(),
                AverageInvoice = g.Average(i => i.Total),
                Outstanding = g.Sum(i => i.Total - i.Paid)
            })
            .OrderByDescending(c => c.TotalRevenue)
            .ToList();

        return new CustomerReportDto { Customers = customerGroups };
    }

    public async Task<DriverReportDto> GetDriverReportAsync(ReportFilterDto filter)
    {
        filter ??= new ReportFilterDto();

        // Build query with filters
        var query = _context.Invoices
            .Include(i => i.Driver)
            .Include(i => i.InvoiceServices)
            .Where(i => i.DriverId != null && i.Driver != null)
            .AsQueryable();

        // Apply date filters - if StartDate or EndDate are null, no date filtering is applied (returns all data)
        if (filter.StartDate.HasValue)
            query = query.Where(i => i.Date >= filter.StartDate.Value);
        if (filter.EndDate.HasValue)
            query = query.Where(i => i.Date <= filter.EndDate.Value);
        if (filter.CustomerId.HasValue)
            query = query.Where(i => i.CustomerId == filter.CustomerId.Value);
        if (filter.DriverId.HasValue)
            query = query.Where(i => i.DriverId == filter.DriverId.Value);

        // Apply service filter if specified
        if (filter.ServiceId.HasValue)
            query = query.Where(i => i.InvoiceServices.Any(isr => isr.ServiceId == filter.ServiceId.Value));

        // Apply agent filter if specified
        if (filter.AgentId.HasValue)
            query = query.Where(i => i.CreatedByUserId == filter.AgentId.Value);

        var invoices = await query
            .AsNoTracking()
            .ToListAsync();

        if (!invoices.Any())
            return new DriverReportDto { Drivers = new List<DriverReportItemDto>() };

        var driverGroups = invoices
            .GroupBy(i => new { i.DriverId, DriverName = i.Driver!.Name, i.Driver.Phone })
            .Select(g => new DriverReportItemDto
            {
                DriverName = g.Key.DriverName,
                Phone = g.Key.Phone,
                TotalRevenue = g.Sum(i => i.Total),
                InvoiceCount = g.Count(),
                AverageInvoice = g.Average(i => i.Total)
            })
            .OrderByDescending(d => d.TotalRevenue)
            .ToList();

        return new DriverReportDto { Drivers = driverGroups };
    }

    public async Task<SummaryReportDto> GetSummaryReportAsync(ReportFilterDto filter)
    {
        filter ??= new ReportFilterDto();

        // Build query with filters
        var query = _context.Invoices
            .Include(i => i.InvoiceServices)
            .AsQueryable();

        // Apply date filters - if StartDate or EndDate are null, no date filtering is applied (returns all data)
        if (filter.StartDate.HasValue)
            query = query.Where(i => i.Date >= filter.StartDate.Value);
        if (filter.EndDate.HasValue)
            query = query.Where(i => i.Date <= filter.EndDate.Value);
        if (filter.CustomerId.HasValue)
            query = query.Where(i => i.CustomerId == filter.CustomerId.Value);
        if (filter.DriverId.HasValue)
            query = query.Where(i => i.DriverId == filter.DriverId.Value);

        // Apply service filter if specified
        if (filter.ServiceId.HasValue)
            query = query.Where(i => i.InvoiceServices.Any(isr => isr.ServiceId == filter.ServiceId.Value));

        // Apply agent filter if specified
        if (filter.AgentId.HasValue)
            query = query.Where(i => i.CreatedByUserId == filter.AgentId.Value);

        var invoices = await query
            .AsNoTracking()
            .ToListAsync();

        var totalRevenue = invoices.Sum(i => i.Total);
        var totalPaid = invoices.Sum(i => i.Paid);
        var totalOutstanding = totalRevenue - totalPaid;
        var totalInvoices = invoices.Count;

        var statusBreakdown = invoices
            .GroupBy(i => i.Status)
            .Select(g => new StatusBreakdownDto
            {
                Status = g.Key.ToString().ToLower(),
                Count = g.Count(),
                Amount = g.Sum(i => i.Total)
            })
            .ToList();

        var topServices = invoices
            .SelectMany(i => i.InvoiceServices)
            .Where(isr => !string.IsNullOrEmpty(isr.ServiceName))
            .GroupBy(isr => isr.ServiceName)
            .Select(g => new TopServiceDto
            {
                ServiceName = g.Key!,
                Revenue = g.Sum(s => s.Rate)
            })
            .OrderByDescending(s => s.Revenue)
            .Take(10)
            .ToList();

        return new SummaryReportDto
        {
            TotalRevenue = totalRevenue,
            TotalPaid = totalPaid,
            TotalOutstanding = totalOutstanding,
            TotalInvoices = totalInvoices,
            StatusBreakdown = statusBreakdown,
            TopServices = topServices
        };
    }

    public async Task<AgentReportDto> GetAgentReportAsync(ReportFilterDto filter)
    {
        filter ??= new ReportFilterDto();

        // Build query with filters - filter by CreatedAt date
        var query = _context.Invoices
            .Include(i => i.CreatedByUser)
            .Include(i => i.InvoiceServices)
            .Include(i => i.Customer)
            .Where(i => i.CreatedByUserId != null)
            .AsQueryable();

        // Apply date filters - filter by invoice creation date (CreatedAt)
        // If StartDate or EndDate are null, no date filtering is applied (returns all data)
        if (filter.StartDate.HasValue)
            query = query.Where(i => DateOnly.FromDateTime(i.CreatedAt.Date) >= filter.StartDate.Value);
        if (filter.EndDate.HasValue)
            query = query.Where(i => DateOnly.FromDateTime(i.CreatedAt.Date) <= filter.EndDate.Value);
        if (filter.CustomerId.HasValue)
            query = query.Where(i => i.CustomerId == filter.CustomerId.Value);
        if (filter.DriverId.HasValue)
            query = query.Where(i => i.DriverId == filter.DriverId.Value);

        // Apply service filter if specified
        if (filter.ServiceId.HasValue)
            query = query.Where(i => i.InvoiceServices.Any(isr => isr.ServiceId == filter.ServiceId.Value));

        // Apply agent filter if specified
        if (filter.AgentId.HasValue)
            query = query.Where(i => i.CreatedByUserId == filter.AgentId.Value);

        var invoices = await query
            .AsNoTracking()
            .ToListAsync();

        if (!invoices.Any())
            return new AgentReportDto { Agents = new List<AgentReportItemDto>() };

        var agentGroups = invoices
            .GroupBy(i => new 
            { 
                i.CreatedByUserId, 
                AgentName = i.CreatedByUser != null ? (i.CreatedByUser.FullName ?? i.CreatedByUser.Username) : "Unknown",
                Email = i.CreatedByUser != null ? i.CreatedByUser.Email : null,
                Username = i.CreatedByUser != null ? i.CreatedByUser.Username : "Unknown"
            })
            .Select(g => new AgentReportItemDto
            {
                UserId = g.Key.CreatedByUserId ?? 0,
                AgentName = g.Key.AgentName,
                Email = g.Key.Email,
                Username = g.Key.Username,
                InvoiceCount = g.Count(),
                TotalRevenue = g.Sum(i => i.Total),
                AverageInvoice = g.Average(i => i.Total),
                TotalPaid = g.Sum(i => i.Paid),
                TotalOutstanding = g.Sum(i => i.Total - i.Paid),
                Invoices = g
                    .OrderByDescending(i => i.Date)
                    .Select(i => new AgentInvoiceDto
                    {
                        InvoiceId = i.Id,
                        Number = i.Number,
                        Date = i.Date,
                        Customer = i.Customer != null ? i.Customer.Name : null,
                        Total = i.Total
                    })
                    .ToList()
            })
            .OrderByDescending(a => a.InvoiceCount)
            .ToList();

        return new AgentReportDto { Agents = agentGroups };
    }
}
