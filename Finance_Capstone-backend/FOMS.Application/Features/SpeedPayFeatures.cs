using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using FOMS.Application.Interfaces;
using FOMS.Domain.Entities;

namespace FOMS.Application.Features;

public static class SpeedPayFeatures
{
    public record ProcessDigitalPaymentCommand(
        string InvoiceNo,
        decimal Amount,
        string CardBrand,
        string CardLast4
    ) : IRequest<SpeedPayTransaction?>;

    public class ProcessDigitalPaymentCommandHandler : IRequestHandler<ProcessDigitalPaymentCommand, SpeedPayTransaction?>
    {
        private readonly IApplicationDbContext _context;

        public ProcessDigitalPaymentCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<SpeedPayTransaction?> Handle(ProcessDigitalPaymentCommand request, CancellationToken cancellationToken)
        {
            var invoice = await _context.Invoices.FirstOrDefaultAsync(i => i.InvoiceNo == request.InvoiceNo, cancellationToken);
            if (invoice == null) return null;

            // Create Transaction entry
            var transaction = new SpeedPayTransaction
            {
                InvoiceNo = request.InvoiceNo,
                Amount = request.Amount,
                CardBrand = request.CardBrand,
                CardLast4 = request.CardLast4,
                Status = "Approved",
                TransactionDate = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss")
            };

            // Update Invoice Paid Amount and Balance
            invoice.AmountPaid += request.Amount;
            invoice.Balance = Math.Max(0, invoice.TotalAmount - invoice.AmountPaid);

            if (invoice.Balance == 0)
            {
                invoice.PaymentStatus = "Paid";
            }
            else
            {
                invoice.PaymentStatus = "Partially Paid";
            }
            invoice.LastUpdated = DateTime.UtcNow.ToString("yyyy-MM-dd");
            invoice.UpdatedBy = "SpeedPay Gateway";

            // Add Payment Record
            var payment = new Payment
            {
                OrNumber = "OR-SP-" + DateTime.UtcNow.Ticks.ToString().Substring(10, 6),
                InvoiceId = invoice.Id,
                InvoiceNo = invoice.InvoiceNo,
                ClientId = invoice.ClientId,
                ClientName = invoice.ClientName,
                PaymentDate = DateTime.UtcNow.ToString("yyyy-MM-dd"),
                Amount = request.Amount,
                PaymentMethod = "Bank Transfer",
                ReferenceNumber = "SP-" + DateTime.UtcNow.Ticks.ToString().Substring(12, 6),
                Remarks = "SpeedPay Online Processing Approved",
                RecordedBy = "SpeedPay Gateway",
                DateRecorded = DateTime.UtcNow.ToString("yyyy-MM-dd")
            };

            // Update Client totals
            var client = await _context.Clients.FirstOrDefaultAsync(c => c.Id == invoice.ClientId, cancellationToken);
            if (client != null)
            {
                client.TotalPaid += request.Amount;
                client.CurrentBalance = Math.Max(0, client.CurrentBalance - request.Amount);
                client.LastTransaction = DateTime.UtcNow.ToString("MMM dd, yyyy");
            }

            _context.SpeedPayTransactions.Add(transaction);
            _context.Payments.Add(payment);
            await _context.SaveChangesAsync(cancellationToken);

            return transaction;
        }
    }
}
