using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using FOMS.Application.Features;

namespace FOMS.Api.Controllers;

public class PaymentsController : ApiControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetPayments()
    {
        var payments = await Mediator.Send(new PaymentFeatures.GetPaymentsQuery());
        return Ok(payments);
    }

    [HttpPost]
    public async Task<IActionResult> RecordPayment([FromBody] PaymentFeatures.RecordPaymentCommand command)
    {
        var payment = await Mediator.Send(command);
        return Ok(payment);
    }
}
