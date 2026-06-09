using System;

namespace FOMS.Domain.Entities;

public class CashFlowEntry
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Date { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // "Inflow" or "Outflow"
    public string Category { get; set; } = string.Empty; // e.g. "Collection", "Fuel", "Maintenance", "Refund"
    public decimal Amount { get; set; }
    public string ReferenceNo { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}
