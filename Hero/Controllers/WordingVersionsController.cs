using System;
using System.Net;
using System.Threading.Tasks;
using Hero.Integration.CoreApi.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Hero.Controllers
{
    public class WordingVersionsController : Controller
    {
        private readonly IWordingVersionsApi _wordingVersionsApi;

        public WordingVersionsController(IWordingVersionsApi wordingVersionsApi)
        {
            _wordingVersionsApi = wordingVersionsApi;
        }

        [HttpGet("[controller]/{wordingVersionId}/is-publishable")]
        public async Task<ActionResult<bool>> IsPublishableWordingVersion([FromRoute]int wordingVersionId)
        {
            try
            {
                var response = await _wordingVersionsApi.IsPublishableWordingVersion(wordingVersionId);
                return Ok(response);
            }
            catch (Exception e)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, e);
            }
        }
    }
}