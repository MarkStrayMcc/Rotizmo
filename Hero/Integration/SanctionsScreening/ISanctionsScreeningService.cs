using System.Threading.Tasks;
using Hero.Models;

namespace Hero.Integration.SanctionsScreening;

public interface ISanctionsScreeningService
{
    Task<bool> HasSanctions(SanctionsCheckRequest sanctionsScreeningRequest);
}