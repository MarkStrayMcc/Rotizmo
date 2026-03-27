using Hero.Integration.CoreApi;
using System.Collections.Generic;
using System.Threading.Tasks;
using Hero.Models.CreatePolicyMta;

namespace Hero.Integration.CreatePolicyMtaApi.LossPayeeApi
{
    public interface ILossPayeeClient
    {
        Task<string> PostAsync(string policyNumber, LossPayeeMtaRequest request);

        Task<ICollection<LossPayee>> GetAsync(string policyNumber);

    }
}
