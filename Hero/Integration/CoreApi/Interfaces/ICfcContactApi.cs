using System.Collections.Generic;
using System.Threading.Tasks;
using WebApiDto.Dto;

namespace Hero.Integration.CoreApi.Interfaces
{
    public interface ICfcContactApi
    {
        Task<List<CfcContact>> GetByInitialsAsync();
        Task<List<CfcContact>> SearchAsync(string searchTerm);
        Task<CfcContact> GetByInitialsAsync(string initals);
        Task<CfcContact> GetByUsernameAsync(string email);
        Task<List<CfcContact>> GetUnderwritersForReferral(int quoteId);
    }
}
