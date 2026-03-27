using System.Threading.Tasks;
using Hero.Integration.CoreApi.Interfaces;
using Hero.Models;
using Microsoft.AspNetCore.Mvc;

namespace Hero.Controllers
{
    public class UserAuthorityController : Controller
    {
        private readonly IUserAuthorityApi _userAuthorityApi;

        public UserAuthorityController(IUserAuthorityApi userAuthorityApi)
        {
            _userAuthorityApi = userAuthorityApi;
        }

        /// <summary>
        /// Retrieve risk question validation rules 
        /// </summary>
        /// <param name="riskQuestionValidationRulesSearchRequest"></param>
        /// <returns>List<RiskQuestionValidationRuleResponse></returns>
        [HttpPost("[controller]/risk-question-validation-rules/")]
        public async Task<IActionResult> GetRiskQuestionValidationRules([FromBody] RiskQuestionValidationRulesSearchRequest riskQuestionValidationRulesSearchRequest)
        {
            return Ok(await _userAuthorityApi.GetRiskQuestionValidationRules(riskQuestionValidationRulesSearchRequest));
        }
    }
}