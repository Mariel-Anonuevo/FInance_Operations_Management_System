using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using FOMS.Application.Interfaces;
using FOMS.Domain.Entities;

namespace FOMS.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Client> Clients => Set<Client>();
    public DbSet<Invoice> Invoices => Set<Invoice>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<ActivityLog> ActivityLogs => Set<ActivityLog>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<ShipmentRate> ShipmentRates => Set<ShipmentRate>();
    public DbSet<SpeedPayTransaction> SpeedPayTransactions => Set<SpeedPayTransaction>();
    public DbSet<PaymentAdjustment> PaymentAdjustments => Set<PaymentAdjustment>();
    public DbSet<CashFlowEntry> CashFlowEntries => Set<CashFlowEntry>();
    public DbSet<BankBalance> BankBalances => Set<BankBalance>();
    public DbSet<TransportationExpense> TransportationExpenses => Set<TransportationExpense>();
    public DbSet<SupportTicket> SupportTickets => Set<SupportTicket>();
    public DbSet<PaymentValidation> PaymentValidations => Set<PaymentValidation>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure decimals with precision to avoid SQL Server truncation warnings
        foreach (var property in modelBuilder.Model.GetEntityTypes())
        {
            foreach (var prop in property.GetProperties())
            {
                if (prop.ClrType == typeof(decimal) || prop.ClrType == typeof(decimal?))
                {
                    prop.SetPrecision(18);
                    prop.SetScale(2);
                }
            }
        }
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await base.SaveChangesAsync(cancellationToken);
    }
}
