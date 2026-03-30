using Hero.Integration.SanctionsScreening;

namespace Hero.Tests.Integration.SanctionsScreening;

public class CreateAndScreenApiRequestBuilderTests
{
    [Test]
    public void Build_WhenIndividualEntity_ShouldPopulateAdditionalFieldsCountry()
    {
        var builder = new CreateAndScreenApiRequestBuilder();
        var countryIsoCode = "country_iso_code";
        var payload = builder.Build(default, default, default, countryIsoCode, "individual", false);

        payload.AdditionalFields.Should().ContainKey("country_location");
        payload.AdditionalFields["country_location"].Should().Be(countryIsoCode);
    }

    [Test]
    public void Build_WhenOrganisationEntity_ShouldPopulateAdditionalFieldsCountry()
    {
        var builder = new CreateAndScreenApiRequestBuilder();
        var countryIsoCode = "country_iso_code";
        var payload = builder.Build(default, default, default, countryIsoCode, "organisation", false);

        payload.AdditionalFields.Should().ContainKey("registered_country");
        payload.AdditionalFields["registered_country"].Should().Be(countryIsoCode);
    }

    [Test]
    public void Build_ShouldPopulateAdditionalFieldsClientId()
    {
        var builder = new CreateAndScreenApiRequestBuilder();
        var clientId = Random.Shared.Next();
        var payload = builder.Build(default, clientId, default, default, default, false);

        payload.AdditionalFields.Should().ContainKey("clientId");
        payload.AdditionalFields["clientId"].Should().Be(clientId.ToString());
    }

    [TestCase("individual")]
    [TestCase("organisation")]
    public void Build_ShouldPopulateProperties(string entityType)
    {
        var builder = new CreateAndScreenApiRequestBuilder();
        var clientUid = Guid.NewGuid().ToString();

        var payload = builder.Build(clientUid,
            Random.Shared.Next(),
            "client_name",
            "UK",
            entityType,
            false);

        payload.EntityType.Should().Be(entityType);
        payload.Group.Should().Be("Underwriting Workbench");
        payload.Name.Should().Be("client_name");
        payload.SanctionsCaseId.Should().Be($"{clientUid}-{entityType}");
    }
}
