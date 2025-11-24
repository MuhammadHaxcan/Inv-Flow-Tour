using AutoMapper;
using inv_flow_backend.Data;
using inv_flow_backend.DTOs;
using inv_flow_backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace inv_flow_backend.Services;

public class PermissionService : IPermissionService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public PermissionService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<PermissionDto>> GetAllAsync()
    {
        var permissions = await _context.Permissions.ToListAsync();
        return _mapper.Map<List<PermissionDto>>(permissions);
    }

    public async Task<PermissionDto?> GetByIdAsync(int id)
    {
        var permission = await _context.Permissions.FindAsync(id);
        return permission == null ? null : _mapper.Map<PermissionDto>(permission);
    }
}

