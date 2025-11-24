using AutoMapper;
using inv_flow_backend.Data;
using inv_flow_backend.DTOs;
using inv_flow_backend.Models;
using inv_flow_backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace inv_flow_backend.Services;

public class RoleService : IRoleService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public RoleService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<RoleDto>> GetAllAsync()
    {
        var roles = await _context.Roles
            .Include(r => r.RolePermissions)
            .ToListAsync();

        return _mapper.Map<List<RoleDto>>(roles);
    }

    public async Task<RoleDto?> GetByIdAsync(int id)
    {
        var role = await _context.Roles
            .Include(r => r.RolePermissions)
            .FirstOrDefaultAsync(r => r.Id == id);

        return role == null ? null : _mapper.Map<RoleDto>(role);
    }

    public async Task<RoleDto> CreateAsync(CreateRoleDto dto)
    {
        if (await _context.Roles.AnyAsync(r => r.Name == dto.Name))
        {
            throw new InvalidOperationException("Role name already exists");
        }

        var role = new Role
        {
            Name = dto.Name,
            Description = dto.Description
        };

        _context.Roles.Add(role);
        await _context.SaveChangesAsync();

        // Assign permissions
        if (dto.PermissionIds.Any())
        {
            foreach (var permissionId in dto.PermissionIds)
            {
                if (await _context.Permissions.AnyAsync(p => p.Id == permissionId))
                {
                    _context.RolePermissions.Add(new RolePermission
                    {
                        RoleId = role.Id,
                        PermissionId = permissionId
                    });
                }
            }
            await _context.SaveChangesAsync();
        }

        return await GetByIdAsync(role.Id) ?? throw new Exception("Failed to create role");
    }

    public async Task<RoleDto?> UpdateAsync(int id, UpdateRoleDto dto)
    {
        var role = await _context.Roles
            .Include(r => r.RolePermissions)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (role == null) return null;

        if (!string.IsNullOrEmpty(dto.Name) && dto.Name != role.Name)
        {
            if (await _context.Roles.AnyAsync(r => r.Name == dto.Name && r.Id != id))
            {
                throw new InvalidOperationException("Role name already exists");
            }
            role.Name = dto.Name;
        }

        if (dto.Description != null)
        {
            role.Description = dto.Description;
        }

        role.UpdatedAt = DateTime.UtcNow;

        // Update permissions
        if (dto.PermissionIds != null)
        {
            var existingPermissions = role.RolePermissions.ToList();
            _context.RolePermissions.RemoveRange(existingPermissions);

            foreach (var permissionId in dto.PermissionIds)
            {
                if (await _context.Permissions.AnyAsync(p => p.Id == permissionId))
                {
                    _context.RolePermissions.Add(new RolePermission
                    {
                        RoleId = role.Id,
                        PermissionId = permissionId
                    });
                }
            }
        }

        await _context.SaveChangesAsync();
        return await GetByIdAsync(id);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var role = await _context.Roles.FindAsync(id);
        if (role == null) return false;

        _context.Roles.Remove(role);
        await _context.SaveChangesAsync();
        return true;
    }
}

