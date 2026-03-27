using System.Collections.Generic;
using System.Threading.Tasks;
using Hero.Integration.CoreApi.Language;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Hero.Controllers
{
    public class LanguageController : Controller
    {
        private readonly ILanguageClient _languageClient;

        public LanguageController(ILanguageClient languageClient)
        {
            _languageClient = languageClient;
        }

        [HttpGet("languages")]
        public async Task<IActionResult> GetLanguages(string countryIsoCode = "", string productCode = "")
        {
            ICollection<Integration.CoreApi.Language.Language> languageResponse;
            try
            {
                languageResponse = await _languageClient.Language_GetLanguagesAsync(countryIsoCode, productCode);
            }
            catch (Hero.Integration.CoreApi.Language.SwaggerException<Hero.Integration.CoreApi.Language.ProblemDetails> problemDetailsException)
            {
                if (problemDetailsException.StatusCode == 404)
                {
                    return NotFound(problemDetailsException.Result);
                }
                else if (problemDetailsException.StatusCode == 400)
                {
                    return BadRequest(problemDetailsException.Result);
                }
                else
                {
                    return StatusCode(StatusCodes.Status500InternalServerError, problemDetailsException.Result);
                }
            }
            return Ok(languageResponse);
        }
    }
}