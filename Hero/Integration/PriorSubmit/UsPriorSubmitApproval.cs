using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Hero.Integration.Extensions;
using Hero.Models.Extensions;
using PropertyLimit = Hero.Models.PropertyLimit;

namespace Hero.Integration.PriorSubmit;

public class UsPriorSubmitApproval : IPriorSubmitApproval
{
    private static readonly HashSet<string> PriorSubmitZipCodes = new(StringComparer.OrdinalIgnoreCase)
    {
        "10001", "10002", "10003", "10004", "10005", "10006", "10007", "10009", "10010", "10011", "10012", "10013", "10014", "10016", "10017", "10018", "10019", "10020", "10021", "10022", "10036", "10038", "10065", "10069", "10075", "10128", "10278", "10280", "10281", "10282"
    };

    public int CountryId => 4;

    public Task EvaluateAsync(IList<PropertyLimit> propertyLimits)
    {
        foreach (var propertyLimit in propertyLimits)
        {
            var insuredAddress = propertyLimit.InsuredAddress;
            if (insuredAddress is null || string.IsNullOrWhiteSpace(insuredAddress.Postcode)) continue;

            if (PriorSubmitZipCodes.Contains(insuredAddress.Postcode.RemoveWhitespace()))
            {
                propertyLimit.PriorCarrierApprovalRequired = true;
                propertyLimit.FormattedAddress = insuredAddress.ToValidationAddress(insuredAddress.Country?.Name);
            }
        }

        return Task.CompletedTask;
    }
}
