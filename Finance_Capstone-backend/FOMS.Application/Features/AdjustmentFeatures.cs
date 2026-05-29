using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using FOMS.Application.Interfaces;
using FOMS.Domain.Entities;

namespace FOMS.Application.Features;

public static class AdjustmentFeatures
{
    public record GetAdjustmentsQuery : IRequest<List<PaymentAdjustment>>;

    public class GetAdjustmentsQueryHandler : IRequestHandler<GetAdjustmentsQuery, List<PaymentAdjustment>>
    {
        private readonly IApplicationDbContext _context;

        public GetAdjustmentsQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<PaymentAdjustment>> Handle(GetAdjustmentsQuery request, CancellationToken cancellationToken)
        {
            return await _context.PaymentAdjustments.ToListAsync(cancellationToken);
        }
    }

    public record CreateAdjustmentCommand(
        string InvoiceNo,
        string AdjustmentType,
        decimal Amount,
        string Reason,
        string ApprovedBy
    ) : IRequest<PaymentAdjustment?>;

    public class CreateAdjustmentCommandHandler : IRequestHandler<CreateAdjustmentCommand, PaymentAdjustment?>
    {
        private readonly IApplicationDbContext _context;

        public CreateAdjustmentCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<PaymentAdjustment?> Handle(CreateAdjustmentCommand request, CancellationToken cancellationToken)
        {
            var invoice = await _context.Invoices.FirstOrDefaultAsync(i => i.InvoiceNo == request.InvoiceNo, cancellationToken);
            if (invoice == null) return null;

            var adjustment = new PaymentAdjustment
            {
                InvoiceNo = request.InvoiceNo,
                AdjustmentType = request.AdjustmentType,
                Amount = request.Amount,
                Reason = request.Reason,
                ApprovedBy = request.ApprovedBy,
                DateApproved = DateTime.UtcNow.ToString("yyyy-MM-dd")
            };

            if (request.AdjustmentType.ToLower() == "credit" || request.AdjustmentType.ToLower() == "write-off")
            {
                invoice.Balance = Math.Max(0, invoice.Balance - request.Amount);
                invoice.AmountPaid += request.Amount;
            }
            else if (request.AdjustmentType.ToLower() == "debit")
            {
                invoice.TotalAmount += request.Amount;
                invoice.Balance += request.Amount;
            }

            if (invoice.Balance == 0)
            {
                invoice.PaymentStatus = "Paid";
            }
            else if (invoice.Balance < invoice.TotalAmount)
            {
                invoice.PaymentStatus = "Partially Paid";
            }
            invoice.LastUpdated = DateTime.UtcNow.ToString("yyyy-MM-dd");
            invoice.UpdatedBy = request.ApprovedBy;

            var client = await _context.Clients.FirstOrDefaultAsync(c => c.Id == invoice.ClientId, cancellationToken);
            if (client != null)
            {
                if (request.AdjustmentType.ToLower() == "credit" || request.AdjustmentType.ToLower() == "write-off")
                {
                    client.CurrentBalance = Math.Max(0, client.CurrentBalance - request.Amount);
                }
                else if (request.AdjustmentType.ToLower() == "debit")
                {
                    client.TotalBilled += request.Amount;
                    client.CurrentBalance += request.Amount;
                }
                client.LastTransaction = DateTime.UtcNow.ToString("MMM dd, yyyy");
            }

            _context.PaymentAdjustments.Add(adjustment);
            await _context.SaveChangesAsync(cancellationToken);
            return adjustment;
        }
    }
}
