using System;

namespace FOMS.Domain.Entities;

public class PaymentAdjustment
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string InvoiceNo { get; set; } = string.Empty;
    public string AdjustmentType { get; set; } = string.Empty; // "Credit", "Debit", "Write-Off"
    public decimal Amount { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string ApprovedBy { get; set; } = string.Empty;
    public string DateApproved { get; set; } = string.Empty;
}
