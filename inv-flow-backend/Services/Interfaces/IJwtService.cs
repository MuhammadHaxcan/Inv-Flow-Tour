using inv_flow_backend.Models;
using System.Security.Claims;

namespace inv_flow_backend.Services.Interfaces;

public interface IJwtService
{
    string GenerateToken(User user, List<string> roles, List<string> permissions);
    ClaimsPrincipal? GetPrincipalFromToken(string token);
}

