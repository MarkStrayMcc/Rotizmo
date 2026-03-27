using System.Threading.Tasks;
using WebApiDto.Dto.DDPT;

namespace Hero.Integration.CoreApi.Interfaces
{
    public interface IWordingVersionsApi
    {
        Task<bool> IsPublishableWordingVersion(int wordingVersionId);

        Task<DocumentResult> GetDocument(string format, int wordingVersionId, string countryIsoCode, int brokerTeamId,
            string productName, string stateProvinceCode, bool isAdmitted = false, string cfcTeamCoverholder = null);
    }
}