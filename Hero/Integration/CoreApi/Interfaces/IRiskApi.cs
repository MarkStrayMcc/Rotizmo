using System.Collections.Generic;
using System.Threading.Tasks;
using WebApiDto.Dto;

namespace Hero.Integration.CoreApi.Interfaces
{
    public interface IRiskApi
    {
        Task<List<RiskQuestion>> GetRiskQuestions(RiskQuestionRequest riskQuestionRequest);
        Task<List<RiskQuestion>> GetRiskQuestions(RiskQuestionDraftRequest riskQuestionRequest);

    }
}