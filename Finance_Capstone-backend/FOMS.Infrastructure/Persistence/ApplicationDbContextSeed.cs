using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using FOMS.Domain.Entities;

namespace FOMS.Infrastructure.Persistence;

public static class ApplicationDbContextSeed
{
    public static async Task SeedSampleDataAsync(ApplicationDbContext context)
    {
        // 1. Seed Employees
        var demoEmployees = new List<Employee>
        {
            new Employee
            {
                Id = "EMP-001",
                Name = "Crystalyn Joyce C. Fajardo",
                Role = "Accountant",
                SystemAccess = "Finance Operation Service",
                Status = "Active",
                Username = "EMP-001",
                PasswordHash = "password123"
            },
            new Employee
            {
                Id = "EMP-002",
                Name = "Conag, Reca M.",
                Role = "Bookkeeper",
                SystemAccess = "Finance Operation Service",
                Status = "Active",
                Username = "EMP-002",
                PasswordHash = "password123"
            },
            new Employee
            {
                Id = "EMP-003",
                Name = "David Jr. M. Gabriel",
                Role = "Payroll Officer",
                SystemAccess = "Finance Operation Service",
                Status = "Active",
                Username = "EMP-003",
                PasswordHash = "password123"
            }
        };

        foreach (var demoEmployee in demoEmployees)
        {
            var existingEmployee = await context.Employees.FirstOrDefaultAsync(e => e.Id == demoEmployee.Id);
            if (existingEmployee != null)
            {
                existingEmployee.Name = demoEmployee.Name;
                existingEmployee.Role = demoEmployee.Role;
                existingEmployee.SystemAccess = demoEmployee.SystemAccess;
                existingEmployee.Status = demoEmployee.Status;
                existingEmployee.Username = demoEmployee.Username;
                existingEmployee.PasswordHash = demoEmployee.PasswordHash;
            }
            else
            {
                context.Employees.Add(demoEmployee);
            }
        }

        // Delete any employees not in the seed list to keep it clean
        var seedIds = demoEmployees.Select(e => e.Id).ToList();
        var extraEmployees = await context.Employees.Where(e => !seedIds.Contains(e.Id)).ToListAsync();
        if (extraEmployees.Any())
        {
            context.Employees.RemoveRange(extraEmployees);
        }

        await context.SaveChangesAsync();


        // 2. Seed Clients
        if (!await context.Clients.AnyAsync())
        {
            var clientList = new List<Client>
            {
                new Client { Id = "CL-001", ClientCode = "LZD-001", Name = "Lazada Philippines", BusinessName = "Lazada E-Services Philippines, Inc.", ContactPerson = "Maria Dela Cruz", ContactNumber = "0917-123-4567", Email = "finance@lazada.com.ph", Address = "Rockwell Dr., Brgy. Poblacion, Makati City", Tin = "123-456-789-000", CreditLimit = 500000, Status = "Active", DateRegistered = "2024-11-26", LastTransaction = "2026-05-18", CurrentBalance = 85300, TotalBilled = 124200, TotalPaid = 38900 },
                new Client { Id = "CL-002", ClientCode = "SHP-002", Name = "Shopee Express", BusinessName = "Shopee Xpress PH, Inc.", ContactPerson = "Jose Santos", ContactNumber = "0917-555-9876", Email = "ap@shopee.ph", Address = "Ayala Ave., Makati City", Tin = "987-654-321-000", CreditLimit = 450000, Status = "Active", DateRegistered = "2024-12-26", LastTransaction = "2026-05-19", CurrentBalance = 52500, TotalBilled = 86200, TotalPaid = 33700 },
                new Client { Id = "CL-003", ClientCode = "TTS-003", Name = "TikTok Shop", BusinessName = "TikTok Shop Philippines, Inc.", ContactPerson = "Robert Lim", ContactNumber = "0917-333-4444", Email = "billing@tiktok.ph", Address = "BGC High St., Taguig City", Tin = "321-654-987-000", CreditLimit = 300000, Status = "Active", DateRegistered = "2025-01-25", LastTransaction = "2026-05-12", CurrentBalance = 36350, TotalBilled = 56350, TotalPaid = 20000 },
                new Client { Id = "CL-004", ClientCode = "SM-004", Name = "SM Supermalls", BusinessName = "SM Prime Holdings, Inc.", ContactPerson = "Ella Garcia", ContactNumber = "0922-777-8888", Email = "payables@sm.com.ph", Address = "Mall of Asia Complex, Pasay City", Tin = "111-222-333-000", CreditLimit = 800000, Status = "Active", DateRegistered = "2024-05-30", LastTransaction = "2026-05-17", CurrentBalance = 52600, TotalBilled = 210307.6m, TotalPaid = 157707.6m },
                new Client { Id = "CL-005", ClientCode = "JNT-005", Name = "J&T Express", BusinessName = "J&T Express Philippines, Corp.", ContactPerson = "Benjamin Cruz", ContactNumber = "0923-444-5555", Email = "finance@jtexpress.ph", Address = "Batangas St., Pasig City", Tin = "222-333-444-000", CreditLimit = 250000, Status = "Active", DateRegistered = "2025-05-25", LastTransaction = "2026-05-08", CurrentBalance = 10400, TotalBilled = 20400, TotalPaid = 10000 },
                new Client { Id = "CL-006", ClientCode = "JOL-006", Name = "Jollibee Foods Corp.", BusinessName = "Jollibee Foods Corporation", ContactPerson = "Cecilia Ocampo", ContactNumber = "0918-555-1234", Email = "ap@jollibee.com.ph", Address = "Ortigas Center, Pasig City", Tin = "333-444-555-000", CreditLimit = 600000, Status = "Active", DateRegistered = "2024-09-27", LastTransaction = "2026-04-20", CurrentBalance = 28400, TotalBilled = 91568, TotalPaid = 63168 },
                new Client { Id = "CL-007", ClientCode = "PLD-007", Name = "PLDT Inc.", BusinessName = "Philippine Long Distance Telephone Co.", ContactPerson = "Anna Reyes", ContactNumber = "0925-888-9999", Email = "vendor@pldt.com.ph", Address = "Ramon Cojuangco Bldg., Makati City", Tin = "444-555-666-000", CreditLimit = 750000, Status = "Active", DateRegistered = "2024-02-20", LastTransaction = "2026-04-08", CurrentBalance = 88300, TotalBilled = 88300, TotalPaid = 0 },
                new Client { Id = "CL-008", ClientCode = "GLB-008", Name = "Globe Telecom", BusinessName = "Globe Telecom, Inc.", ContactPerson = "Miguel Torres", ContactNumber = "0924-666-7777", Email = "accounts@globe.com.ph", Address = "Pioneer St., Mandaluyong City", Tin = "555-666-777-000", CreditLimit = 700000, Status = "Active", DateRegistered = "2024-04-01", LastTransaction = "2026-03-19", CurrentBalance = 85800, TotalBilled = 85800, TotalPaid = 0 },
                new Client { Id = "CL-009", ClientCode = "MET-009", Name = "Metro Retail Stores Group", BusinessName = "Metro Retail Stores Group, Inc.", ContactPerson = "Carla Mendoza", ContactNumber = "0926-111-2222", Email = "ap@metroretail.com.ph", Address = "Banawe St., Quezon City", Tin = "666-777-888-000", CreditLimit = 200000, Status = "Active", DateRegistered = "2025-07-25", LastTransaction = "2026-02-04", CurrentBalance = 34500, TotalBilled = 34500, TotalPaid = 0 },
                new Client { Id = "CL-010", ClientCode = "PNB-010", Name = "PNB Logistics", BusinessName = "PNB Logistics Solutions, Inc.", ContactPerson = "Henry Yulip", ContactNumber = "0927-222-3333", Email = "billing@pnblogistics.com", Address = "Roxas Blvd., Manila", Tin = "777-888-999-000", CreditLimit = 150000, Status = "Inactive", DateRegistered = "2023-11-30", LastTransaction = "2025-11-25", CurrentBalance = 14200, TotalBilled = 14200, TotalPaid = 0 }
            };
            context.Clients.AddRange(clientList);
            await context.SaveChangesAsync();
        }

        // 3. Seed Invoices
        if (!await context.Invoices.AnyAsync())
        {
            var invoiceList = new List<Invoice>
            {
                new Invoice { Id = "INV-2026-0001", InvoiceNo = "INV-2026-0001", ClientId = "CL-001", ClientName = "Lazada Philippines", BillingDate = "2026-05-15", DueDate = "2026-06-14", FreightCharges = 45000, OtherCharges = 2500, Subtotal = 47500, VatRate = 0.12, VatAmount = 5700, Surcharge = 0, TotalAmount = 53200, AmountPaid = 0, Balance = 53200, PaymentStatus = "Unpaid", AgingBucket = "Current", DaysOverdue = 0, Description = "March freight services — Metro Manila routes", EncodedBy = "Crystalyn Joyce C. Fajardo", DateEncoded = "2026-05-15", LastUpdated = "2026-05-15", UpdatedBy = "Crystalyn Joyce C. Fajardo", Archived = false },
                new Invoice { Id = "INV-2026-0002", InvoiceNo = "INV-2026-0002", ClientId = "CL-002", ClientName = "Shopee Express", BillingDate = "2026-05-12", DueDate = "2026-06-11", FreightCharges = 32500, OtherCharges = 1200, Subtotal = 33700, VatRate = 0.12, VatAmount = 0, Surcharge = 0, TotalAmount = 33700, AmountPaid = 33700, Balance = 0, PaymentStatus = "Paid", AgingBucket = "Current", DaysOverdue = 0, Description = "Last-mile delivery service charges", EncodedBy = "Crystalyn Joyce C. Fajardo", DateEncoded = "2026-05-12", LastUpdated = "2026-05-12", UpdatedBy = "Crystalyn Joyce C. Fajardo", Archived = false },
                new Invoice { Id = "INV-2026-0003", InvoiceNo = "INV-2026-0003", ClientId = "CL-003", ClientName = "TikTok Shop", BillingDate = "2026-05-08", DueDate = "2026-06-07", FreightCharges = 28750, OtherCharges = 800, Subtotal = 29550, VatRate = 0.12, VatAmount = 0, Surcharge = 0, TotalAmount = 29550, AmountPaid = 0, Balance = 29550, PaymentStatus = "Unpaid", AgingBucket = "Current", DaysOverdue = 0, Description = "BGC route freight charges", EncodedBy = "Crystalyn Joyce C. Fajardo", DateEncoded = "2026-05-08", LastUpdated = "2026-05-08", UpdatedBy = "Crystalyn Joyce C. Fajardo", Archived = false },
                new Invoice { Id = "INV-2026-0004", InvoiceNo = "INV-2026-0004", ClientId = "CL-004", ClientName = "SM Supermalls", BillingDate = "2026-05-05", DueDate = "2026-06-04", FreightCharges = 62000, OtherCharges = 3500, Subtotal = 65500, VatRate = 0.12, VatAmount = 7860, Surcharge = 0, TotalAmount = 73360, AmountPaid = 73360, Balance = 0, PaymentStatus = "Paid", AgingBucket = "Current", DaysOverdue = 0, Description = "Mall distribution freight — multiple branches", EncodedBy = "Crystalyn Joyce C. Fajardo", DateEncoded = "2026-05-05", LastUpdated = "2026-05-05", UpdatedBy = "Crystalyn Joyce C. Fajardo", Archived = false },
                new Invoice { Id = "INV-2026-0005", InvoiceNo = "INV-2026-0005", ClientId = "CL-005", ClientName = "J&T Express", BillingDate = "2026-05-02", DueDate = "2026-06-01", FreightCharges = 19800, OtherCharges = 600, Subtotal = 20400, VatRate = 0.12, VatAmount = 0, Surcharge = 0, TotalAmount = 20400, AmountPaid = 10000, Balance = 10400, PaymentStatus = "Partially Paid", AgingBucket = "Current", DaysOverdue = 0, Description = "Hub-to-hub freight services", EncodedBy = "Crystalyn Joyce C. Fajardo", DateEncoded = "2026-05-02", LastUpdated = "2026-05-02", UpdatedBy = "Crystalyn Joyce C. Fajardo", Archived = false },
                new Invoice { Id = "INV-2026-0006", InvoiceNo = "INV-2026-0006", ClientId = "CL-006", ClientName = "Jollibee Foods Corp.", BillingDate = "2026-04-28", DueDate = "2026-05-28", FreightCharges = 54300, OtherCharges = 2100, Subtotal = 56400, VatRate = 0.12, VatAmount = 6768, Surcharge = 0, TotalAmount = 63168, AmountPaid = 63168, Balance = 0, PaymentStatus = "Paid", AgingBucket = "Current", DaysOverdue = 0, Description = "Commissary route deliveries", EncodedBy = "Crystalyn Joyce C. Fajardo", DateEncoded = "2026-04-28", LastUpdated = "2026-04-28", UpdatedBy = "Crystalyn Joyce C. Fajardo", Archived = false }
            };
            context.Invoices.AddRange(invoiceList);
            await context.SaveChangesAsync();
        }

        // 4. Seed Payments
        if (!await context.Payments.AnyAsync())
        {
            var paymentList = new List<Payment>
            {
                new Payment { Id = "OR-2026-0001", OrNumber = "OR-2026-0001", InvoiceId = "INV-2026-0002", InvoiceNo = "INV-2026-0002", ClientId = "CL-002", ClientName = "Shopee Express", PaymentDate = "2026-05-19", Amount = 33700, PaymentMethod = "Bank Transfer", ReferenceNumber = "BPI-887211", RecordedBy = "Crystalyn Joyce C. Fajardo", DateRecorded = "2026-05-19" },
                new Payment { Id = "OR-2026-0002", OrNumber = "OR-2026-0002", InvoiceId = "INV-2026-0004", InvoiceNo = "INV-2026-0004", ClientId = "CL-004", ClientName = "SM Supermalls", PaymentDate = "2026-05-18", Amount = 73248.4m, PaymentMethod = "Check", ReferenceNumber = "CHK-449012", RecordedBy = "Crystalyn Joyce C. Fajardo", DateRecorded = "2026-05-18" },
                new Payment { Id = "OR-2026-0003", OrNumber = "OR-2026-0003", InvoiceId = "INV-2026-0005", InvoiceNo = "INV-2026-0005", ClientId = "CL-005", ClientName = "J&T Express", PaymentDate = "2026-05-17", Amount = 10000, PaymentMethod = "GCash", ReferenceNumber = "GC-2026-3451", Remarks = "Partial payment", RecordedBy = "Crystalyn Joyce C. Fajardo", DateRecorded = "2026-05-17" },
                new Payment { Id = "OR-2026-0004", OrNumber = "OR-2026-0004", InvoiceId = "INV-2026-0006", InvoiceNo = "INV-2026-0006", ClientId = "CL-006", ClientName = "Jollibee Foods Corp.", PaymentDate = "2026-05-16", Amount = 63168, PaymentMethod = "Bank Transfer", ReferenceNumber = "BDO-559002", RecordedBy = "Crystalyn Joyce C. Fajardo", DateRecorded = "2026-05-16" }
            };
            context.Payments.AddRange(paymentList);
            await context.SaveChangesAsync();
        }

        // 5. Seed Notifications
        if (!await context.Notifications.AnyAsync())
        {
            var notifList = new List<Notification>
            {
                new Notification { Id = "1", Type = "alert", Title = "Invoice Overdue", InvoiceNo = "INV-2026-0009", Description = "PLDT Inc. invoice is 2 days past due. Total balance: PHP 56,840.00. Coordinate collection.", Timestamp = "09:15 AM", Date = "May 20, 2026", Source = "Automated Alert", Read = false, StatusBadge = "Overdue" },
                new Notification { Id = "2", Type = "success", Title = "Payment Received", InvoiceNo = "INV-2026-0002", Description = "Shopee Express paid PHP 33,700.00 via Bank Transfer. OR-2026-0001 generated.", Timestamp = "08:42 AM", Date = "May 20, 2026", Source = "Crystalyn Joyce C. Fajardo", Read = false, StatusBadge = "Paid" },
                new Notification { Id = "3", Type = "info", Title = "Official Receipt Generated", InvoiceNo = "INV-2026-0004", Description = "OR-2026-0002 created for SM Supermalls. Amount: PHP 73,248.40.", Timestamp = "10:11 AM", Date = "May 19, 2026", Source = "Crystalyn Joyce C. Fajardo", Read = false, StatusBadge = "New" }
            };
            context.Notifications.AddRange(notifList);
            await context.SaveChangesAsync();
        }

        // 6. Seed Activity Logs
        if (!await context.ActivityLogs.AnyAsync())
        {
            var logList = new List<ActivityLog>
            {
                new ActivityLog { Id = "1", Timestamp = "May 20, 09:22 AM", UserName = "Crystalyn Joyce C. Fajardo", UserRole = "ADMIN", UserInitials = "CJ", UserColor = "#01B574", Action = "Create Invoice", Description = "Created new invoice INV-2026-0025 for SM Supermalls", Reference = "INV-2026-0025" },
                new ActivityLog { Id = "2", Timestamp = "May 20, 08:42 AM", UserName = "Crystalyn Joyce C. Fajardo", UserRole = "ADMIN", UserInitials = "CJ", UserColor = "#01B574", Action = "Record Payment", Description = "Recorded payment OR-2026-0001 from Shopee Express — PHP 33,700.00", Reference = "INV-2026-0002" },
                new ActivityLog { Id = "3", Timestamp = "May 19, 04:18 PM", UserName = "Crystalyn Joyce C. Fajardo", UserRole = "ADMIN", UserInitials = "CJ", UserColor = "#01B574", Action = "Record Payment", Description = "Recorded OR-2026-0002 from SM Supermalls — PHP 73,248.40", Reference = "INV-2026-0004" }
            };
            context.ActivityLogs.AddRange(logList);
            await context.SaveChangesAsync();
        }

        // 7. Seed Shipment Rates
        if (!await context.ShipmentRates.AnyAsync())
        {
            var rateList = new List<ShipmentRate>
            {
                new ShipmentRate { Id = "SR-001", Origin = "Manila", Destination = "Cebu", BaseFare = 150, RatePerKg = 12, RatePerCbm = 220, EstimatedDays = 3 },
                new ShipmentRate { Id = "SR-002", Origin = "Manila", Destination = "Davao", BaseFare = 200, RatePerKg = 16, RatePerCbm = 280, EstimatedDays = 4 },
                new ShipmentRate { Id = "SR-003", Origin = "Manila", Destination = "Iloilo", BaseFare = 160, RatePerKg = 13, RatePerCbm = 230, EstimatedDays = 3 },
                new ShipmentRate { Id = "SR-004", Origin = "Cebu", Destination = "Manila", BaseFare = 150, RatePerKg = 12, RatePerCbm = 220, EstimatedDays = 3 },
                new ShipmentRate { Id = "SR-005", Origin = "Davao", Destination = "Manila", BaseFare = 200, RatePerKg = 16, RatePerCbm = 280, EstimatedDays = 4 }
            };
            context.ShipmentRates.AddRange(rateList);
            await context.SaveChangesAsync();
        }

        // 8. Seed Bank Balances
        if (!await context.BankBalances.AnyAsync())
        {
            var bankList = new List<BankBalance>
            {
                new BankBalance { Id = "BB-001", BankName = "BDO Unibank", AccountNumber = "1090-XXXX-8821", CurrentBalance = 1245000.50m, LastReconciled = "2026-05-24" },
                new BankBalance { Id = "BB-002", BankName = "Bank of the Philippine Islands (BPI)", AccountNumber = "0012-XXXX-4490", CurrentBalance = 852400.25m, LastReconciled = "2026-05-24" },
                new BankBalance { Id = "BB-003", BankName = "UnionBank of the Philippines", AccountNumber = "1023-XXXX-1102", CurrentBalance = 340150.00m, LastReconciled = "2026-05-25" }
            };
            context.BankBalances.AddRange(bankList);
            await context.SaveChangesAsync();
        }

        // 9. Seed Cash Flow Entries
        if (!await context.CashFlowEntries.AnyAsync())
        {
            var flowList = new List<CashFlowEntry>
            {
                new CashFlowEntry { Id = "CF-001", Date = "2026-05-24", Type = "Inflow", Category = "Collection", Amount = 73248.40m, ReferenceNo = "OR-2026-0002", Description = "Inflow via BDO: payment from SM Supermalls" },
                new CashFlowEntry { Id = "CF-002", Date = "2026-05-24", Type = "Outflow", Category = "Fuel", Amount = 12500.00m, ReferenceNo = "EXP-982104", Description = "Outflow: Diesel fuel for truck plate NBC-8821" },
                new CashFlowEntry { Id = "CF-003", Date = "2026-05-25", Type = "Inflow", Category = "Collection", Amount = 33700.00m, ReferenceNo = "OR-2026-0001", Description = "Inflow via BPI: payment from Shopee Express" },
                new CashFlowEntry { Id = "CF-004", Date = "2026-05-25", Type = "Outflow", Category = "Maintenance", Amount = 4500.00m, ReferenceNo = "EXP-449011", Description = "Outflow: Oil change for delivery vehicle WEX-102" }
            };
            context.CashFlowEntries.AddRange(flowList);
            await context.SaveChangesAsync();
        }

        // 10. Seed Support Tickets
        if (!await context.SupportTickets.AnyAsync())
        {
            var ticketList = new List<SupportTicket>
            {
                new SupportTicket { Id = "TKT-001", ClientName = "Lazada Philippines", TicketSubject = "Freight Charge Discrepancy", Description = "Lazada claims the freight charge for INV-2026-0001 should be PHP 42,000 instead of PHP 45,000 based on standard rate agreement.", Status = "Open", DateCreated = "2026-05-22 10:15:00", LastUpdated = "2026-05-22 10:15:00" },
                new SupportTicket { Id = "TKT-002", ClientName = "SM Supermalls", TicketSubject = "Official Receipt Request", Description = "Requesting copy of official receipt for payment OR-2026-0002.", Status = "Resolved", DateCreated = "2026-05-23 09:30:00", LastUpdated = "2026-05-24 14:00:00" },
                new SupportTicket { Id = "TKT-003", ClientName = "PLDT Inc.", TicketSubject = "Billing Period Clarification", Description = "Requesting invoice billing coverage detail for period of April 15 - May 15.", Status = "In-Progress", DateCreated = "2026-05-24 11:45:00", LastUpdated = "2026-05-25 08:30:00" }
            };
            context.SupportTickets.AddRange(ticketList);
            await context.SaveChangesAsync();
        }

        // 11. Seed Payment Validations (COD logs)
        if (!await context.PaymentValidations.AnyAsync())
        {
            var validationList = new List<PaymentValidation>
            {
                new PaymentValidation { Id = "VAL-001", InvoiceNo = "INV-2026-0003", ClientName = "TikTok Shop", DriverName = "Juan Dela Cruz", AmountCollected = 29550m, Status = "Pending", DateSubmitted = "2026-05-25 17:30:00" },
                new PaymentValidation { Id = "VAL-002", InvoiceNo = "INV-2026-0005", ClientName = "J&T Express", DriverName = "Cardo Dalisay", AmountCollected = 10400m, Status = "Pending", DateSubmitted = "2026-05-25 18:00:00" }
            };
            context.PaymentValidations.AddRange(validationList);
            await context.SaveChangesAsync();
        }
    }
}
