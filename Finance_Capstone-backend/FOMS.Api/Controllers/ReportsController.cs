using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FOMS.Application.Interfaces;

namespace FOMS.Api.Controllers;

[Authorize]
[Route("api/reports")]
[ApiController]
public class ReportsController : ControllerBase
{
    private readonly IReportService _reportService;

    public ReportsController(IReportService reportService)
    {
        _reportService = reportService;
    }

    [HttpGet("accounts-receivable")]
    public async Task<IActionResult> AccountsReceivable() => Ok(await _reportService.GetAccountsReceivableAsync());

    [HttpGet("collection-summary")]
    public async Task<IActionResult> CollectionSummary() => Ok(await _reportService.GetCollectionSummaryAsync());

    [HttpGet("aging")]
    public async Task<IActionResult> Aging() => Ok(await _reportService.GetAgingAsync());

    [HttpGet("financial-statements")]
    public async Task<IActionResult> FinancialStatements() => Ok(await _reportService.GetFinancialStatementsAsync());

    [HttpGet("general-ledger")]
    public async Task<IActionResult> GeneralLedger() => Ok(await _reportService.GetGeneralLedgerAsync());

    [HttpGet("trial-balance")]
    public async Task<IActionResult> TrialBalance() => Ok(await _reportService.GetTrialBalanceAsync());

    [HttpGet("payroll")]
    public async Task<IActionResult> Payroll() => Ok(await _reportService.GetPayrollReportAsync());

    [HttpGet("export/pdf")]
    public async Task<IActionResult> ExportPdf([FromQuery] string reportType)
    {
        var export = await _reportService.ExportPdfAsync(reportType ?? "report");
        return Ok(export);
    }

    [HttpGet("export/excel")]
    public async Task<IActionResult> ExportExcel([FromQuery] string reportType)
    {
        var export = await _reportService.ExportExcelAsync(reportType ?? "report");
        return Ok(export);
    }
}
