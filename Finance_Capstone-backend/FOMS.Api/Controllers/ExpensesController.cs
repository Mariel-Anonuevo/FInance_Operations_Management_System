using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using FOMS.Application.Features;

namespace FOMS.Api.Controllers;

public class ExpensesController : ApiControllerBase
{
    [HttpGet("transportation")]
    public async Task<IActionResult> GetExpenses()
    {
        var list = await Mediator.Send(new ExpenseFeatures.GetExpensesQuery());
        return Ok(list);
    }

    [HttpPost("transportation")]
    public async Task<IActionResult> Record([FromBody] ExpenseFeatures.RecordExpenseCommand command)
    {
        var expense = await Mediator.Send(command);
        return Ok(expense);
    }
}
