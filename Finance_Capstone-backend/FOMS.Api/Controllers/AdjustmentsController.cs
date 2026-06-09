using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using FOMS.Application.Features;

namespace FOMS.Api.Controllers;

public class AdjustmentsController : ApiControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAdjustments()
    {
        var list = await Mediator.Send(new AdjustmentFeatures.GetAdjustmentsQuery());
        return Ok(list);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] AdjustmentFeatures.CreateAdjustmentCommand command)
    {
        var result = await Mediator.Send(command);
        if (result == null) return NotFound(new { message = "Invoice not found." });
        return Ok(result);
    }
}
