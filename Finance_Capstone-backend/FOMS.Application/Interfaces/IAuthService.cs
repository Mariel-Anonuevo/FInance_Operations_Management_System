using System.Threading.Tasks;
using FOMS.Application.DTOs;

namespace FOMS.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResultDto> LoginAsync(string username, string password);
    Task<AuthResultDto> RefreshTokenAsync(string refreshToken);
    Task<bool> LogoutAsync(string refreshToken);
    Task<UserDto?> GetProfileAsync(string userId);
}
