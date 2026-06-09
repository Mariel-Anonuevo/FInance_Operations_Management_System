using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using FOMS.Application.Features;

namespace FOMS.Api.Controllers;

public class AuthController : ApiControllerBase
{
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] AuthFeatures.LoginCommand command)
    {
        var employee = await Mediator.Send(command);
        if (employee == null)
        {
            return Unauthorized(new { message = "Invalid Employee ID or password." });
        }
        return Ok(employee);
    }
}
