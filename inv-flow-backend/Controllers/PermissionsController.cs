using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using inv_flow_backend.DTOs;
using inv_flow_backend.Services.Interfaces;
using inv_flow_backend.Attributes;

namespace inv_flow_backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PermissionsController : ControllerBase
{
    private readonly IPermissionService _permissionService;

    public PermissionsController(IPermissionService permissionService)
    {
        _permissionService = permissionService;
    }

    [HttpGet]
    [RequirePermission("permissions.read")]
    public async Task<ActionResult<List<PermissionDto>>> GetAll()
    {
        var permissions = await _permissionService.GetAllAsync();
        return Ok(permissions);
    }

    [HttpGet("{id}")]
    [RequirePermission("permissions.read")]
    public async Task<ActionResult<PermissionDto>> GetById(int id)
    {
        var permission = await _permissionService.GetByIdAsync(id);
        if (permission == null)
        {
            return NotFound();
        }
        return Ok(permission);
    }
}

