using Hero.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Hero.Integration.EnrichmentAdapter
{
    public interface IEnrichmentAdapterApi
    {
        Task<Dictionary<string, RiskParameter>> GetEnrichedData(Guid clientUid);
    }
}