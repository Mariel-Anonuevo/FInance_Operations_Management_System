using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using FOMS.Application.Features;
using FOMS.Domain.Entities;
using FOMS.Infrastructure.Persistence;
using Xunit;

namespace FOMS.Tests;

public class FeatureVerificationTests
{
    private async Task<ApplicationDbContext> GetDbContextAsync()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        var context = new ApplicationDbContext(options);
        await ApplicationDbContextSeed.SeedSampleDataAsync(context);
        return context;
    }

    [Fact]
    public async Task PB09_MonitorCashFlow_ShouldAddAndRetrieveCashFlowEntriesSuccessfully()
    {
        // Arrange
        using var context = await GetDbContextAsync();
        var handler = new CashFlowFeatures.AddCashFlowCommandHandler(context);
        var queryHandler = new CashFlowFeatures.GetCashFlowQueryHandler(context);

        // Act
        var command = new CashFlowFeatures.AddCashFlowCommand(
            Type: "Inflow",
            Category: "Collection",
            Amount: 15000.50m,
            ReferenceNo: "OR-2026-TEST",
            Description: "Payment for test services"
        );

        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Inflow", result.Type);
        Assert.Equal("Collection", result.Category);
        Assert.Equal(15000.50m, result.Amount);
        Assert.Equal("OR-2026-TEST", result.ReferenceNo);

        var entries = await queryHandler.Handle(new CashFlowFeatures.GetCashFlowQuery(), CancellationToken.None);
        var addedEntry = entries.FirstOrDefault(e => e.ReferenceNo == "OR-2026-TEST");
        Assert.NotNull(addedEntry);
    }

    [Fact]
    public async Task PB10_RecordTransportationExpenses_ShouldLogExpenseAndOutflowSuccessfully()
    {
        // Arrange
        using var context = await GetDbContextAsync();
        var handler = new ExpenseFeatures.RecordExpenseCommandHandler(context);
        var queryHandler = new ExpenseFeatures.GetExpensesQueryHandler(context);

        // Act
        var command = new ExpenseFeatures.RecordExpenseCommand(
            PlateNumber: "XYZ-1234",
            DriverName: "Test Driver",
            ExpenseType: "Fuel",
            Amount: 3500.00m,
            Description: "Diesel fuel refill at Petron"
        );

        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("XYZ-1234", result.PlateNumber);
        Assert.Equal("Test Driver", result.DriverName);
        Assert.Equal("Fuel", result.ExpenseType);
        Assert.Equal(3500.00m, result.Amount);

        // Verify that it logged a corresponding CashFlow Outflow entry
        var cashFlowEntries = await context.CashFlowEntries
            .Where(e => e.Type == "Outflow" && e.Category == "Fuel" && e.Amount == 3500.00m)
            .ToListAsync();
        
        Assert.NotEmpty(cashFlowEntries);
        Assert.Contains("Fleet expense for XYZ-1234", cashFlowEntries.First().Description);
    }

    [Fact]
    public async Task PB11_ValidateDeliveryPayments_ShouldReconcileAndCreatePaymentOnApproval()
    {
        // Arrange
        using var context = await GetDbContextAsync();
        
        // Seed a test invoice
        var invoice = new Invoice
        {
            Id = "INV-TEST-COD",
            InvoiceNo = "INV-TEST-COD",
            ClientId = "CL-001",
            ClientName = "Lazada Philippines",
            TotalAmount = 50000.00m,
            AmountPaid = 0m,
            Balance = 50000.00m,
            PaymentStatus = "Unpaid",
            DueDate = DateTime.UtcNow.AddDays(30).ToString("yyyy-MM-dd")
        };
        context.Invoices.Add(invoice);
        await context.SaveChangesAsync();

        var submitHandler = new ValidationFeatures.SubmitValidationCommandHandler(context);
        var verifyHandler = new ValidationFeatures.VerifyValidationCommandHandler(context);

        // Act - Submit COD driver claim
        var submitCmd = new ValidationFeatures.SubmitValidationCommand(
            InvoiceNo: "INV-TEST-COD",
            ClientName: "Lazada Philippines",
            DriverName: "COD Rider 1",
            AmountCollected: 50000.00m
        );
        var val = await submitHandler.Handle(submitCmd, CancellationToken.None);

        // Assert Submitted status
        Assert.NotNull(val);
        Assert.Equal("Pending", val.Status);
        Assert.Equal(50000.00m, val.AmountCollected);

        // Act - Verify / Approve the COD claim
        var verifyCmd = new ValidationFeatures.VerifyValidationCommand(
            Id: val.Id,
            Status: "Approved"
        );
        var success = await verifyHandler.Handle(verifyCmd, CancellationToken.None);

        // Assert Approved status changes invoice to Paid and registers payment
        Assert.True(success);
        
        var updatedVal = await context.PaymentValidations.FindAsync(val.Id);
        Assert.Equal("Approved", updatedVal!.Status);

        var updatedInvoice = await context.Invoices.FindAsync("INV-TEST-COD");
        Assert.Equal(50000.00m, updatedInvoice!.AmountPaid);
        Assert.Equal(0m, updatedInvoice.Balance);
        Assert.Equal("Paid", updatedInvoice.PaymentStatus);

        var registeredPayment = await context.Payments.FirstOrDefaultAsync(p => p.InvoiceNo == "INV-TEST-COD");
        Assert.NotNull(registeredPayment);
        Assert.Equal(50000.00m, registeredPayment!.Amount);
        Assert.Equal("Cash", registeredPayment.PaymentMethod);
        Assert.Contains("COD collection validation approved", registeredPayment.Remarks);
    }
}
