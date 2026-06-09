using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using FOMS.Application.Interfaces;
using FOMS.Domain.Entities;

namespace FOMS.Application.Features;

public static class InvoiceFeatures
{
    public record GetInvoicesQuery : IRequest<List<Invoice>>;

    public class GetInvoicesQueryHandler : IRequestHandler<GetInvoicesQuery, List<Invoice>>
    {
        private readonly IApplicationDbContext _context;

        public GetInvoicesQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<Invoice>> Handle(GetInvoicesQuery request, CancellationToken cancellationToken)
        {
            return await _context.Invoices.ToListAsync(cancellationToken);
        }
    }

    public record CreateInvoiceCommand(
        string InvoiceNo,
        string ClientId,
        string ClientName,
        string BillingDate,
        string DueDate,
        decimal FreightCharges,
        decimal OtherCharges,
        decimal Subtotal,
        double VatRate,
        decimal VatAmount,
        decimal Surcharge,
        decimal TotalAmount,
        string Description,
        string EncodedBy
    ) : IRequest<Invoice>;

    public class CreateInvoiceCommandHandler : IRequestHandler<CreateInvoiceCommand, Invoice>
    {
        private readonly IApplicationDbContext _context;

        public CreateInvoiceCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Invoice> Handle(CreateInvoiceCommand request, CancellationToken cancellationToken)
        {
            var invoice = new Invoice
            {
                InvoiceNo = request.InvoiceNo,
                ClientId = request.ClientId,
                ClientName = request.ClientName,
                BillingDate = request.BillingDate,
                DueDate = request.DueDate,
                FreightCharges = request.FreightCharges,
                OtherCharges = request.OtherCharges,
                Subtotal = request.Subtotal,
                VatRate = request.VatRate,
                VatAmount = request.VatAmount,
                Surcharge = request.Surcharge,
                TotalAmount = request.TotalAmount,
                AmountPaid = 0,
                Balance = request.TotalAmount,
                PaymentStatus = "Unpaid",
                AgingBucket = "Current",
                DaysOverdue = 0,
                Description = request.Description,
                EncodedBy = request.EncodedBy,
                DateEncoded = DateTime.UtcNow.ToString("yyyy-MM-dd"),
                LastUpdated = DateTime.UtcNow.ToString("yyyy-MM-dd"),
                UpdatedBy = request.EncodedBy,
                Archived = false
            };

            // Update Client's total billed and balance
            var client = await _context.Clients.FirstOrDefaultAsync(c => c.Id == request.ClientId, cancellationToken);
            if (client != null)
            {
                client.TotalBilled += request.TotalAmount;
                client.CurrentBalance += request.TotalAmount;
                client.LastTransaction = DateTime.UtcNow.ToString("MMM dd, yyyy");
            }

            _context.Invoices.Add(invoice);
            await _context.SaveChangesAsync(cancellationToken);
            return invoice;
        }
    }

    public record DeleteInvoiceCommand(string Id) : IRequest<bool>;

    public class DeleteInvoiceCommandHandler : IRequestHandler<DeleteInvoiceCommand, bool>
    {
        private readonly IApplicationDbContext _context;

        public DeleteInvoiceCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(DeleteInvoiceCommand request, CancellationToken cancellationToken)
        {
            var invoice = await _context.Invoices.FirstOrDefaultAsync(i => i.Id == request.Id, cancellationToken);
            if (invoice == null) return false;

            // Revert client's total billed and balance if the invoice is open
            var client = await _context.Clients.FirstOrDefaultAsync(c => c.Id == invoice.ClientId, cancellationToken);
            if (client != null)
            {
                client.TotalBilled -= invoice.TotalAmount;
                client.CurrentBalance -= invoice.Balance;
            }

            _context.Invoices.Remove(invoice);
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }
    }

    public record ArchiveInvoiceCommand(string Id, bool Archived) : IRequest<bool>;

    public class ArchiveInvoiceCommandHandler : IRequestHandler<ArchiveInvoiceCommand, bool>
    {
        private readonly IApplicationDbContext _context;

        public ArchiveInvoiceCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(ArchiveInvoiceCommand request, CancellationToken cancellationToken)
        {
            var invoice = await _context.Invoices.FirstOrDefaultAsync(i => i.Id == request.Id, cancellationToken);
            if (invoice == null) return false;

            invoice.Archived = request.Archived;
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}
