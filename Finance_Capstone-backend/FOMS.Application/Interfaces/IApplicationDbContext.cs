using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using FOMS.Domain.Entities;

namespace FOMS.Application.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Client> Clients { get; }
    DbSet<Invoice> Invoices { get; }
    DbSet<Payment> Payments { get; }
    DbSet<Employee> Employees { get; }
    DbSet<ActivityLog> ActivityLogs { get; }
    DbSet<Notification> Notifications { get; }
    DbSet<ShipmentRate> ShipmentRates { get; }
    DbSet<SpeedPayTransaction> SpeedPayTransactions { get; }
    DbSet<PaymentAdjustment> PaymentAdjustments { get; }
    DbSet<CashFlowEntry> CashFlowEntries { get; }
    DbSet<BankBalance> BankBalances { get; }
    DbSet<TransportationExpense> TransportationExpenses { get; }
    DbSet<SupportTicket> SupportTickets { get; }
    DbSet<PaymentValidation> PaymentValidations { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
