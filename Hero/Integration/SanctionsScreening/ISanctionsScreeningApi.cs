using System.Threading.Tasks;
using Hero.Models;

namespace Hero.Integration.SanctionsScreening;

public interface ISanctionsScreeningApi
{
        Task<bool> CreateAndScreen(string clientUid, int clientId, string clientName, string countryIsoCode, string entityType, bool? onGoingScreening);
}
