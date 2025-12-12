using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

namespace inv_flow_backend.Authorization;

public class PermissionAuthorizationHandler : AuthorizationHandler<PermissionRequirement>
{
    private readonly ILogger<PermissionAuthorizationHandler> _logger;

    public PermissionAuthorizationHandler(ILogger<PermissionAuthorizationHandler> logger)
    {
        _logger = logger;
    }

    protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, PermissionRequirement requirement)
    {
        var hasPermission = context.User.Claims
            .Where(c => c.Type == "Permission")
            .Select(c => c.Value)
            .Contains(requirement.Permission);

        if (hasPermission)
        {
            context.Succeed(requirement);
        }
        else
        {
            var userName = context.User.FindFirstValue(ClaimTypes.Name) ?? "unknown";
            _logger.LogWarning("Authorization denied for user {User} missing permission {Permission}", userName, requirement.Permission);
        }

        return Task.CompletedTask;
    }
}

