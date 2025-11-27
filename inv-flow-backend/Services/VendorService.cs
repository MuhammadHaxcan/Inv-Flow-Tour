using AutoMapper;
using inv_flow_backend.Data;
using inv_flow_backend.DTOs;
using inv_flow_backend.Models;
using inv_flow_backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace inv_flow_backend.Services;

public class VendorService : IVendorService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public VendorService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<VendorDto>> GetAllAsync()
    {
        var vendors = await _context.Vendors.OrderBy(v => v.Name).ToListAsync();
        return _mapper.Map<List<VendorDto>>(vendors);
    }

    public async Task<VendorDto?> GetByIdAsync(int id)
    {
        var vendor = await _context.Vendors.FindAsync(id);
        return vendor == null ? null : _mapper.Map<VendorDto>(vendor);
    }

    public async Task<VendorDto> CreateAsync(CreateVendorDto dto)
    {
        var vendor = _mapper.Map<Vendor>(dto);
        _context.Vendors.Add(vendor);
        await _context.SaveChangesAsync();
        return _mapper.Map<VendorDto>(vendor);
    }

    public async Task<VendorDto?> UpdateAsync(int id, UpdateVendorDto dto)
    {
        var vendor = await _context.Vendors.FindAsync(id);
        if (vendor == null) return null;

        _mapper.Map(dto, vendor);
        vendor.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return _mapper.Map<VendorDto>(vendor);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var vendor = await _context.Vendors.FindAsync(id);
        if (vendor == null) return false;

        _context.Vendors.Remove(vendor);
        await _context.SaveChangesAsync();
        return true;
    }
}

