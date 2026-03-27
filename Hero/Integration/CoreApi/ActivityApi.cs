using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Hero.Integration.CoreApi.Interfaces;
using Microsoft.AspNetCore.Http;
using Hero.Models;
using System.Net;
using Newtonsoft.Json;
using System.Net.Http;
using System.Web.Http;
using System.Web;

namespace Hero.Integration.CoreApi
{
    public class ActivityApi : BaseApi, IActivityApi
    {
        private readonly string _activitySearchUrl;
        private readonly string _frontDoorAccessSecretHeaderValue;
        private const string FrontDoorAccessSecretHeaderName = "cfcapps-frontdoor-access-secret";

        public ActivityApi(IConfigurationRoot configuration, IHttpContextAccessor httpContextAccessor) : base(configuration, httpContextAccessor)
        {
            _activitySearchUrl = _configuration["InternalSearchService:ActivitySearch"];
            _frontDoorAccessSecretHeaderValue = _configuration["Authentication:CfcFrontDoorAccessSecret"];
        }

        public async Task<List<ActivitySearchResponse>> GetAsync(string productCode, string name)
        {
            using (var client = new HttpClient())
            {
                client.DefaultRequestHeaders.Add(FrontDoorAccessSecretHeaderName, _frontDoorAccessSecretHeaderValue);

                var encodedProductCode = HttpUtility.UrlEncode(productCode);
                var encodedName = HttpUtility.UrlEncode(name);
                var url = $"{_activitySearchUrl}?productCode={encodedProductCode}&name={encodedName}&isHeroOrigin=true";
                var response = await client.GetAsync(url).ConfigureAwait(false);
                var responseBody = await response.Content.ReadAsStringAsync().ConfigureAwait(false);

                if (response.StatusCode == HttpStatusCode.NotFound)
                {
                    var resp = new HttpResponseMessage(HttpStatusCode.NotFound)
                    {
                        Content = new StringContent(string.Format("No activities found for the searched activity {1} and the product {0}", productCode, name)),
                        ReasonPhrase = "Activity Not Found"
                    };
                    throw new HttpResponseException(resp);
                }
                if (!response.IsSuccessStatusCode)
                {
                    throw new Exception(responseBody);
                }

                return JsonConvert.DeserializeObject<List<ActivitySearchResponse>>(responseBody);
            }
        }
    }
}
