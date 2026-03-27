using System.Threading.Tasks;
using Hero.Models.Brokers;

namespace Hero.Integration.CoreApi.Interfaces
{
    public interface IBrokerContactApi
    {
        Task<BrokerInformationResponse> GetBrokerContact(int brokerContactId, bool includeFullBrokerDetails);
    }
}
