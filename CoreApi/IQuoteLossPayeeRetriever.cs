using System.Collections.Generic;

namespace Cfc.CoreApi.Policy.DomainService.Bind
{
    public interface IQuoteLossPayeeRetriever
    {
        ICollection<Policy.LossPayee.LossPayee> Get(int quoteId);
    }
}