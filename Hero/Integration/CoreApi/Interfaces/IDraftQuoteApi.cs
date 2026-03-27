using System.Threading.Tasks;
using Hero.Models;

namespace Hero.Integration.CoreApi.Interfaces
{
    public interface IDraftQuoteApi
    {
        Task<QuoteData> ResolveDraftQuoteAsync(int enquiryId);
    }
}
