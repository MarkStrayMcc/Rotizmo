using System.Threading.Tasks;
using Hero.Integration.CoreApi.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Hero.Controllers
{
    public class EmailContactController : Controller
    {
        private readonly IEmailContactApi _emailContactApi;

        public EmailContactController(IEmailContactApi emailContactApi)
        {
            _emailContactApi = emailContactApi;
        }
        
        [HttpGet("email-contacts")]
        public async Task<IActionResult> GetEmailContacts()
        {
            return Ok(await _emailContactApi.GetEmailContacts());
        }
    }
}
