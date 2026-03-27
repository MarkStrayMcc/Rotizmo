using Hero.Integration.CoreApi.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using System.Web.Http;
using HttpGetAttribute = Microsoft.AspNetCore.Mvc.HttpGetAttribute;
using RouteAttribute = Microsoft.AspNetCore.Mvc.RouteAttribute;

namespace Hero.Controllers
{
    public class EnquiryController : Controller
    {
        private readonly IEnquiryApi _enquiryApi;

        public EnquiryController(IEnquiryApi enquiryApi)
        {
            _enquiryApi = enquiryApi;
        }

        [HttpGet("[controller]/[action]")]
        public async Task<IActionResult> GetEnquiry(string enquiryId)
        {
            if (int.TryParse(enquiryId, out var intId))  {
                var enquiry = await _enquiryApi.GetAsync(intId);
                return Ok(enquiry);
            }
            
            if(Guid.TryParse(enquiryId, out var guidId))
            {
                try
                {
                    var enquiry = await _enquiryApi.GetAsync(guidId);
                    return Ok(enquiry);
                }
                catch (HttpResponseException problemDetailsException)
                {
                    if (problemDetailsException.Response.ReasonPhrase == "Enquiry Not Found")
                    {
                        return NotFound();
                    }
                    
                    return BadRequest();
                }
                catch (Exception exception)
                {
                    return BadRequest(exception);
                }
            }

            return BadRequest("The enquiry identifier is not valid.");
        }

        /// <summary>
        /// Takes in a cliendId and cfcTeamName and returns a list of open enquiries
        /// <param name="clientId">The clientId from the logged in user</param>
        /// <param name="cfcTeamName">The cfcTeamName from the policy</param>
        /// <returns>EnquirySearchResponse</returns>
        /// <remarks>Searching enquiries from the given clientId and cfcTeamName</remarks>
        [HttpGet]
        [Route("enquiries/search")]
        public async Task<IActionResult> EnquirySearch(int clientId, string cfcTeamName)
        {
            var enquiry = await _enquiryApi.SearchAsync(clientId, cfcTeamName);
            return Ok(enquiry);
        }
    }
}
