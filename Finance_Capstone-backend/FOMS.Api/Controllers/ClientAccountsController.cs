using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FOMS.Application.Interfaces;
using FOMS.Domain.Entities;

namespace FOMS.Api.Controllers;

[Authorize]
[Route("api/client-accounts")]
[ApiController]
public class ClientAccountsController : ControllerBase
{
    private readonly IRepository<ClientAccount> _repository;
    private readonly IApplicationDbContext _context;

    public ClientAccountsController(IRepository<ClientAccount> repository, IApplicationDbContext context)
    {
        _repository = repository;
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var items = await _repository.GetAllAsync();
        return Ok(items);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var item = await _repository.GetByIdAsync(id);
        return item == null ? NotFound() : Ok(item);
    }

    [Authorize(Roles = "Bookkeeper,Accountant")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ClientAccount request)
    {
        await _repository.AddAsync(request);
        await _context.SaveChangesAsync(default);
        return CreatedAtAction(nameof(GetById), new { id = request.Id }, request);
    }

    [Authorize(Roles = "Bookkeeper,Accountant")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] ClientAccount request)
    {
        var existing = await _repository.GetByIdAsync(id);
        if (existing == null) return NotFound();

        existing.Name = request.Name;
        existing.BusinessName = request.BusinessName;
        existing.ContactPerson = request.ContactPerson;
        existing.Email = request.Email;
        existing.PhoneNumber = request.PhoneNumber;
        existing.Address = request.Address;
        existing.Status = request.Status;
        existing.CreditLimit = request.CreditLimit;
        existing.CurrentBalance = request.CurrentBalance;

        _context.ClientAccounts.Update(existing);
        await _context.SaveChangesAsync(default);
        return Ok(existing);
    }

    [Authorize(Roles = "Accountant")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var existing = await _repository.GetByIdAsync(id);
        if (existing == null) return NotFound();

        _repository.Delete(existing);
        await _context.SaveChangesAsync(default);
        return NoContent();
    }
}
