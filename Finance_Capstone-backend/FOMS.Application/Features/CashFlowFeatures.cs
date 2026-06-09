using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using FOMS.Application.Interfaces;
using FOMS.Domain.Entities;

namespace FOMS.Application.Features;

public static class CashFlowFeatures
{
    public record GetCashFlowQuery : IRequest<List<CashFlowEntry>>;

    public class GetCashFlowQueryHandler : IRequestHandler<GetCashFlowQuery, List<CashFlowEntry>>
    {
        private readonly IApplicationDbContext _context;

        public GetCashFlowQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<CashFlowEntry>> Handle(GetCashFlowQuery request, CancellationToken cancellationToken)
        {
            return await _context.CashFlowEntries.ToListAsync(cancellationToken);
        }
    }

    public record GetBankBalancesQuery : IRequest<List<BankBalance>>;

    public class GetBankBalancesQueryHandler : IRequestHandler<GetBankBalancesQuery, List<BankBalance>>
    {
        private readonly IApplicationDbContext _context;

        public GetBankBalancesQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<BankBalance>> Handle(GetBankBalancesQuery request, CancellationToken cancellationToken)
        {
            return await _context.BankBalances.ToListAsync(cancellationToken);
        }
    }

    public record AddCashFlowCommand(
        string Type,
        string Category,
        decimal Amount,
        string ReferenceNo,
        string Description
    ) : IRequest<CashFlowEntry>;

    public class AddCashFlowCommandHandler : IRequestHandler<AddCashFlowCommand, CashFlowEntry>
    {
        private readonly IApplicationDbContext _context;

        public AddCashFlowCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<CashFlowEntry> Handle(AddCashFlowCommand request, CancellationToken cancellationToken)
        {
            var entry = new CashFlowEntry
            {
                Date = DateTime.UtcNow.ToString("yyyy-MM-dd"),
                Type = request.Type,
                Category = request.Category,
                Amount = request.Amount,
                ReferenceNo = request.ReferenceNo,
                Description = request.Description
            };

            _context.CashFlowEntries.Add(entry);
            await _context.SaveChangesAsync(cancellationToken);
            return entry;
        }
    }
}
