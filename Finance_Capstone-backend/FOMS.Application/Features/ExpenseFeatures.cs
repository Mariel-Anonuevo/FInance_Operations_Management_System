using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using FOMS.Application.Interfaces;
using FOMS.Domain.Entities;

namespace FOMS.Application.Features;

public static class ExpenseFeatures
{
    public record GetExpensesQuery : IRequest<List<TransportationExpense>>;

    public class GetExpensesQueryHandler : IRequestHandler<GetExpensesQuery, List<TransportationExpense>>
    {
        private readonly IApplicationDbContext _context;

        public GetExpensesQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<TransportationExpense>> Handle(GetExpensesQuery request, CancellationToken cancellationToken)
        {
            return await _context.TransportationExpenses.ToListAsync(cancellationToken);
        }
    }

    public record RecordExpenseCommand(
        string PlateNumber,
        string DriverName,
        string ExpenseType,
        decimal Amount,
        string Description
    ) : IRequest<TransportationExpense>;

    public class RecordExpenseCommandHandler : IRequestHandler<RecordExpenseCommand, TransportationExpense>
    {
        private readonly IApplicationDbContext _context;

        public RecordExpenseCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<TransportationExpense> Handle(RecordExpenseCommand request, CancellationToken cancellationToken)
        {
            var expense = new TransportationExpense
            {
                PlateNumber = request.PlateNumber,
                DriverName = request.DriverName,
                ExpenseType = request.ExpenseType,
                Amount = request.Amount,
                Date = DateTime.UtcNow.ToString("yyyy-MM-dd"),
                Description = request.Description
            };

            var cashFlowEntry = new CashFlowEntry
            {
                Date = DateTime.UtcNow.ToString("yyyy-MM-dd"),
                Type = "Outflow",
                Category = request.ExpenseType,
                Amount = request.Amount,
                ReferenceNo = "EXP-" + DateTime.UtcNow.Ticks.ToString().Substring(12, 6),
                Description = $"Fleet expense for {request.PlateNumber} - {request.Description}"
            };

            _context.TransportationExpenses.Add(expense);
            _context.CashFlowEntries.Add(cashFlowEntry);

            await _context.SaveChangesAsync(cancellationToken);
            return expense;
        }
    }
}
