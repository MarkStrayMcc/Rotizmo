using System;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using System.Threading.Tasks;
using Hero.Models;
using System.Net.Http;
using Hero.Infrastructure;
using Newtonsoft.Json;

namespace Hero.Integration.FeeCalculatorApi
{
    public class FeeCalculatorApi : BaseApi, IFeeCalculatorApi
    {
        private static string _feeSplitUrl;
        private const string FrontDoorAccessKeyHeader = "cfcapps-frontdoor-access-secret";
        private readonly string _frontDoorAccessSecretHeaderValue;

        public FeeCalculatorApi(IConfigurationRoot configuration, IHttpContextAccessor httpContextAccessor)
            : base(configuration, httpContextAccessor)
        {
            var baseUrl = new Uri(_configuration["FeeCalculatorApi:BaseUrl"]);
            _feeSplitUrl = new Uri(baseUrl, "api/excel-fee-calculator").ToString();
            _frontDoorAccessSecretHeaderValue = _configuration["Authentication:CfcFrontDoorAccessSecret"];
        }

        public async Task<FeeResponse> GetFeeSplits(FeeRequest feeRequest)
        {
            using (var client = new HttpClient())
            {
                AddUserSessionValuesAsCfcHeaders(client);
                client.DefaultRequestHeaders.Add(FrontDoorAccessKeyHeader, _frontDoorAccessSecretHeaderValue);
                var response = await client.PostAsync(_feeSplitUrl, feeRequest?.AsJson()).ConfigureAwait(false);
                var responseBody = await response.Content.ReadAsStringAsync().ConfigureAwait(false);

                if (!response.IsSuccessStatusCode)
                {
                    throw new Exception(responseBody);
                }

                return JsonConvert.DeserializeObject<FeeResponse>(responseBody);
            }
        }
    }
}