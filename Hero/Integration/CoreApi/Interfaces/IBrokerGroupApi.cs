using System.Threading.Tasks;
using WebApiDto.Dto;

namespace Hero.Integration.CoreApi.Interfaces
{
    public interface IBrokerGroupApi
    {
        Task<BrokerGroup> GetBrokerGroupInfo(int brokerGroupId);
    }
}