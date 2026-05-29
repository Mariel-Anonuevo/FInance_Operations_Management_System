using FOMS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FOMS.Tests;

public class SeededAccountsTests
{
    [Fact]
    public async Task SeedSampleData_ShouldCreateTheDemoAdminAccount()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        await using var context = new ApplicationDbContext(options);

        await ApplicationDbContextSeed.SeedSampleDataAsync(context);

        var employee = await context.Employees.SingleOrDefaultAsync(e => e.Id == "EMP-001");

        Assert.NotNull(employee);
        Assert.Equal("password123", employee!.PasswordHash);
        Assert.Equal("ADMIN", employee.Role);
    }
}
