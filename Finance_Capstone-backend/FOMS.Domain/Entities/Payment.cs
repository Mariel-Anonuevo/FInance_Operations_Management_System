using System;

namespace FOMS.Domain.Entities;

public class Payment
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string OrNumber { get; set; } = string.Empty;
    public string InvoiceId { get; set; } = string.Empty;
    public string InvoiceNo { get; set; } = string.Empty;
    public string ClientId { get; set; } = string.Empty;
    public string ClientName { get; set; } = string.Empty;
    public string PaymentDate { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string PaymentMethod { get; set; } = "Cash"; // "Cash" | "Check" | "Bank Transfer" | "GCash"
    public string? ReferenceNumber { get; set; }
    public string? Remarks { get; set; }
    public string RecordedBy { get; set; } = string.Empty;
    public string DateRecorded { get; set; } = string.Empty;
}
