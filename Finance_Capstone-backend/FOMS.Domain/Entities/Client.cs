using System;

namespace FOMS.Domain.Entities;

public class Client
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string ClientCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string BusinessName { get; set; } = string.Empty;
    public string ContactPerson { get; set; } = string.Empty;
    public string ContactNumber { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string? Tin { get; set; }
    public decimal CreditLimit { get; set; }
    public decimal CurrentBalance { get; set; }
    public decimal TotalBilled { get; set; }
    public decimal TotalPaid { get; set; }
    public string Status { get; set; } = "Active"; // "Active" or "Inactive"
    public string DateRegistered { get; set; } = string.Empty;
    public string LastTransaction { get; set; } = string.Empty;
}
