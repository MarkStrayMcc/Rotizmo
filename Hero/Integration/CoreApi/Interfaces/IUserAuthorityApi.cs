using System.Collections.Generic;
using System.Threading.Tasks;
using Hero.Models;

namespace Hero.Integration.CoreApi.Interfaces
{
    public interface IUserAuthorityApi
    {
        Task<List<RiskQuestionValidationRulesSearchResponse>> GetRiskQuestionValidationRules(RiskQuestionValidationRulesSearchRequest request);
    }
}