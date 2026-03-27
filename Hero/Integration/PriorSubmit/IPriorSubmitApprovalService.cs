using System.Collections.Generic;
using System.Threading.Tasks;
using PropertyLimit = Hero.Models.PropertyLimit;

namespace Hero.Integration.PriorSubmit;

public interface IPriorSubmitApprovalService
{
    Task EvaluateLocationsAsync(IList<PropertyLimit> propertyLimits);
}
