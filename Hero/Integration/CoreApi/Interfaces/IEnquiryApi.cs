using Hero.Models;
using System;
using System.Threading.Tasks;

namespace Hero.Integration.CoreApi.Interfaces
{
    public interface IEnquiryApi
    {
        Task<NerdEnquiry> GetAsync(int enquiryId);
        Task<EnquiryServiceEnquiry> GetAsync(Guid enquiryUid);
        Task<EnquirySearchResponse> SearchAsync(int clientId, string cfcTeamName);
    }
}
