using System.Collections.Generic;

namespace Hero.Models;

public record SanctionsCheckRequest
{
    public string ClientUid { get; init; }
    public string ClientName { get; init; }
    public int ClientId { get; init; }
    public string CountryIsoCode { get; init; }
    public string Stage { get; init; }
    public bool IsSendEmail { get; init; }
    public bool? onGoingScreening {get; init;}
}
