using AutoMapper;
using inv_flow_backend.Data;
using inv_flow_backend.DTOs;
using inv_flow_backend.Models;
using inv_flow_backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace inv_flow_backend.Services;

public class DriverService : IDriverService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public DriverService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<DriverDto>> GetAllAsync()
    {
        var drivers = await _context.Drivers.ToListAsync();
        return _mapper.Map<List<DriverDto>>(drivers);
    }

    public async Task<DriverDto?> GetByIdAsync(int id)
    {
        var driver = await _context.Drivers.FindAsync(id);
        return driver == null ? null : _mapper.Map<DriverDto>(driver);
    }

    public async Task<DriverDto> CreateAsync(CreateDriverDto dto)
    {
        var driver = _mapper.Map<Driver>(dto);
        _context.Drivers.Add(driver);
        await _context.SaveChangesAsync();
        return _mapper.Map<DriverDto>(driver);
    }

    public async Task<DriverDto?> UpdateAsync(int id, UpdateDriverDto dto)
    {
        var driver = await _context.Drivers.FindAsync(id);
        if (driver == null) return null;

        _mapper.Map(dto, driver);
        driver.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return _mapper.Map<DriverDto>(driver);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var driver = await _context.Drivers.FindAsync(id);
        if (driver == null) return false;

        _context.Drivers.Remove(driver);
        await _context.SaveChangesAsync();
        return true;
    }
}

