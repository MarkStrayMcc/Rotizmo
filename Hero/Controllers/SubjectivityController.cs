using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Hero.Integration.CoreApi.Interfaces;
using Microsoft.AspNetCore.Http;
using Hero.Integration.CoreApi.Subjectivities;
using Hero.Integration.SubjectivityConfigurationApi;
using Hero.Models.SubjectivityConfiguration;

namespace Hero.Controllers
{
    public class SubjectivityController : Controller
    {
        private readonly ISubjectivityApi _subjectivityApi;
        private readonly ISubjectivitiesClient _subjectivitiesClient;
        private readonly ISubjectivityConfigurationApi _subjectivityConfigurationApi;

        public SubjectivityController(ISubjectivityApi subjectivityApi, ISubjectivitiesClient subjectivitiesClient, ISubjectivityConfigurationApi subjectivityConfigurationApi)
        {
            _subjectivityApi = subjectivityApi;
            _subjectivitiesClient = subjectivitiesClient;
            _subjectivityConfigurationApi = subjectivityConfigurationApi;
        }

        [Obsolete("Please use the Subjectivity Configuration API instead.")]
        [HttpGet("[controller]/[action]")]
        public async Task<IActionResult> GetSubjectivity(int? productId, int? languageId, int? countryId, bool isAdmitted, int? surplusLineBrokerId)
        {
            var subjectivities = await _subjectivityApi.GetAsync(productId, languageId, countryId, isAdmitted, surplusLineBrokerId);
            return Ok(subjectivities);
        }

        [Obsolete("Please use the Subjectivity Configuration API instead.")]
        [HttpGet("[controller]/[action]")]
        [ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]
        public async Task<IActionResult> GetDefaultSubjectivities(Guid draftQuoteId)
        {
            var subjectivities = await _subjectivityApi.GetDefaultSubjectivityAsync(draftQuoteId);
            return Ok(subjectivities);
        }

        [Obsolete("Please use the Subjectivity Configuration API instead.")]
        [HttpGet("[controller]/[action]")]
        public async Task<IActionResult> GetAllDefaulSubjtectivitiesIds()
        {
            List<int> defaultSubjectivitiesIds = await _subjectivityApi.GetAllDefaultSubjectivitiesIdsAsync();
            return Ok(defaultSubjectivitiesIds);
        }

        [Obsolete("Please use the Subjectivity Configuration API instead.")]
        [HttpPost("subjectivities/search")]
        public async Task<IActionResult> SearchSubjectivities([FromBody] SubjectivityFilterParameters subjectivityFilter)
        {
            ICollection<Subjectivity> subjectivityResponse;
            try
            {
                subjectivityResponse = await _subjectivitiesClient.Subjectivities_SearchSubjectivitiesAsync(subjectivityFilter);
            }
            catch (SwaggerException swaggerException)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, swaggerException.Response);
            }
            return Ok(subjectivityResponse);
        }

        [HttpPost("subjectivity-configuration/filter")]
        public async Task<IActionResult> SearchSubjectivities([FromBody]SearchSubjectivitiesQuery searchSubjectivitiesQuery)
        {
            ICollection<SearchSubjectivitiesResult> subjectivityResponse;
            try
            {
                subjectivityResponse = await _subjectivityConfigurationApi.Filter(searchSubjectivitiesQuery);
            }
            catch (SwaggerException swaggerException)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, swaggerException.Response);
            }
            return Ok(subjectivityResponse);
        }

        public IActionResult Error()
        {
            return View();
        }
    }
}
