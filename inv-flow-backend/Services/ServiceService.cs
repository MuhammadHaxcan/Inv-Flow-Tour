using AutoMapper;
using inv_flow_backend.Data;
using inv_flow_backend.DTOs;
using inv_flow_backend.Models;
using inv_flow_backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace inv_flow_backend.Services;

public class ServiceService : IServiceService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public ServiceService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<ServiceDto>> GetAllAsync()
    {
        var services = await _context.Services.ToListAsync();
        return _mapper.Map<List<ServiceDto>>(services);
    }

    public async Task<ServiceDto?> GetByIdAsync(int id)
    {
        var service = await _context.Services.FindAsync(id);
        return service == null ? null : _mapper.Map<ServiceDto>(service);
    }

    public async Task<ServiceDto> CreateAsync(CreateServiceDto dto)
    {
        var service = _mapper.Map<Service>(dto);
        _context.Services.Add(service);
        await _context.SaveChangesAsync();
        return _mapper.Map<ServiceDto>(service);
    }

    public async Task<ServiceDto?> UpdateAsync(int id, UpdateServiceDto dto)
    {
        var service = await _context.Services.FindAsync(id);
        if (service == null) return null;

        _mapper.Map(dto, service);
        service.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return _mapper.Map<ServiceDto>(service);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var service = await _context.Services.FindAsync(id);
        if (service == null) return false;

        _context.Services.Remove(service);
        await _context.SaveChangesAsync();
        return true;
    }
}

