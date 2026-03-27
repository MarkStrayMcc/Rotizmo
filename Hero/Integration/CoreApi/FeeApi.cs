using System;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Hero.Infrastructure;
using Hero.Integration.CoreApi.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using WebApiDto.Dto.Connect;

namespace Hero.Integration.CoreApi
{
    public class FeeApi : BaseApi, IFeeApi
    {
        private readonly string _getMaximumFeeUrl;
        private readonly string _getDefaultFeeUrl;

        public FeeApi(IConfigurationRoot configuration, IHttpContextAccessor httpContextAccessor) : base(configuration, httpContextAccessor)
        {
            _getMaximumFeeUrl = _configuration["CoreApi:FeeMaximum"];
            _getDefaultFeeUrl = _configuration["CoreApi:FeeDefault"];
        }

        public async Task<decimal> GetMaximumFee(QuoteFeeRequest request)
        {
            return await PostAsyncTyped<QuoteFeeRequest, decimal>(_getMaximumFeeUrl, request);
        }

        public async Task<decimal?> GetDefaultFee(QuoteFeeRequest request)
        {
            using (var client = new HttpClient())
            {
                var response = await client.PostAsync(_getDefaultFeeUrl, request?.AsJson()).ConfigureAwait(false);
                var responseBody = await response.Content.ReadAsStringAsync().ConfigureAwait(false);

                if (response.StatusCode == HttpStatusCode.NotFound)
                {
                    return null;
                }
                if (!response.IsSuccessStatusCode)
                {
                    throw new Exception(responseBody);
                }

                return JsonConvert.DeserializeObject<decimal>(responseBody);
            }
        }
    }
}
