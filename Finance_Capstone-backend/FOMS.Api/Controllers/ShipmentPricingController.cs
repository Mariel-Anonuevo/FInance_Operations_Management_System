using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using FOMS.Application.Features;

namespace FOMS.Api.Controllers;

public class ShipmentPricingController : ApiControllerBase
{
    [HttpGet("rates")]
    public async Task<IActionResult> GetRates()
    {
        var rates = await Mediator.Send(new ShipmentPricingFeatures.GetRatesQuery());
        return Ok(rates);
    }

    [HttpPost("compute")]
    public async Task<IActionResult> Compute([FromBody] ShipmentPricingFeatures.ComputePriceCommand command)
    {
        var result = await Mediator.Send(command);
        return Ok(result);
    }
}
