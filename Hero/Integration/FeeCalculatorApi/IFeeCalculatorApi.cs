using System.Threading.Tasks;
using Hero.Models;

namespace Hero.Integration.FeeCalculatorApi
{
    public interface IFeeCalculatorApi
    {
        Task<FeeResponse> GetFeeSplits(FeeRequest feeRequest);
    }
}