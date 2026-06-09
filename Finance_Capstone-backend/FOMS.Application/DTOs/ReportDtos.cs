namespace FOMS.Application.DTOs;

public class AccountsReceivableReportDto
{
    public string ClientName { get; set; } = string.Empty;
    public decimal Balance { get; set; }
    public int DaysPastDue { get; set; }
}

public class CollectionSummaryReportDto
{
    public decimal TotalCollected { get; set; }
    public int Transactions { get; set; }
}

public class AgingReportDto
{
    public string ClientName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public int DaysOutstanding { get; set; }
}

public class FinancialStatementsReportDto
{
    public decimal TotalAssets { get; set; }
    public decimal TotalLiabilities { get; set; }
    public decimal TotalEquity { get; set; }
}

public class GeneralLedgerReportDto
{
    public string AccountName { get; set; } = string.Empty;
    public decimal Debit { get; set; }
    public decimal Credit { get; set; }
}

public class TrialBalanceReportDto
{
    public decimal TotalDebits { get; set; }
    public decimal TotalCredits { get; set; }
}

public class PayrollReportDto
{
    public string EmployeeName { get; set; } = string.Empty;
    public decimal NetPay { get; set; }
}

public class ExportResultDto
{
    public string FileName { get; set; } = string.Empty;
    public string FileContentBase64 { get; set; } = string.Empty;
}
