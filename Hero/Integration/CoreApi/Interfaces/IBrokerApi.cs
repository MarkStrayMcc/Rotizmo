using System.Threading.Tasks;

namespace Hero.Integration.CoreApi.Interfaces
{
    public interface IBrokerApi
    {
        Task<decimal> GetBrokerCommissionRate(int brokerTeamId, int productId);
    }
}