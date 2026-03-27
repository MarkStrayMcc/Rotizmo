using System.Threading.Tasks;
using Hero.Models;

namespace Hero.Integration.CoreApi.Interfaces
{
    public interface IClientClearanceApi
    {
        Task<ClientClearanceResult> CheckForBroker(ClientClearanceRequest clientClearanceRequest);
    }
}