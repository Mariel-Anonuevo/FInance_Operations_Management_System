using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FOMS.Application.Interfaces;
using FOMS.Domain.Entities;

namespace FOMS.Api.Controllers;

[Authorize]
[Route("api/receivables")]
[ApiController]
public class ReceivablesController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public ReceivablesController(IApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetReceivables()
    {
        var receivables = await _context.ReceivableBalances.ToListAsync();
        return Ok(receivables);
    }

    [HttpGet("aging-accounts")]
    public async Task<IActionResult> GetAgingAccounts()
    {
        var aging = await _context.AgingAccounts.ToListAsync();
        return Ok(aging);
    }

    [HttpGet("overdue-accounts")]
    public async Task<IActionResult> GetOverdueAccounts()
    {
        var overdue = await _context.AgingAccounts.Where(a => a.DaysPastDue > 0).ToListAsync();
        return Ok(overdue);
    }

    [Authorize(Roles = "Accountant")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ReceivableBalance request)
    {
        await _context.ReceivableBalances.AddAsync(request);
        await _context.SaveChangesAsync(default);
        return CreatedAtAction(nameof(GetReceivables), new { id = request.Id }, request);
    }
}
