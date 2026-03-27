using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Hero.Integration.CoreApi.Interfaces;

namespace Hero.Controllers
{
    using Hero.Models;

    [Route("[controller]/[action]")]
    public class CfcContactPersonalMessageController : Controller
    {
        private readonly ICfcContactPersonalMessageApi _cfcContactPersonalMessageApi;

        public CfcContactPersonalMessageController(ICfcContactPersonalMessageApi cfcContactPersonalMessageApi)
        {
            _cfcContactPersonalMessageApi = cfcContactPersonalMessageApi;
        }

        [HttpGet]
        public async Task<IActionResult> GetPersonalMessageById(int cfcContactId)
        {
            var personalMessage = await _cfcContactPersonalMessageApi.GetPersonalMessageById(cfcContactId);

            return Ok(personalMessage);
        }

        [HttpPost]
        public async Task<IActionResult> SetPersonalMessage([FromBody]CfcContactPersonalMessageChangeRequest
            request)
        {
            var personalMessage = await _cfcContactPersonalMessageApi.SetPersonalMessage(request).ConfigureAwait(false);
            return Ok(personalMessage);
        }
    }
}