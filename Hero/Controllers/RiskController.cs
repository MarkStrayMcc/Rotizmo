using Hero.Integration.CoreApi.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using WebApiDto.Dto;

namespace Hero.Controllers
{
    [Route("risk")]
    public class RiskController : Controller
    {
        private readonly IRiskApi _riskApi;

        public RiskController(IRiskApi riskApi)
        {
            _riskApi = riskApi;
        }

        [HttpPost("risk-questions/quote")]
        public async Task<IActionResult> GetRiskQuestions([FromBody]RiskQuestionRequest riskQuestionRequest)
        {
            var riskQuestions = await _riskApi.GetRiskQuestions(riskQuestionRequest);
            return Ok(riskQuestions);
        }

        [HttpPost("risk-questions/draft")]
        public async Task<IActionResult> GetRiskQuestionsForDraft([FromBody]RiskQuestionDraftRequest riskQuestionRequest)
        {
            var riskQuestions = await _riskApi.GetRiskQuestions(riskQuestionRequest);
            return Ok(riskQuestions);
        }

    }
}