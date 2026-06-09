using System;
using System.Collections.Generic;

namespace FOMS.Domain.Entities;

public class Employee
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Name { get; set; } = string.Empty;
    public string Role { get; set; } = "Employee";
    public string? RoleId { get; set; }
    public Role? RoleNavigation { get; set; }
    public string Email { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string SystemAccess { get; set; } = "Granted";
    public string Status { get; set; } = "Active"; // "Active" | "Pending" | "Locked"
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty; // Store hashed or plain password
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
}
