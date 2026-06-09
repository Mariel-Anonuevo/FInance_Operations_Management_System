using System.Collections.Generic;
using System.Threading.Tasks;
using FOMS.Application.DTOs;

namespace FOMS.Application.Interfaces;

public interface IReportService
{
    Task<IEnumerable<AccountsReceivableReportDto>> GetAccountsReceivableAsync();
    Task<CollectionSummaryReportDto> GetCollectionSummaryAsync();
    Task<IEnumerable<AgingReportDto>> GetAgingAsync();
    Task<FinancialStatementsReportDto> GetFinancialStatementsAsync();
    Task<IEnumerable<GeneralLedgerReportDto>> GetGeneralLedgerAsync();
    Task<IEnumerable<TrialBalanceReportDto>> GetTrialBalanceAsync();
    Task<IEnumerable<PayrollReportDto>> GetPayrollReportAsync();
    Task<ExportResultDto> ExportPdfAsync(string reportType);
    Task<ExportResultDto> ExportExcelAsync(string reportType);
}
