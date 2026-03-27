using System.Collections.Generic;
using System.Threading.Tasks;

namespace Hero.Integration.CoreApi.Interfaces
{
    public interface ILossFundApi
    {

        Task<List<WebApiDto.Dto.FinanceLossFundSummary>> GetLossFunds();
    }
}
