using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Hero.Integration.CoreApi.Interfaces;
using Hero.Models;
using System.Web.Http;
using System;
using HttpGetAttribute = Microsoft.AspNetCore.Mvc.HttpGetAttribute;

namespace Hero.Controllers
{
    public class ActivityController : Controller
    {
        private readonly IActivityApi _activityApi;

        public ActivityController(IActivityApi activityApi)
        {
            _activityApi = activityApi;
        }

        [HttpGet("[controller]/[action]")]
        public async Task<IActionResult> Search(string productCode, string name)
        {
            try
            {
                List<ActivitySearchResponse> activities = await _activityApi.GetAsync(productCode, name);
                return Ok(activities);
            }
            catch (HttpResponseException problemDetailsException)
            {
                if (problemDetailsException.Response.ReasonPhrase == "Activity Not Found")
                {
                    return NotFound();
                }
                else
                {
                    return BadRequest();
                }
            }
            catch (Exception exception)
            {
                return BadRequest(exception);
            }
        }

        public IActionResult Error()
        {
            return View();
        }
    }
}
