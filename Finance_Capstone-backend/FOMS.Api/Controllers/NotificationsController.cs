using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using FOMS.Application.Features;

namespace FOMS.Api.Controllers;

public class NotificationsController : ApiControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetNotifications()
    {
        var notifications = await Mediator.Send(new NotificationFeatures.GetNotificationsQuery());
        return Ok(notifications);
    }

    [HttpPut("{id}/read")]
    public async Task<IActionResult> MarkRead(string id)
    {
        var result = await Mediator.Send(new NotificationFeatures.MarkNotificationReadCommand(id));
        if (!result) return NotFound();
        return Ok(new { success = true });
    }
}
