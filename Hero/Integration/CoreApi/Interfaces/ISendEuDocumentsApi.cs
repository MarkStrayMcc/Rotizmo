using System.Threading.Tasks;
using Cfc.CoreApi.Integration;

namespace Hero.Integration.CoreApi.Interfaces
{
    public interface ISendEuDocumentsApi
    {
        Task<SendEuDocumentsResult> SendEuDocuments(SendEuDocumentsRequest sendEuDocumentsRequest);
    }
}
