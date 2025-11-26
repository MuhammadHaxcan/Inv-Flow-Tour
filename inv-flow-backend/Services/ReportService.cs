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
        if (filter == null)
            filter = new ReportFilterDto();

        var query = _context.Invoices
            .Include(i => i.InvoiceServices)
            .AsQueryable();

        // Apply filters
        if (filter.StartDate.HasValue)
        {
            query = query.Where(i => i.Date >= filter.StartDate.Value);
        }
        if (filter.EndDate.HasValue)
        {
            query = query.Where(i => i.Date <= filter.EndDate.Value);
        }
        if (filter.ServiceId.HasValue)
            query = query.Where(i => i.InvoiceServices.Any(isr => isr.ServiceId == filter.ServiceId.Value));
        if (filter.CustomerId.HasValue)
            query = query.Where(i => i.CustomerId == filter.CustomerId.Value);
        if (filter.DriverId.HasValue)
            query = query.Where(i => i.DriverId == filter.DriverId.Value);

        var invoices = await query.ToListAsync();

        if (!invoices.Any())
        {
            return new ServiceReportDto { Services = new List<ServiceReportItemDto>() };
        }

        var serviceGroups = invoices
            .Where(i => i.InvoiceServices != null)
            .SelectMany(i => i.InvoiceServices!)
            .Where(isr => isr != null && !string.IsNullOrEmpty(isr.ServiceName))
            .GroupBy(isr => new { isr.ServiceId, ServiceName = isr.ServiceName })
            .Select(g => new ServiceReportItemDto
            {
                ServiceName = g.Key.ServiceName ?? "Unknown",
                Quantity = g.Count(),
                TotalRevenue = g.Sum(s => s.Rate),
                AveragePrice = g.Any() ? g.Average(s => s.Rate) : 0,
                InvoiceCount = g.Select(s => s.InvoiceId).Distinct().Count()
            })
            .OrderByDescending(s => s.TotalRevenue)
            .ToList();

        return new ServiceReportDto { Services = serviceGroups };
    }

    public async Task<CustomerReportDto> GetCustomerReportAsync(ReportFilterDto filter)
    {
        if (filter == null)
            filter = new ReportFilterDto();

        var query = _context.Invoices
            .Include(i => i.Customer)
            .Include(i => i.InvoiceServices)
            .AsQueryable();

        // Apply filters
        if (filter.StartDate.HasValue)
        {
            query = query.Where(i => i.Date >= filter.StartDate.Value);
        }
        if (filter.EndDate.HasValue)
        {
            query = query.Where(i => i.Date <= filter.EndDate.Value);
        }
        if (filter.ServiceId.HasValue)
            query = query.Where(i => i.InvoiceServices.Any(isr => isr.ServiceId == filter.ServiceId.Value));
        if (filter.CustomerId.HasValue)
            query = query.Where(i => i.CustomerId == filter.CustomerId.Value);
        if (filter.DriverId.HasValue)
            query = query.Where(i => i.DriverId == filter.DriverId.Value);

        var invoices = await query.ToListAsync();

        if (!invoices.Any())
        {
            return new CustomerReportDto { Customers = new List<CustomerReportItemDto>() };
        }

        var customerGroups = invoices
            .Where(i => i.Customer != null)
            .GroupBy(i => new { i.CustomerId, CustomerName = i.Customer!.Name, i.Customer.Email, i.Customer.Phone })
            .Select(g => new CustomerReportItemDto
            {
                CustomerName = g.Key.CustomerName ?? "Unknown",
                Email = g.Key.Email,
                Phone = g.Key.Phone,
                TotalRevenue = g.Sum(i => i.Total),
                InvoiceCount = g.Count(),
                AverageInvoice = g.Any() ? g.Average(i => i.Total) : 0,
                Outstanding = g.Sum(i => i.Total - i.Paid)
            })
            .OrderByDescending(c => c.TotalRevenue)
            .ToList();

        return new CustomerReportDto { Customers = customerGroups };
    }

    public async Task<DriverReportDto> GetDriverReportAsync(ReportFilterDto filter)
    {
        if (filter == null)
            filter = new ReportFilterDto();

        var query = _context.Invoices
            .Include(i => i.Driver)
            .Include(i => i.InvoiceServices)
            .Where(i => i.DriverId != null)
            .AsQueryable();

        // Apply filters
        if (filter.StartDate.HasValue)
        {
            query = query.Where(i => i.Date >= filter.StartDate.Value);
        }
        if (filter.EndDate.HasValue)
        {
            query = query.Where(i => i.Date <= filter.EndDate.Value);
        }
        if (filter.ServiceId.HasValue)
            query = query.Where(i => i.InvoiceServices.Any(isr => isr.ServiceId == filter.ServiceId.Value));
        if (filter.CustomerId.HasValue)
            query = query.Where(i => i.CustomerId == filter.CustomerId.Value);
        if (filter.DriverId.HasValue)
            query = query.Where(i => i.DriverId == filter.DriverId.Value);

        var invoices = await query.ToListAsync();

        if (!invoices.Any())
        {
            return new DriverReportDto { Drivers = new List<DriverReportItemDto>() };
        }

        var driverGroups = invoices
            .Where(i => i.Driver != null)
            .GroupBy(i => new { i.DriverId, DriverName = i.Driver!.Name, i.Driver.Phone })
            .Select(g => new DriverReportItemDto
            {
                DriverName = g.Key.DriverName ?? "Unknown",
                Phone = g.Key.Phone,
                TotalRevenue = g.Sum(i => i.Total),
                InvoiceCount = g.Count(),
                AverageInvoice = g.Any() ? g.Average(i => i.Total) : 0
            })
            .OrderByDescending(d => d.TotalRevenue)
            .ToList();

        return new DriverReportDto { Drivers = driverGroups };
    }

    public async Task<SummaryReportDto> GetSummaryReportAsync(ReportFilterDto filter)
    {
        if (filter == null)
            filter = new ReportFilterDto();

        var query = _context.Invoices
            .Include(i => i.InvoiceServices)
            .AsQueryable();

        // Apply filters
        if (filter.StartDate.HasValue)
        {
            query = query.Where(i => i.Date >= filter.StartDate.Value);
        }
        if (filter.EndDate.HasValue)
        {
            query = query.Where(i => i.Date <= filter.EndDate.Value);
        }
        if (filter.ServiceId.HasValue)
            query = query.Where(i => i.InvoiceServices.Any(isr => isr.ServiceId == filter.ServiceId.Value));
        if (filter.CustomerId.HasValue)
            query = query.Where(i => i.CustomerId == filter.CustomerId.Value);
        if (filter.DriverId.HasValue)
            query = query.Where(i => i.DriverId == filter.DriverId.Value);

        var invoices = await query.ToListAsync();

        var totalRevenue = invoices.Any() ? invoices.Sum(i => i.Total) : 0;
        var totalPaid = invoices.Any() ? invoices.Sum(i => i.Paid) : 0;
        var totalOutstanding = totalRevenue - totalPaid;
        var totalInvoices = invoices.Count;

        var statusBreakdown = invoices
            .GroupBy(i => i.Status)
            .Select(g => new StatusBreakdownDto
            {
                Status = g.Key ?? "unknown",
                Count = g.Count(),
                Amount = g.Sum(i => i.Total)
            })
            .ToList();

        var topServices = invoices
            .Where(i => i.InvoiceServices != null)
            .SelectMany(i => i.InvoiceServices!)
            .Where(isr => isr != null && !string.IsNullOrEmpty(isr.ServiceName))
            .GroupBy(isr => isr.ServiceName)
            .Select(g => new TopServiceDto
            {
                ServiceName = g.Key ?? "Unknown",
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
}

