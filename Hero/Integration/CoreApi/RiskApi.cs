using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Hero.Integration.CoreApi.Interfaces;
using Microsoft.AspNetCore.Http;
using WebApiDto.Dto;

namespace Hero.Integration.CoreApi
{
    public class RiskApi : BaseApi, IRiskApi
    {
        private readonly string riskByQuoteRefUrl;
        private readonly string riskByDraftUrl;

        public RiskApi(IConfigurationRoot configuration, IHttpContextAccessor httpContextAccessor) : base(configuration, httpContextAccessor)
        {
            riskByDraftUrl = _configuration["CoreApi:RiskByDraft"];
            riskByQuoteRefUrl = _configuration["CoreApi:RiskByQuoteRef"];            
        }

        public async Task<List<RiskQuestion>> GetRiskQuestions(RiskQuestionRequest riskQuestionRequest)
        {
            return await PostAsyncTyped<RiskQuestionRequest, List<RiskQuestion>>(riskByQuoteRefUrl, riskQuestionRequest);
        }

        public async Task<List<RiskQuestion>> GetRiskQuestions(RiskQuestionDraftRequest riskQuestionRequest)
        {
            return await PostAsyncTyped<RiskQuestionDraftRequest, List<RiskQuestion>>(riskByDraftUrl, riskQuestionRequest);
        }

    }
}
