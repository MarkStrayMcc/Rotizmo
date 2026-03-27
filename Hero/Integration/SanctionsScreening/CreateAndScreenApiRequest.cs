using System.Collections.Generic;

namespace Hero.Integration.SanctionsScreening;

public class CreateAndScreenApiRequest
{
    public string SanctionsCaseId { get; init; }
    public string Name { get; init; }
    public string EntityType { get; init; }
    public string Group { get; init; }
    public bool? OnGoingScreening {get; init;}
    public Dictionary<string, string> AdditionalFields { get; init; } = new();
}