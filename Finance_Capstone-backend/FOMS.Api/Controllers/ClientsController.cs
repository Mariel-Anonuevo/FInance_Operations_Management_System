using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using FOMS.Application.Features;

namespace FOMS.Api.Controllers;

public class ClientsController : ApiControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetClients()
    {
        var clients = await Mediator.Send(new ClientFeatures.GetClientsQuery());
        return Ok(clients);
    }

    [HttpPost]
    public async Task<IActionResult> CreateClient([FromBody] ClientFeatures.CreateClientCommand command)
    {
        var client = await Mediator.Send(command);
        return Ok(client);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteClient(string id)
    {
        var result = await Mediator.Send(new ClientFeatures.DeleteClientCommand(id));
        if (!result) return NotFound();
        return Ok(new { success = true });
    }
}
