using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using FOMS.Application.Features;

namespace FOMS.Api.Controllers;

public class InvoicesController : ApiControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetInvoices()
    {
        var invoices = await Mediator.Send(new InvoiceFeatures.GetInvoicesQuery());
        return Ok(invoices);
    }

    [HttpPost]
    public async Task<IActionResult> CreateInvoice([FromBody] InvoiceFeatures.CreateInvoiceCommand command)
    {
        var invoice = await Mediator.Send(command);
        return Ok(invoice);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteInvoice(string id)
    {
        var result = await Mediator.Send(new InvoiceFeatures.DeleteInvoiceCommand(id));
        if (!result) return NotFound();
        return Ok(new { success = true });
    }

    public record ArchiveRequest(bool Archived);

    [HttpPut("{id}/archive")]
    public async Task<IActionResult> ArchiveInvoice(string id, [FromBody] ArchiveRequest request)
    {
        var result = await Mediator.Send(new InvoiceFeatures.ArchiveInvoiceCommand(id, request.Archived));
        if (!result) return NotFound();
        return Ok(new { success = true });
    }
}
