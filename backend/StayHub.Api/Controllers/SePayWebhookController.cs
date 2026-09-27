using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using StayHub.Infrastructure.Adapters;

namespace StayHub.Api.Controllers;

[ApiController]
[Route("api/sepay")]
public class SePayWebhookController : ControllerBase
{
    private readonly ISePayAdapter _sePayAdapter;

    public SePayWebhookController(ISePayAdapter sePayAdapter)
    {
        _sePayAdapter = sePayAdapter;
    }

    [HttpPost("webhook")]
    public async Task<IActionResult> HandleWebhook([FromBody] SePayWebhookDto payload)
    {
        // SePay sends authorization header in format: "Apikey <your_api_key>"
        var authHeader = Request.Headers["Authorization"].ToString();

        var (success, message, paymentId) = await _sePayAdapter.ProcessWebhookAsync(payload, authHeader);

        if (!success)
        {
            // If signature invalid, return 401 Unauthorized
            if (message.Contains("không hợp lệ"))
            {
                return Unauthorized(new { success = false, message });
            }

            // Other business issues (e.g. unmatched reference) return 200 with error note as recommended by gateway docs
            return Ok(new { success = false, message });
        }

        return Ok(new
        {
            success = true,
            message,
            paymentId
        });
    }
}
