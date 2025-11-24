using inv_flow_backend.DTOs;

namespace inv_flow_backend.Services.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto?> LoginAsync(LoginDto loginDto);
    Task<AuthResponseDto?> RegisterAsync(RegisterDto registerDto);
    Task<UserDto?> GetCurrentUserAsync(int userId);
}

