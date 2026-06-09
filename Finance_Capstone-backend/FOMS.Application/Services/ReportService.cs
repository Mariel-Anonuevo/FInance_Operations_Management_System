using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using FOMS.Application.DTOs;
using FOMS.Application.Interfaces;

namespace FOMS.Application.Services;

public class ReportService : IReportService
{
    private readonly IApplicationDbContext _context;

    public ReportService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<AccountsReceivableReportDto>> GetAccountsReceivableAsync()
    {
        return await _context.ReceivableBalances
            .AsNoTracking()
            .Select(r => new AccountsReceivableReportDto
            {
                ClientName = r.ClientAccount != null ? r.ClientAccount.Name : string.Empty,
                Balance = r.BalanceAmount,
                DaysPastDue = Math.Max(0, (int)(DateTime.UtcNow - r.DueDate).TotalDays)
            })
            .ToListAsync();
    }

    public async Task<CollectionSummaryReportDto> GetCollectionSummaryAsync()
    {
        var total = await _context.PaymentCollections.SumAsync(c => c.AmountCollected);
        var count = await _context.PaymentCollections.CountAsync();
        return new CollectionSummaryReportDto
        {
            TotalCollected = total,
            Transactions = count
        };
    }

    public async Task<IEnumerable<AgingReportDto>> GetAgingAsync()
    {
        return await _context.AgingAccounts
            .AsNoTracking()
            .Select(a => new AgingReportDto
            {
                ClientName = a.ClientAccount != null ? a.ClientAccount.Name : string.Empty,
                Amount = a.CurrentAmount,
                DaysOutstanding = a.DaysPastDue
            })
            .ToListAsync();
    }

    public async Task<FinancialStatementsReportDto> GetFinancialStatementsAsync()
    {
        var assets = await _context.BankBalances.SumAsync(b => b.CurrentBalance) + await _context.CashFlowEntries.Where(e => e.Type == "Inflow").SumAsync(e => e.Amount);
        var liabilities = await _context.Payments.SumAsync(p => p.Amount);
        var equity = assets - liabilities;
        return new FinancialStatementsReportDto
        {
            TotalAssets = assets,
            TotalLiabilities = liabilities,
            TotalEquity = equity
        };
    }

    public async Task<IEnumerable<GeneralLedgerReportDto>> GetGeneralLedgerAsync()
    {
        return await _context.GeneralLedgerEntries
            .AsNoTracking()
            .Select(g => new GeneralLedgerReportDto
            {
                AccountName = g.Account != null ? g.Account.Name : g.AccountId,
                Debit = g.Debit,
                Credit = g.Credit
            })
            .ToListAsync();
    }

    public async Task<IEnumerable<TrialBalanceReportDto>> GetTrialBalanceAsync()
    {
        return await _context.TrialBalances
            .AsNoTracking()
            .Select(t => new TrialBalanceReportDto
            {
                TotalDebits = t.TotalDebits,
                TotalCredits = t.TotalCredits
            })
            .ToListAsync();
    }

    public async Task<IEnumerable<PayrollReportDto>> GetPayrollReportAsync()
    {
        return await _context.PayrollRecords
            .Include(p => p.Employee)
            .AsNoTracking()
            .Select(p => new PayrollReportDto
            {
                EmployeeName = p.Employee != null ? p.Employee.Name : p.EmployeeId,
                NetPay = p.NetPay
            })
            .ToListAsync();
    }

    public Task<ExportResultDto> ExportPdfAsync(string reportType)
    {
        var content = new StringBuilder();
        content.AppendLine($"Report: {reportType}");
        content.AppendLine($"GeneratedAt: {DateTime.UtcNow:O}");
        content.AppendLine("This PDF export is generated as a text-based sample.");
        return Task.FromResult(new ExportResultDto
        {
            FileName = $"{reportType.Replace(" ", "_")}.pdf",
            FileContentBase64 = Convert.ToBase64String(Encoding.UTF8.GetBytes(content.ToString()))
        });
    }

    public Task<ExportResultDto> ExportExcelAsync(string reportType)
    {
        var content = new StringBuilder();
        content.AppendLine("Type,Value");
        content.AppendLine($"Report,{reportType}");
        content.AppendLine($"GeneratedAt,{DateTime.UtcNow:O}");
        return Task.FromResult(new ExportResultDto
        {
            FileName = $"{reportType.Replace(" ", "_")}.xlsx",
            FileContentBase64 = Convert.ToBase64String(Encoding.UTF8.GetBytes(content.ToString()))
        });
    }
}
