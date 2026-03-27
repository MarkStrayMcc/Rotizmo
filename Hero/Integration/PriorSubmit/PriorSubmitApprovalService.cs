using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using PropertyLimit = Hero.Models.PropertyLimit;

namespace Hero.Integration.PriorSubmit;

public class PriorSubmitApprovalService : IPriorSubmitApprovalService
{
    private readonly IEnumerable<IPriorSubmitApproval> _approvals;

    public PriorSubmitApprovalService(IEnumerable<IPriorSubmitApproval> approvals)
    {
        _approvals = approvals;
    }

    public async Task EvaluateLocationsAsync(IList<PropertyLimit> propertyLimits)
    {
        var locationCountryIds = propertyLimits
            .Select(pl => pl.InsuredAddress?.CountryId)
            .Where(id => id.HasValue)
            .Select(id => id.Value)
            .Distinct()
            .ToHashSet();

        foreach (var approval in _approvals)
        {
            if (!locationCountryIds.Contains(approval.CountryId)) continue;

            await approval.EvaluateAsync(propertyLimits);
        }
    }
}
