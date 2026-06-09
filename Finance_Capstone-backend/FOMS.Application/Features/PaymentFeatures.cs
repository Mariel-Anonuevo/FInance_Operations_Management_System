using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using FOMS.Application.Interfaces;
using FOMS.Domain.Entities;

namespace FOMS.Application.Features;

public static class PaymentFeatures
{
    public record GetPaymentsQuery : IRequest<List<Payment>>;

    public class GetPaymentsQueryHandler : IRequestHandler<GetPaymentsQuery, List<Payment>>
    {
        private readonly IApplicationDbContext _context;

        public GetPaymentsQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<Payment>> Handle(GetPaymentsQuery request, CancellationToken cancellationToken)
        {
            return await _context.Payments.ToListAsync(cancellationToken);
        }
    }

    public record RecordPaymentCommand(
        string OrNumber,
        string InvoiceId,
        string InvoiceNo,
        string ClientId,
        string ClientName,
        string PaymentDate,
        decimal Amount,
        string PaymentMethod,
        string? ReferenceNumber,
        string? Remarks,
        string RecordedBy
    ) : IRequest<Payment>;

    public class RecordPaymentCommandHandler : IRequestHandler<RecordPaymentCommand, Payment>
    {
        private readonly IApplicationDbContext _context;

        public RecordPaymentCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Payment> Handle(RecordPaymentCommand request, CancellationToken cancellationToken)
        {
            var payment = new Payment
            {
                OrNumber = request.OrNumber,
                InvoiceId = request.InvoiceId,
                InvoiceNo = request.InvoiceNo,
                ClientId = request.ClientId,
                ClientName = request.ClientName,
                PaymentDate = request.PaymentDate,
                Amount = request.Amount,
                PaymentMethod = request.PaymentMethod,
                ReferenceNumber = request.ReferenceNumber,
                Remarks = request.Remarks,
                RecordedBy = request.RecordedBy,
                DateRecorded = DateTime.UtcNow.ToString("yyyy-MM-dd")
            };

            // Update Invoice Paid Amount and Balance
            var invoice = await _context.Invoices.FirstOrDefaultAsync(i => i.Id == request.InvoiceId, cancellationToken);
            if (invoice != null)
            {
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
                invoice.UpdatedBy = request.RecordedBy;
            }

            // Update Client totals
            var client = await _context.Clients.FirstOrDefaultAsync(c => c.Id == request.ClientId, cancellationToken);
            if (client != null)
            {
                client.TotalPaid += request.Amount;
                client.CurrentBalance = Math.Max(0, client.CurrentBalance - request.Amount);
                client.LastTransaction = DateTime.UtcNow.ToString("MMM dd, yyyy");
            }

            _context.Payments.Add(payment);
            await _context.SaveChangesAsync(cancellationToken);
            return payment;
        }
    }
}
