using System.Collections.Generic;

namespace Cfc.CoreApi.Policy.DomainService.Bind
{
    public interface IQuoteAdditionalInsuredRetriever
    {
        ICollection<Policy.AdditionalInsured.AdditionalInsured> Get(int quoteId);
    }
}