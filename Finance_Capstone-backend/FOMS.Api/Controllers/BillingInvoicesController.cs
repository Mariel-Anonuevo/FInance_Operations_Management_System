using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FOMS.Application.Interfaces;
using FOMS.Domain.Entities;

namespace FOMS.Api.Controllers;

[Authorize]
[Route("api/billing-invoices")]
[ApiController]
public class BillingInvoicesController : ControllerBase
{
    private readonly IRepository<BillingInvoice> _repository;
    private readonly IApplicationDbContext _context;

    public BillingInvoicesController(IRepository<BillingInvoice> repository, IApplicationDbContext context)
    {
        _repository = repository;
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _repository.GetAllAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var invoice = await _repository.GetByIdAsync(id);
        return invoice == null ? NotFound() : Ok(invoice);
    }

    [Authorize(Roles = "Accountant")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] BillingInvoice request)
    {
        await _repository.AddAsync(request);
        await _context.SaveChangesAsync(default);
        return CreatedAtAction(nameof(GetById), new { id = request.Id }, request);
    }

    [Authorize(Roles = "Accountant")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] BillingInvoice request)
    {
        var existing = await _repository.GetByIdAsync(id);
        if (existing == null) return NotFound();

        existing.InvoiceNumber = request.InvoiceNumber;
        existing.IssueDate = request.IssueDate;
        existing.DueDate = request.DueDate;
        existing.TotalAmount = request.TotalAmount;
        existing.AmountPaid = request.AmountPaid;
        existing.PaymentStatus = request.PaymentStatus;
        existing.Description = request.Description;

        _context.BillingInvoices.Update(existing);
        await _context.SaveChangesAsync(default);
        return Ok(existing);
    }

    [Authorize(Roles = "Accountant")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var invoice = await _repository.GetByIdAsync(id);
        if (invoice == null) return NotFound();

        _repository.Delete(invoice);
        await _context.SaveChangesAsync(default);
        return NoContent();
    }
}
