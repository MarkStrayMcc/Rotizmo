using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Hero.Integration.CoreApi.Interfaces;

namespace Hero.Controllers
{
    public class CfcContactController : Controller
    {
        private readonly ICfcContactApi _cfcContactApi;

        public CfcContactController(ICfcContactApi cfcContactApi)
        {
            _cfcContactApi = cfcContactApi;
        }

        [HttpGet("[controller]/[action]")]
        public async Task<IActionResult> GetByInitials(string initials)
        {
            var contact = await _cfcContactApi.GetByInitialsAsync(initials);

            return Ok(contact);
        }

        [HttpGet("[controller]/[action]")]
        public async Task<IActionResult> GetByUsername(string email)
        {
            var username = email.Split("@").First();
            var contact = await _cfcContactApi.GetByUsernameAsync(username);

            return Ok(contact);
        }
    }
}