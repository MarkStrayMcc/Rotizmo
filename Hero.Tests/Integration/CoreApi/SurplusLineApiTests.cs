
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Hero.Models;
using Hero.Tests.Integration.CoreApi.TestDoubles;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using NSubstitute;
using NUnit.Framework;

namespace Hero.Tests.Integration.CoreApi
{
    [TestFixture]
    public class SurplusLineApiTests
    {
        private IConfigurationRoot _configurationRoot;
        private IHttpContextAccessor _httpContextAccessor;

        [SetUp]
        public void SetUp()
        {
            _configurationRoot = Substitute.For<IConfigurationRoot>();

            _configurationRoot["SurplusLinesService:BaseUrl"].Returns("https://surplus-lines.local/");
            _configurationRoot["CoreApi:SurplusLinesForRenewal"].Returns("https://coreapi.local/surplus-lines/resolve");

            _httpContextAccessor = Substitute.For<IHttpContextAccessor>();
        }

        [Test]
        public async Task GetSurplusLines_ShouldCallExpectedUrl_AndReturnData()
        {
            // Arrange
            var subject = new TestableSurplusLineApi(_configurationRoot, _httpContextAccessor);

            var expectedResponse = new List<SurplusLinesServiceResponse>
            {
                new SurplusLinesServiceResponse
                {
                    Key = 1,
                    Id = Guid.NewGuid(),
                    Name = "Jane Broker",
                    Company = "Acme Brokers",
                    LicenseNumber = "LIC-0001",
                    LicenseStateIsoCode = "NY",
                    LicenseExpiryDate = DateTime.Today.AddYears(1),
                    AddressLine1 = "123 Main St",
                    AddressZipCode = "10001",
                    AddressStateIsoCode = "NY",
                    IsVerified = true
                }
            };

            subject.GetAsyncTypedStub = expectedResponse;

            // Act
            var result = await subject.GetSurplusLines("NY", 55);

            // Assert
            Assert.That(subject.LastRequestedUrl,
                Is.EqualTo("https://surplus-lines.local/verified-surplus-lines-brokers?licenseStateIsoCode=NY"));

            Assert.That(result, Is.Not.Null);
            Assert.That(result, Has.Count.EqualTo(1));
            Assert.That(result[0].Name, Is.EqualTo("Jane Broker"));
            Assert.That(result[0].IsVerified, Is.True);
        }

        [TestCase("")]
        [TestCase("   ")]
        public async Task ResolveForExpiringPolicy_ShouldReturnNull_WhenPolicyNumberIsNullOrWhitespace(string policyNumber)
        {
            var subject = new TestableSurplusLineApi(_configurationRoot, _httpContextAccessor);

            var result = await subject.ResolveForExpiringPolicy(policyNumber);

            Assert.That(result, Is.Null);
            Assert.That(subject.LastRequestedUrl, Is.Null);
        }


        [Test]
        public async Task ResolveForExpiringPolicy_ShouldReturnNull_WhenPolicyNumberIsNull()
        {
            var subject = new TestableSurplusLineApi(_configurationRoot, _httpContextAccessor);

            var result = await subject.ResolveForExpiringPolicy(null);

            Assert.That(result, Is.Null);
            Assert.That(subject.LastRequestedUrl, Is.Null);
        }


        [Test]
        public async Task ResolveForExpiringPolicy_ShouldCallExpectedUrl_AndReturnValue_WhenFound()
        {
            var subject = new TestableSurplusLineApi(_configurationRoot, _httpContextAccessor);

            var inputPolicy = "ABC/123 2025#01";
            var escaped = Uri.EscapeDataString(inputPolicy);

            var expected = new SurplusLine
            {
                Id = 42,
                StateProvinceCode = "CA",
                BrokerName = "Acme Brokers",
                ContactName = "John Smith",
                Address1 = "500 Market St",
                LicenseNumber = "CA-9191",
                Zip = "90001",
                ExpiryDate = DateTime.Today.AddMonths(6),
                SurplusLineBrokerUid = Guid.NewGuid()
            };

            subject.TryGetAsyncStub = (true, expected);

            var result = await subject.ResolveForExpiringPolicy(inputPolicy);

            Assert.That(subject.LastRequestedUrl,
                Is.EqualTo($"https://coreapi.local/surplus-lines/resolve?expiringPolicyNumber={escaped}"));

            Assert.That(result, Is.Not.Null);
            Assert.That(result.Id, Is.EqualTo(42));
            Assert.That(result.BrokerName, Is.EqualTo("Acme Brokers"));
        }

        [Test]
        public async Task ResolveForExpiringPolicy_ShouldReturnNull_WhenNotFound()
        {
            var subject = new TestableSurplusLineApi(_configurationRoot, _httpContextAccessor);

            var policy = "NOT-FOUND-0001";
            var escaped = Uri.EscapeDataString(policy);

            subject.TryGetAsyncStub = (false, default(SurplusLine));

            var result = await subject.ResolveForExpiringPolicy(policy);

            Assert.That(subject.LastRequestedUrl,
                Is.EqualTo($"https://coreapi.local/surplus-lines/resolve?expiringPolicyNumber={escaped}"));

            Assert.That(result, Is.Null);
        }
    }
}
