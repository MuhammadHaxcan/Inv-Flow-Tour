using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;

namespace inv_flow_backend.Authorization;

/// <summary>
/// Dynamically creates authorization policies from permission names so controllers can simply use [Authorize(Policy = "permission.name")]
/// </summary>
public class PermissionPolicyProvider : DefaultAuthorizationPolicyProvider
{
    private readonly AuthorizationOptions _options;

    public PermissionPolicyProvider(IOptions<AuthorizationOptions> options) : base(options)
    {
        _options = options.Value;
    }

    public override Task<AuthorizationPolicy?> GetPolicyAsync(string policyName)
    {
        // If the policy was already added, use it
        var existingPolicy = _options.GetPolicy(policyName);
        if (existingPolicy is not null)
        {
            return Task.FromResult<AuthorizationPolicy?>(existingPolicy);
        }

        // Otherwise, build a permission-based policy on the fly
        var policy = new AuthorizationPolicyBuilder()
            .RequireAuthenticatedUser()
            .AddRequirements(new PermissionRequirement(policyName))
            .Build();

        _options.AddPolicy(policyName, policy);
        return Task.FromResult<AuthorizationPolicy?>(policy);
    }
}

