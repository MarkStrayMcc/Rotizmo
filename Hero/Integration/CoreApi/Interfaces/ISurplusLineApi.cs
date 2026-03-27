using Hero.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Hero.Integration.CoreApi.Interfaces
{
    public interface ISurplusLineApi
    {
        Task<List<SurplusLinesServiceResponse>> GetSurplusLines(string stateCode, int brokerTeamId);

        Task<SurplusLine> ResolveForExpiringPolicy(string policyNumber);
    }
}