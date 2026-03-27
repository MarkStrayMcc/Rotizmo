using System.Collections.Generic;
using System.Threading.Tasks;
using Hero.Models;

namespace Hero.Integration.CoreApi.Interfaces
{
    public interface IPropertyLimitsApi
    {
        Task<List<PropertyLimit>> GetPropertyLimits(int quoteRef);
    }
}
