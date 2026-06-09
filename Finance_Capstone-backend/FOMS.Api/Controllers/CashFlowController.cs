using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FOMS.Application.Interfaces;
using FOMS.Domain.Entities;

namespace FOMS.Api.Controllers;

[Authorize]
[Route("api/cash-flow")]
[ApiController]
public class CashFlowController : ControllerBase
{
    private readonly IRepository<CashFlowTransaction> _repository;
    private readonly IApplicationDbContext _context;

    public CashFlowController(IRepository<CashFlowTransaction> repository, IApplicationDbContext context)
    {
        _repository = repository;
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _repository.GetAllAsync());

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var inflow = await _context.CashFlowTransactions.Where(t => t.Type == "Inflow").SumAsync(t => t.Amount);
        var outflow = await _context.CashFlowTransactions.Where(t => t.Type == "Outflow").SumAsync(t => t.Amount);
        return Ok(new { Inflow = inflow, Outflow = outflow });
    }

    [Authorize(Roles = "Accountant")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CashFlowTransaction request)
    {
        await _repository.AddAsync(request);
        await _context.SaveChangesAsync(default);
        return CreatedAtAction(nameof(GetAll), new { id = request.Id }, request);
    }
}
