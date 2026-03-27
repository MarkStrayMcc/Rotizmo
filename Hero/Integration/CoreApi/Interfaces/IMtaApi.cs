using Hero.Models;
using System.Threading.Tasks;

namespace Hero.Integration.CoreApi.Interfaces
{
    public interface IMtaApi
    {
        Task<AddressChangeResult> AddressChange(AddressChangeMtaRequest newAddress, string policyId);
    }
}
