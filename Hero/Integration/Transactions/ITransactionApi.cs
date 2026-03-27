using System.Collections.Generic;
using System.Threading.Tasks;

namespace Hero.Integration.Transaction
{
    public interface ITransactionApi
    {
        Task<ICollection<Hero.Models.Transaction>> GetByPolicyNumber(string policyNumber);
    }
}