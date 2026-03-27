namespace Hero.Integration.SanctionsScreening;

public interface ICreateAndScreenApiRequestBuilder
{
    public CreateAndScreenApiRequest Build(string clientUid, int clientId, string clientName, string countryIsoCode, string entityType, bool? onGoingScreening);
}