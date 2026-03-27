using System.Threading.Tasks;
using WebApiDto.Dto.Connect;

namespace Hero.Integration.CoreApi.Interfaces
{
    public interface IFeeApi
    {
        Task<decimal> GetMaximumFee(QuoteFeeRequest request);
        Task<decimal?> GetDefaultFee(QuoteFeeRequest request);
    }
}
