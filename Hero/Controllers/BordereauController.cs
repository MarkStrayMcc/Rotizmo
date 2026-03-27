using Hero.Integration.CoreApi.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Hero.Controllers
{
    public class BordereauController : Controller
    {
        private readonly IBordereauAPI _bordereauAPI;

        public BordereauController(IBordereauAPI bordereauAPI) =>
            this._bordereauAPI = bordereauAPI;

        /// <summary>
        /// Get Bordereau close date
        /// </summary>        
        /// <returns>Datetime</returns>
        [HttpGet]
        [Route("[controller]/date-closed")]
        public async Task<IActionResult> RetrieveBordereauCloseDate()
        {
            var dateClosed = await _bordereauAPI.GetBordereauCloseDate();
            return Ok(dateClosed);
        }

        /// <summary>
        /// Validate received date
        /// </summary>
        /// <returns>boolean</returns>
        [HttpGet]
        [Route("[controller]/is-received-date-valid")]
        public async Task<IActionResult> IsReceivedDateValid(string receivedDate)
        {
            var result = await _bordereauAPI.IsReceivedDateValid(receivedDate);
            return Ok(result);
        }
    }
}