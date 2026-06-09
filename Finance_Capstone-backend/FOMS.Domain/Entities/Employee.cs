using System;

namespace FOMS.Domain.Entities;

public class Employee
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Name { get; set; } = string.Empty;
    public string Role { get; set; } = "EMPLOYEE"; // "ADMIN" | "OP. TEAM"
    public string SystemAccess { get; set; } = "Granted";
    public string Status { get; set; } = "Active"; // "Active" | "Pending" | "Locked"
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty; // Store hashed or plain password
}
