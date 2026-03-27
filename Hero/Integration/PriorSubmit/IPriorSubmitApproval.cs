using System.Collections.Generic;
using System.Threading.Tasks;
using PropertyLimit = Hero.Models.PropertyLimit;

namespace Hero.Integration.PriorSubmit;

public interface IPriorSubmitApproval
{
    int CountryId { get; }
    Task EvaluateAsync(IList<PropertyLimit> propertyLimits);
}
