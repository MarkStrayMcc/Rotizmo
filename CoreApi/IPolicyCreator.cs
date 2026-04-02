using System.Threading;
using System.Threading.Tasks;
using Cfc.Policy.Contracts.Bind;

namespace Cfc.CoreApi.Policy.DomainService.Bind
{
    public interface IPolicyCreator
    {
        Task<BindResponse> Create(BindRequest bindRequest);
    }
}