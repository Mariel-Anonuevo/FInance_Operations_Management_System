using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using FOMS.Application.Features;

namespace FOMS.Api.Controllers;

public class CashFlowController : ApiControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetCashFlow()
    {
        var entries = await Mediator.Send(new CashFlowFeatures.GetCashFlowQuery());
        return Ok(entries);
    }

    [HttpGet("balances")]
    public async Task<IActionResult> GetBankBalances()
    {
        var balances = await Mediator.Send(new CashFlowFeatures.GetBankBalancesQuery());
        return Ok(balances);
    }

    [HttpPost]
    public async Task<IActionResult> AddEntry([FromBody] CashFlowFeatures.AddCashFlowCommand command)
    {
        var entry = await Mediator.Send(command);
        return Ok(entry);
    }
}
