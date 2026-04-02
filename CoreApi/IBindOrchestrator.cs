using System.Threading;
using System.Threading.Tasks;
using Cfc.Policy.Contracts.Bind;

namespace Cfc.CoreApi.Policy.DomainService.Bind
{
    public interface IBindOrchestrator
    {
        Task<BindResponse> Bind(BindRequest bindRequest);
    }
}