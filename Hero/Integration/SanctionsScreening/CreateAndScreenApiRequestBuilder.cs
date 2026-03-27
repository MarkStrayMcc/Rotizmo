using System.Collections.Generic;

namespace Hero.Integration.SanctionsScreening;

public class CreateAndScreenApiRequestBuilder : ICreateAndScreenApiRequestBuilder
{
    private const string GroupName = "Underwriting Workbench";
    private const string OrganisationEntityType = "organisation";
    private const string RegisteredCountryField = "registered_country";
    private const string CountryLocationField = "country_location";
    private const string ClientIdField = "clientId";

    public CreateAndScreenApiRequest Build(string clientUid,
        int clientId, string clientName, string countryIsoCode, string entityType, bool? onGoingScreening)
    {
        return new CreateAndScreenApiRequest
        {
            SanctionsCaseId = $"{clientUid}-{entityType}",
            Name = clientName,
            EntityType = entityType,
            Group = GroupName,
            OnGoingScreening = onGoingScreening,
            AdditionalFields = BuildAdditionalFields(clientId, countryIsoCode, entityType)
        };
    }

    private static Dictionary<string, string> BuildAdditionalFields(int clientId, string countryIsoCode, string entityType)
    {
        var additionalFields = new Dictionary<string, string>
        {
            { ClientIdField, clientId.ToString() },
            { GetCountryFieldKey(entityType), countryIsoCode }
        };
        return additionalFields;
    }

    private static string GetCountryFieldKey(string entityType)
    {
        return entityType == OrganisationEntityType ? RegisteredCountryField : CountryLocationField;
    }
}
