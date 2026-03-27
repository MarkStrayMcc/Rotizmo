using System.Collections.Generic;
using System.Threading.Tasks;
using Hero.Integration.CoreApi.Interfaces;
using Hero.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

namespace Hero.Integration.CoreApi
{
    public class UserAuthorityApi : BaseApi, IUserAuthorityApi
    {
        private readonly string _riskQuestionValidationRule;

        public UserAuthorityApi(IConfigurationRoot configuration, IHttpContextAccessor httpContextAccessor) : base(configuration, httpContextAccessor)
        {
            _riskQuestionValidationRule = _configuration["CoreApi:RiskQuestionValidationRule"];
        }

        public async Task<List<RiskQuestionValidationRulesSearchResponse>> GetRiskQuestionValidationRules(RiskQuestionValidationRulesSearchRequest request)
        {
            var riskQuestionValidationRuleResponses = await PostAsyncTyped<RiskQuestionValidationRulesSearchRequest, List<RiskQuestionValidationRulesSearchResponse>>(_riskQuestionValidationRule,request);
            return riskQuestionValidationRuleResponses;
        }
    }
}