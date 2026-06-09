using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using FOMS.Application.Features;

namespace FOMS.Api.Controllers;

public class SpeedPayController : ApiControllerBase
{
    [HttpPost("process")]
    public async Task<IActionResult> Process([FromBody] SpeedPayFeatures.ProcessDigitalPaymentCommand command)
    {
        var result = await Mediator.Send(command);
        if (result == null) return NotFound(new { message = "Invoice not found." });
        return Ok(result);
    }
}
