using Hero.Integration.CreatePolicyMtaApi;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace Hero.Controllers
{
    [ApiController]
    [Route("api/policy/{policyNumber}/mta/{mtaId}/email-template")]
    public class MtaEmailTemplateController : Controller
    {
        private readonly IEmailTemplateClient _emailTemplateClient;

        public MtaEmailTemplateController(IEmailTemplateClient emailTemplateClient)
        {
            _emailTemplateClient = emailTemplateClient;
        }

        [HttpGet]
        public async Task<IActionResult> Get(string policyNumber, Guid mtaId)
        {
            var template = await _emailTemplateClient.GetOldAsync(policyNumber, mtaId);
            return Ok(template);
        }
    }
}
