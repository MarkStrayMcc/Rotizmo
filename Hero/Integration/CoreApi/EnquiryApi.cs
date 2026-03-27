using Hero.Integration.CoreApi.Interfaces;
using Hero.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using System;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using Newtonsoft.Json;

namespace Hero.Integration.CoreApi
{
    public class EnquiryApi : BaseApi, IEnquiryApi
    {
        private readonly string _enquirieServiceUrl;
        private readonly string _coreApiEnquiriesUrl;
        
        private readonly string _frontDoorAccessSecretHeaderValue;
        private const string FrontDoorAccessSecretHeaderName = "cfcapps-frontdoor-access-secret";

        public EnquiryApi(IConfigurationRoot configuration, IHttpContextAccessor httpContextAccessor) : base(configuration, httpContextAccessor)
        {
            _enquirieServiceUrl = _configuration["EnquiryService:BaseUrl"];
            _coreApiEnquiriesUrl = _configuration["CoreApi:Enquiries"];
        }

        public async Task<EnquiryServiceEnquiry> GetAsync(Guid uid)
        {
            using (var client = new HttpClient())
            {
                client.DefaultRequestHeaders.Add(FrontDoorAccessSecretHeaderName, _frontDoorAccessSecretHeaderValue);

                var response = await client.GetAsync($"{_enquirieServiceUrl}/api/enquiries/{uid}").ConfigureAwait(false);
                var responseBody = await response.Content.ReadAsStringAsync().ConfigureAwait(false);

                if (response.StatusCode == HttpStatusCode.NotFound)
                {
                    var resp = new HttpResponseMessage(HttpStatusCode.NotFound)
                    {
                        Content = new StringContent($"No enquiry found for uid: {uid}"),
                        ReasonPhrase = "Enquiry Not Found"
                    };
                    throw new HttpResponseException(resp);
                }
                if (!response.IsSuccessStatusCode)
                {
                    throw new Exception(responseBody);
                }

                return JsonConvert.DeserializeObject<EnquiryServiceEnquiry>(responseBody);
            }
        }

        public async Task<NerdEnquiry> GetAsync(int id)
        {
            return await GetAsyncTyped<NerdEnquiry>($"{_coreApiEnquiriesUrl}/{id}");
        }

        public async Task<EnquirySearchResponse> SearchAsync(int clientId, string cfcTeamName)
        {
            return await GetAsyncTyped<EnquirySearchResponse>($"{_coreApiEnquiriesUrl}/search?clientId={clientId}&cfcTeamName={HttpUtility.UrlEncode(cfcTeamName)}");
        }
    }
}
