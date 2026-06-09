using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using FOMS.Application.DTOs;
using FOMS.Application.Interfaces;
using FOMS.Application.Models;
using FOMS.Domain.Entities;

namespace FOMS.Application.Services;

public class AuthService : IAuthService
{
    private readonly IApplicationDbContext _context;
    private readonly JwtSettings _jwtSettings;

    public AuthService(IApplicationDbContext context, IConfiguration configuration)
    {
        _context = context;
        _jwtSettings = configuration.GetSection("JwtSettings").Get<JwtSettings>() ?? throw new InvalidOperationException("Missing JWT configuration.");
    }

    public async Task<AuthResultDto> LoginAsync(string username, string password)
    {
        var user = await _context.Employees.FirstOrDefaultAsync(u => u.Username == username);
        if (user == null || !user.IsActive)
            throw new UnauthorizedAccessException("Invalid credentials.");

        if (!VerifyPassword(password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid credentials.");

        var token = GenerateJwtToken(user);
        var refreshToken = CreateRefreshToken(user.Id);
        await _context.RefreshTokens.AddAsync(refreshToken);
        await _context.SaveChangesAsync(default);

        return new AuthResultDto
        {
            AccessToken = token,
            RefreshToken = refreshToken.Token,
            ExpiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpirationMinutes),
            User = new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                FullName = user.Name,
                Email = user.Email,
                Role = user.Role,
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt
            }
        };
    }

    public async Task<AuthResultDto> RefreshTokenAsync(string refreshToken)
    {
        var existingToken = await _context.RefreshTokens.FirstOrDefaultAsync(rt => rt.Token == refreshToken);
        if (existingToken == null || existingToken.IsRevoked || existingToken.ExpiresAt < DateTime.UtcNow)
            throw new UnauthorizedAccessException("Invalid refresh token.");

        var user = await _context.Employees.FirstOrDefaultAsync(u => u.Id == existingToken.UserId);
        if (user == null)
            throw new UnauthorizedAccessException("Invalid refresh token.");

        existingToken.IsRevoked = true;
        _context.RefreshTokens.Update(existingToken);

        var newRefreshToken = CreateRefreshToken(user.Id);
        await _context.RefreshTokens.AddAsync(newRefreshToken);
        await _context.SaveChangesAsync(default);

        return new AuthResultDto
        {
            AccessToken = GenerateJwtToken(user),
            RefreshToken = newRefreshToken.Token,
            ExpiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpirationMinutes),
            User = new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                FullName = user.Name,
                Email = user.Email,
                Role = user.Role,
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt
            }
        };
    }

    public async Task<bool> LogoutAsync(string refreshToken)
    {
        var existingToken = await _context.RefreshTokens.FirstOrDefaultAsync(rt => rt.Token == refreshToken);
        if (existingToken == null)
            return false;

        existingToken.IsRevoked = true;
        _context.RefreshTokens.Update(existingToken);
        await _context.SaveChangesAsync(default);
        return true;
    }

    public async Task<UserDto?> GetProfileAsync(string userId)
    {
        var user = await _context.Employees.FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null)
            return null;

        return new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            FullName = user.Name,
            Email = user.Email,
            Role = user.Role,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        };
    }

    private string GenerateJwtToken(Employee user)
    {
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim("name", user.Name)
        };

        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Secret));
        var credentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: _jwtSettings.Issuer,
            audience: _jwtSettings.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpirationMinutes),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private RefreshToken CreateRefreshToken(string userId)
    {
        return new RefreshToken
        {
            UserId = userId,
            Token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64)),
            ExpiresAt = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpirationDays),
            CreatedAt = DateTime.UtcNow
        };
    }

    private bool VerifyPassword(string password, string storedHash)
    {
        if (string.IsNullOrWhiteSpace(storedHash))
        {
            return false;
        }

        if (storedHash.StartsWith("PBKDF2$"))
        {
            var parts = storedHash.Split('$');
            if (parts.Length != 4)
                return false;

            var iterations = int.Parse(parts[1]);
            var salt = Convert.FromBase64String(parts[2]);
            var storedPassword = Convert.FromBase64String(parts[3]);
            using var deriveBytes = new Rfc2898DeriveBytes(password, salt, iterations, HashAlgorithmName.SHA256);
            var computed = deriveBytes.GetBytes(storedPassword.Length);
            return computed.SequenceEqual(storedPassword);
        }

        return storedHash == password;
    }

    public static string HashPassword(string password)
    {
        var salt = RandomNumberGenerator.GetBytes(16);
        const int iterations = 150_000;
        using var deriveBytes = new Rfc2898DeriveBytes(password, salt, iterations, HashAlgorithmName.SHA256);
        var hash = deriveBytes.GetBytes(32);
        return $"PBKDF2${iterations}${Convert.ToBase64String(salt)}${Convert.ToBase64String(hash)}";
    }
}
