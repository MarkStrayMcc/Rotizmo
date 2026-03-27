using System.Collections.Generic;
using System.Threading.Tasks;
using Hero.Integration.CoreApi.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using WebApiDto.Dto;

namespace Hero.Integration.CoreApi
{
    public class LossFundApi : BaseApi, ILossFundApi
    {
        private readonly string _lossFundSummaryUrl;
        
        public LossFundApi(IConfigurationRoot configuration, IHttpContextAccessor httpContextAccessor) : base(configuration, httpContextAccessor)
        {
            this._lossFundSummaryUrl = configuration["CoreApi:LossFunds"] + "/summaries";
        }

        public async Task<List<FinanceLossFundSummary>> GetLossFunds()
        {
            return await GetAsyncTyped<List<FinanceLossFundSummary>>(this._lossFundSummaryUrl);
        }
        
    }
}