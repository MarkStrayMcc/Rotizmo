using System.Collections.Generic;
using System.Threading.Tasks;
using Hero.Models;

namespace Hero.Integration.CoreApi.Interfaces
{
    public interface IClientApi
    {
        Task<Models.Client> GetAsync(string policyNumber);

        Task<List<ClientSearchResult>> SearchAsync(string searchTerm);

        Task<string> GetClientFolderByClientId(int clientId);

        Task<ClientLatestReferenceResponse> GetLatestActiveQuoteReference(LatestQuoteReferenceRequest request);
    }
}