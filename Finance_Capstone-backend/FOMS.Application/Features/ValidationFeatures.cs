using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using FOMS.Application.Interfaces;
using FOMS.Domain.Entities;

namespace FOMS.Application.Features;

public static class ValidationFeatures
{
    public record GetValidationsQuery : IRequest<List<PaymentValidation>>;

    public class GetValidationsQueryHandler : IRequestHandler<GetValidationsQuery, List<PaymentValidation>>
    {
        private readonly IApplicationDbContext _context;

        public GetValidationsQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<PaymentValidation>> Handle(GetValidationsQuery request, CancellationToken cancellationToken)
        {
            return await _context.PaymentValidations.ToListAsync(cancellationToken);
        }
    }

    public record SubmitValidationCommand(
        string InvoiceNo,
        string ClientName,
        string DriverName,
        decimal AmountCollected
    ) : IRequest<PaymentValidation>;

    public class SubmitValidationCommandHandler : IRequestHandler<SubmitValidationCommand, PaymentValidation>
    {
        private readonly IApplicationDbContext _context;

        public SubmitValidationCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<PaymentValidation> Handle(SubmitValidationCommand request, CancellationToken cancellationToken)
        {
            var validation = new PaymentValidation
            {
                InvoiceNo = request.InvoiceNo,
                ClientName = request.ClientName,
                DriverName = request.DriverName,
                AmountCollected = request.AmountCollected,
                Status = "Pending",
                DateSubmitted = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss")
            };

            _context.PaymentValidations.Add(validation);
            await _context.SaveChangesAsync(cancellationToken);
            return validation;
        }
    }

    public record VerifyValidationCommand(
        string Id,
        string Status
    ) : IRequest<bool>;

    public class VerifyValidationCommandHandler : IRequestHandler<VerifyValidationCommand, bool>
    {
        private readonly IApplicationDbContext _context;

        public VerifyValidationCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(VerifyValidationCommand request, CancellationToken cancellationToken)
        {
            var val = await _context.PaymentValidations.FirstOrDefaultAsync(v => v.Id == request.Id, cancellationToken);
            if (val == null) return false;

            val.Status = request.Status;

            if (request.Status.ToLower() == "approved")
            {
                var invoice = await _context.Invoices.FirstOrDefaultAsync(i => i.InvoiceNo == val.InvoiceNo, cancellationToken);
                if (invoice != null)
                {
                    invoice.AmountPaid += val.AmountCollected;
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
                    invoice.UpdatedBy = "COD Driver System";

                    var payment = new Payment
                    {
                        OrNumber = "OR-COD-" + DateTime.UtcNow.Ticks.ToString().Substring(10, 6),
                        InvoiceId = invoice.Id,
                        InvoiceNo = invoice.InvoiceNo,
                        ClientId = invoice.ClientId,
                        ClientName = invoice.ClientName,
                        PaymentDate = DateTime.UtcNow.ToString("yyyy-MM-dd"),
                        Amount = val.AmountCollected,
                        PaymentMethod = "Cash",
                        ReferenceNumber = "COD-" + DateTime.UtcNow.Ticks.ToString().Substring(12, 6),
                        Remarks = $"Driver {val.DriverName} COD collection validation approved",
                        RecordedBy = "COD Driver System",
                        DateRecorded = DateTime.UtcNow.ToString("yyyy-MM-dd")
                    };

                    var client = await _context.Clients.FirstOrDefaultAsync(c => c.Id == invoice.ClientId, cancellationToken);
                    if (client != null)
                    {
                        client.TotalPaid += val.AmountCollected;
                        client.CurrentBalance = Math.Max(0, client.CurrentBalance - val.AmountCollected);
                        client.LastTransaction = DateTime.UtcNow.ToString("MMM dd, yyyy");
                    }

                    _context.Payments.Add(payment);
                }
            }

            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}
