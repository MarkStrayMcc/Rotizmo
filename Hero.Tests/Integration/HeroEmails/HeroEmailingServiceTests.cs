using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoFixture;
using AutoFixture.AutoNSubstitute;
using Hero.Integration.HeroEmails;
using Hero.Integration.HeroEmails.Interfaces;
using Hero.Models;
using Microsoft.ApplicationInsights;
using NSubstitute;
using NUnit.Framework;

namespace Hero.Tests.Integration.HeroEmails
{
    public class HeroEmailingServiceTests
    {
        [Test]
        public async Task SendQuoteEmailWithCoverHolder_SendsEmailWithExpectedFieldsAndAttachments()
        {
            // Arrange
            var email = new Email
            {
                EmailType = EmailType.SubjectivityReviewRequest,
                Sender = new EmailContact { Email = "sender@test.com" },
                To = new List<EmailContact> { new EmailContact { Email = "to@test.com" } },
                Cc = new List<EmailContact>(),
                Bcc = new List<EmailContact>(),
                Subject = "Test Subject",
                EmailBody = "Custom body",
                DataAttachments = new List<FileData> { new FileData { Name = "data1.pdf" } },
                ServerSideAttachments = new List<ServerSideFileData> { new ServerSideFileData { FileName = "server1.pdf" } },
                MergeFields = new Dictionary<string, string> { { "ExtraField", "ExtraValue" } }
            };

            var quoteRelatedDocs = new List<FileData>
            {
                new FileData { Name = "server1.pdf" },
                new FileData { Name = "related2.pdf" }
            };

            var underwritingDistributionEmail = new UnderwritingDistributionEmail
            {
                QuoteId = 123,
                QuoteUid = Guid.NewGuid(),
                IsPublished = true,
                IsBindable = true,
                WordingVersionId = 1,
                CountryIsoCode = "US",
                ProductCode = "CPM",
                Email = email,
                QuoteIds = new List<int> { 123, 456 }
            };

            var expectedTemplate = "Email body template";
            var expectedCoverHolderInfo = "Coverholder Info";
            var expectedMergeFields = new Dictionary<string, string> { { "Field1", "Value1" } };
            var expectedQuoteUids = new Dictionary<int, Guid> { { 456, Guid.NewGuid() } };
            var additionalDoc = new List<QuoteFileData> { new() { FileName = "additional.pdf" } };

            var enrichmentApi = Substitute.For<IRequestEnrichmentApi>();
            enrichmentApi.GetQuoteCoverHolderInfo(underwritingDistributionEmail.QuoteId).Returns(expectedCoverHolderInfo);
            enrichmentApi.GetEmailTemplate((int)email.EmailType, expectedCoverHolderInfo).Returns(expectedTemplate);
            enrichmentApi.GetQuoteEmailMergeFields(underwritingDistributionEmail).Returns(new Dictionary<string, string>(expectedMergeFields));
            enrichmentApi.GetQuoteUids(underwritingDistributionEmail.QuoteIds).Returns(expectedQuoteUids);

            var distributionApi = Substitute.For<IUnderwritingDistributionApi>();
            distributionApi.SendEmail(Arg.Any<Email>()).Returns(true);

            var quoteDocumentService = Substitute.For<IQuoteDocumentService>();
            quoteDocumentService.GetQuoteRelatedDocumentsAsync(underwritingDistributionEmail.QuoteUid).Returns(quoteRelatedDocs);
            quoteDocumentService.GetQuoteAdditionalDocumentsAsync(expectedQuoteUids[456]).Returns(additionalDoc);

            var policyDocumentService = Substitute.For<IPolicyDocumentService>();

            var telemetryClient = StubTelemetryClient();
            var service = new HeroEmailingService(enrichmentApi, distributionApi, quoteDocumentService, policyDocumentService, telemetryClient);

            // Act
            var result = await service.SendQuoteEmailWithCoverHolder(underwritingDistributionEmail);

            // Assert
            Assert.That(result, Is.True);

            var sentEmail = distributionApi.ReceivedCalls()
                .Select(call => call.GetArguments().FirstOrDefault() as Email)
                .FirstOrDefault(e => e != null);

            Assert.That(sentEmail, Is.Not.Null);
            Assert.That(sentEmail.EmailType, Is.EqualTo(email.EmailType));
            Assert.That(sentEmail.Sender.Email, Is.EqualTo(email.Sender.Email));
            Assert.That(sentEmail.To.Count, Is.EqualTo(1));
            Assert.That(sentEmail.To[0].Email, Is.EqualTo("to@test.com"));
            Assert.That(sentEmail.Subject, Is.EqualTo(email.Subject));
            Assert.That(sentEmail.EmailBody, Is.EqualTo(expectedTemplate));
            Assert.That(sentEmail.MergeFields, Is.Not.Null);
            Assert.That(sentEmail.MergeFields["Field1"], Is.EqualTo("Value1"));
            Assert.That(sentEmail.MergeFields["CustomBody"], Is.EqualTo("Custom body"));
            Assert.That(sentEmail.MergeFields["ExtraField"], Is.EqualTo("ExtraValue"));
            Assert.That(sentEmail.DataAttachments, Is.Not.Null);
            Assert.That(sentEmail.DataAttachments.Any(f => f.Name == "data1.pdf"), Is.True);
            Assert.That(sentEmail.DataAttachments.Any(f => f.Name == "server1.pdf"), Is.True);
            Assert.That(sentEmail.DataAttachments.Any(f => f.Name == "additional.pdf"), Is.True);
        }

        [Test]
        public async Task SendQuoteEmailWithCoverHolder_SendsEmailWithExpectedFieldsAndAttachmentsByQuotes_WhenAdditionalQuotesAttached()
        {
            // Arrange
            var email = new Email
            {
                EmailType = EmailType.SubjectivityReviewRequest,
                Sender = new EmailContact { Email = "sender@test.com" },
                To = new List<EmailContact> { new EmailContact { Email = "to@test.com" } },
                Cc = new List<EmailContact>(),
                Bcc = new List<EmailContact>(),
                Subject = "Test Subject",
                EmailBody = "Custom body",
                DataAttachments = new List<FileData> { new FileData { Name = "data1.pdf" } },
                ServerSideAttachments = new List<ServerSideFileData>
                {
                    new ServerSideFileData { FileName = "server1.pdf" },
                    new ServerSideFileData { FileName = "related2.pdf" }
                },
                MergeFields = new Dictionary<string, string> { { "ExtraField", "ExtraValue" } }
            };

            var quoteRelatedDocs = new List<FileData>
            {
                new FileData { Name = "server1.pdf", Type = "Quote" },
                new FileData { Name = "related2.pdf" }
            };

            var underwritingDistributionEmail = new UnderwritingDistributionEmail
            {
                QuoteId = 123,
                QuoteUid = Guid.NewGuid(),
                IsPublished = true,
                IsBindable = true,
                WordingVersionId = 1,
                CountryIsoCode = "US",
                ProductCode = "CPM",
                Email = email,
                QuoteIds = new List<int> { 123, 456 }
            };

            var expectedTemplate = "Email body template";
            var expectedCoverHolderInfo = "Coverholder Info";
            var expectedMergeFields = new Dictionary<string, string> { { "Field1", "Value1" } };
            var expectedQuoteUids = new Dictionary<int, Guid> { { 456, Guid.NewGuid() } };
            var additionalDoc = new List<QuoteFileData>
            {
                new() { FileName = "additional.pdf", Type = "Quote"},
                new() { FileName = "additional-related.pdf", Type = "Wording"}
            };

            var enrichmentApi = Substitute.For<IRequestEnrichmentApi>();
            enrichmentApi.GetQuoteCoverHolderInfo(underwritingDistributionEmail.QuoteId).Returns(expectedCoverHolderInfo);
            enrichmentApi.GetEmailTemplate((int)email.EmailType, expectedCoverHolderInfo).Returns(expectedTemplate);
            enrichmentApi.GetQuoteEmailMergeFields(underwritingDistributionEmail).Returns(new Dictionary<string, string>(expectedMergeFields));
            enrichmentApi.GetQuoteUids(underwritingDistributionEmail.QuoteIds).Returns(expectedQuoteUids);

            var distributionApi = Substitute.For<IUnderwritingDistributionApi>();
            distributionApi.SendEmail(Arg.Any<Email>()).Returns(true);

            var quoteDocumentService = Substitute.For<IQuoteDocumentService>();
            quoteDocumentService.GetQuoteRelatedDocumentsAsync(underwritingDistributionEmail.QuoteUid).Returns(quoteRelatedDocs);
            quoteDocumentService.GetQuoteAdditionalDocumentsAsync(expectedQuoteUids[456]).Returns(additionalDoc);

            var policyDocumentService = Substitute.For<IPolicyDocumentService>();

            var telemetryClient = StubTelemetryClient();
            var service = new HeroEmailingService(enrichmentApi, distributionApi, quoteDocumentService, policyDocumentService, telemetryClient);

            // Act
            var result = await service.SendQuoteEmailWithCoverHolder(underwritingDistributionEmail);

            // Assert
            Assert.That(result, Is.True);

            var sentEmail = distributionApi.ReceivedCalls()
                .Select(call => call.GetArguments().FirstOrDefault() as Email)
                .FirstOrDefault(e => e != null);

            Assert.That(sentEmail, Is.Not.Null);
            Assert.That(sentEmail.EmailType, Is.EqualTo(email.EmailType));
            Assert.That(sentEmail.Sender.Email, Is.EqualTo(email.Sender.Email));
            Assert.That(sentEmail.To.Count, Is.EqualTo(1));
            Assert.That(sentEmail.To[0].Email, Is.EqualTo("to@test.com"));
            Assert.That(sentEmail.Subject, Is.EqualTo(email.Subject));
            Assert.That(sentEmail.EmailBody, Is.EqualTo(expectedTemplate));
            Assert.That(sentEmail.MergeFields, Is.Not.Null);
            Assert.That(sentEmail.MergeFields["Field1"], Is.EqualTo("Value1"));
            Assert.That(sentEmail.MergeFields["CustomBody"], Is.EqualTo("Custom body"));
            Assert.That(sentEmail.MergeFields["ExtraField"], Is.EqualTo("ExtraValue"));
            Assert.That(sentEmail.DataAttachments, Is.Not.Null);
            Assert.That(sentEmail.DataAttachments.Any(f => f.Name == "data1.pdf"), Is.True);
            Assert.That(sentEmail.DataAttachments.Any(f => f.Name == "server1.pdf"), Is.True);
            Assert.That(sentEmail.DataAttachments.Any(f => f.Name == "additional.pdf"), Is.True);
            Assert.That(sentEmail.DataAttachments.Any(f => f.Name == "related2.pdf"), Is.True);
            Assert.That(sentEmail.DataAttachments.Any(f => f.Name == "additional-related.pdf"), Is.True);

            //assert that attachments are arranged by quotes
            var expectedOrder = new List<string> { "server1.pdf", "additional.pdf", "data1.pdf", "related2.pdf", "additional-related.pdf" };
            var actualOrder = sentEmail.DataAttachments.Select(f => f.Name).ToList();
            Assert.That(actualOrder.SequenceEqual(expectedOrder), Is.True);

        }

        [Test]
        public async Task SendPolicyEmailWithCoverHolder_SendsEmailWithExpectedFieldsAndAttachments()
        {
            // Arrange
            var email = new Email
            {
                EmailType = EmailType.SendPolicy,
                Sender = new EmailContact { Email = "sender@test.com" },
                To = new List<EmailContact> { new EmailContact { Email = "to@test.com" } },
                Cc = new List<EmailContact>(),
                Bcc = new List<EmailContact>(),
                Subject = "Policy Subject",
                EmailBody = "Policy custom body",
                DataAttachments = new List<FileData> { new FileData { Name = "data1.pdf" } },
                ServerSideAttachments = new List<ServerSideFileData> { new ServerSideFileData { FileName = "server1.pdf", ServerSideFileType = ServerSideFileType.Policy } },
                MergeFields = new Dictionary<string, string> { { "ExtraField", "ExtraValue" } }
            };

            var policyRelatedDocs = new List<FileData>
            {
                new FileData { Name = "server1.pdf" },
                new FileData { Name = "policy2.pdf" }
            };

            var encryptedDoc = new EncryptDocumentsServiceResponse
            {
                Key = "encrypted-key"
            };

            var underwritingDistributionEmail = new UnderwritingDistributionEmail
            {
                QuoteId = 123,
                QuoteUid = Guid.NewGuid(),
                IsPublished = true,
                IsBindable = true,
                WordingVersionId = 1,
                CountryIsoCode = "US",
                ProductCode = "CPM",
                PolicyNumber = "POL123",
                BrokerId = 99,
                ClientUid = Guid.NewGuid(),
                Email = email,
                QuoteIds = new List<int> { 123 }
            };

            var expectedTemplate = "Policy email template";
            var expectedCoverHolderInfo = "Coverholder Info";
            var expectedMergeFields = new Dictionary<string, string> { { "Field1", "Value1" } };

            var enrichmentApi = Substitute.For<IRequestEnrichmentApi>();
            enrichmentApi.GetQuoteCoverHolderInfo(underwritingDistributionEmail.QuoteId).Returns(expectedCoverHolderInfo);
            enrichmentApi.GetEmailTemplate((int)email.EmailType, expectedCoverHolderInfo).Returns(expectedTemplate);
            enrichmentApi.GetQuoteEmailMergeFields(underwritingDistributionEmail).Returns(new Dictionary<string, string>(expectedMergeFields));
            enrichmentApi.GetEncryptedDocuments(Arg.Any<EncryptDocumentRequest>())
                .Returns(new List<EncryptDocumentsServiceResponse> { encryptedDoc });

            var distributionApi = Substitute.For<IUnderwritingDistributionApi>();
            distributionApi.SendEmail(Arg.Any<Email>()).Returns(true);

            var quoteDocumentService = Substitute.For<IQuoteDocumentService>();
            var policyDocumentService = Substitute.For<IPolicyDocumentService>();
            policyDocumentService.GetPolicyRelatedDocumentsAsync(underwritingDistributionEmail.PolicyNumber).Returns(policyRelatedDocs);

            var telemetryClient = StubTelemetryClient();
            var service = new HeroEmailingService(enrichmentApi, distributionApi, quoteDocumentService, policyDocumentService, telemetryClient);

            // Act
            var result = await service.SendPolicyEmailWithCoverHolder(underwritingDistributionEmail);

            // Assert
            Assert.That(result, Is.True);

            var sentEmail = distributionApi.ReceivedCalls()
                .Select(call => call.GetArguments().FirstOrDefault() as Email)
                .FirstOrDefault(e => e != null);

            Assert.That(sentEmail, Is.Not.Null);
            Assert.That(sentEmail.EmailType, Is.EqualTo(email.EmailType));
            Assert.That(sentEmail.Sender.Email, Is.EqualTo(email.Sender.Email));
            Assert.That(sentEmail.To.Count, Is.EqualTo(1));
            Assert.That(sentEmail.To[0].Email, Is.EqualTo("to@test.com"));
            Assert.That(sentEmail.Subject, Is.EqualTo(email.Subject));
            Assert.That(sentEmail.EmailBody, Is.EqualTo(expectedTemplate));
            Assert.That(sentEmail.MergeFields, Is.Not.Null);
            Assert.That(sentEmail.MergeFields["Field1"], Is.EqualTo("Value1"));
            Assert.That(sentEmail.MergeFields["CustomBody"], Is.EqualTo("Policy custom body"));
            Assert.That(sentEmail.MergeFields["ExtraField"], Is.EqualTo("ExtraValue"));
            Assert.That(sentEmail.MergeFields["PolicyNumber"], Is.EqualTo("POL123"));
            Assert.That(sentEmail.MergeFields["EncryptedDocumentsHtml"], Is.Not.Null);
            Assert.That(sentEmail.MergeFields["EncryptedDocumentsKey"], Is.EqualTo("encrypted-key"));
            Assert.That(sentEmail.MergeFields["CommissionHtml"], Is.Not.Null);
            Assert.That(sentEmail.DataAttachments, Is.Not.Null);
            Assert.That(sentEmail.DataAttachments.Any(f => f.Name == "data1.pdf"), Is.True);
            Assert.That(sentEmail.DataAttachments.Any(f => f.Name == "server1.pdf"), Is.True);
        }

        [Test]
        public async Task GetAttachments_WhenFilenamesDifferOnlyByCase_FullCaseInsensitiveMatchSucceeds()
        {
            var (service, distributionApi, ude) = BuildQuoteEmailTestSetup(
                serverAttachments: new List<ServerSideFileData> { new() { FileName = "20260326 quote 6579632.pdf", Reference = "6579632" } },
                docServiceDocs: new List<FileData> { new() { Name = "20260326 QUOTE 6579632.pdf" } });

            await service.SendQuoteEmailWithCoverHolder(ude);

            Assert.That(GetSentEmail(distributionApi).DataAttachments.Any(f => f.Name == "20260326 QUOTE 6579632.pdf"), Is.True);
        }

        [Test]
        public async Task GetAttachments_WhenDatePrefixIsStale_FallsBackToPartialMatchOnReference()
        {
            // UI captured stale date prefix at modal-open; doc engine regenerated with today's date -> partial match resolves it
            var (service, distributionApi, ude) = BuildQuoteEmailTestSetup(
                serverAttachments: new List<ServerSideFileData> { new() { FileName = "20240115 QUOTE 6579632.pdf", Reference = "6579632" } },
                docServiceDocs: new List<FileData> { new() { Name = "20260326 QUOTE 6579632.pdf" } });

            await service.SendQuoteEmailWithCoverHolder(ude);

            Assert.That(GetSentEmail(distributionApi).DataAttachments.Any(f => f.Name == "20260326 QUOTE 6579632.pdf"), Is.True);
        }

        [Test]
        public async Task GetAttachments_WhenDatePrefixIsStaleAndReferenceIsNull_AttachmentIsDropped()
        {
            // Full match fails and Reference is null, so partial fallback is skipped
            var (service, distributionApi, ude) = BuildQuoteEmailTestSetup(
                serverAttachments: new List<ServerSideFileData> { new() { FileName = "20240115 QUOTE 6579632.pdf", Reference = null } },
                docServiceDocs: new List<FileData> { new() { Name = "20260326 QUOTE 6579632.pdf" } });

            await service.SendQuoteEmailWithCoverHolder(ude);

            Assert.That(GetSentEmail(distributionApi).DataAttachments.Any(f => f.Name.Contains("6579632")), Is.False);
        }

        [Test]
        public async Task GetAttachments_WhenReferenceDoesNotMatchAnyDocument_AttachmentIsDropped()
        {
            // Partial fallback runs but doc engine returned a different quote's document
            var (service, distributionApi, ude) = BuildQuoteEmailTestSetup(
                serverAttachments: new List<ServerSideFileData> { new() { FileName = "20240115 QUOTE 6579632.pdf", Reference = "6579632" } },
                docServiceDocs: new List<FileData> { new() { Name = "20260326 QUOTE 9999999.pdf" } });

            await service.SendQuoteEmailWithCoverHolder(ude);

            Assert.That(GetSentEmail(distributionApi).DataAttachments.Any(f => f.Name.Contains("6579632")), Is.False);
        }

        private (HeroEmailingService service, IUnderwritingDistributionApi distributionApi, UnderwritingDistributionEmail ude)
            BuildQuoteEmailTestSetup(List<ServerSideFileData> serverAttachments, List<FileData> docServiceDocs)
        {
            var fixture = new Fixture().Customize(new AutoNSubstituteCustomization { ConfigureMembers = true });
            var quoteUid = fixture.Create<Guid>();

            var email = fixture.Build<Email>()
                .With(e => e.DataAttachments, new List<FileData>())
                .With(e => e.ServerSideAttachments, serverAttachments)
                .With(e => e.MergeFields, new Dictionary<string, string>())
                .Create();

            var ude = fixture.Build<UnderwritingDistributionEmail>()
                .With(u => u.QuoteUid, quoteUid)
                .With(u => u.Email, email)
                .With(u => u.QuoteIds, new List<int> { 1 })
                .Create();

            var enrichmentApi = fixture.Freeze<IRequestEnrichmentApi>();
            enrichmentApi.GetQuoteCoverHolderInfo(Arg.Any<int>()).Returns("info");
            enrichmentApi.GetEmailTemplate(Arg.Any<int>(), Arg.Any<string>()).Returns("template");
            enrichmentApi.GetQuoteEmailMergeFields(Arg.Any<UnderwritingDistributionEmail>()).Returns(new Dictionary<string, string>());

            var distributionApi = fixture.Freeze<IUnderwritingDistributionApi>();
            distributionApi.SendEmail(Arg.Any<Email>()).Returns(true);

            var quoteDocService = fixture.Freeze<IQuoteDocumentService>();
            quoteDocService.GetQuoteRelatedDocumentsAsync(quoteUid).Returns(docServiceDocs);

            var service = new HeroEmailingService(
                enrichmentApi, distributionApi, quoteDocService,
                fixture.Freeze<IPolicyDocumentService>(), StubTelemetryClient());

            return (service, distributionApi, ude);
        }

        private static Email GetSentEmail(IUnderwritingDistributionApi distributionApi) =>
            distributionApi.ReceivedCalls()
                .Select(c => c.GetArguments().FirstOrDefault() as Email)
                .First(e => e != null);

        private static TelemetryClient StubTelemetryClient()
        {
            var fakeChannel = new TestTelemetryChannel();
            var telemetryConfig = new Microsoft.ApplicationInsights.Extensibility.TelemetryConfiguration
            {
                TelemetryChannel = fakeChannel,
                InstrumentationKey = "test"
            };
            var telemetry = new TelemetryClient(telemetryConfig);
            return telemetry;
        }

        private class TestTelemetryChannel : Microsoft.ApplicationInsights.Channel.ITelemetryChannel
        {
            public List<Microsoft.ApplicationInsights.Channel.ITelemetry> SentTelemetries { get; } = new();
            public void Send(Microsoft.ApplicationInsights.Channel.ITelemetry item) => SentTelemetries.Add(item);
            public void Flush() { }
            public bool? DeveloperMode { get; set; }
            public string EndpointAddress { get; set; }
            public void Dispose() { }
        }
    }
}
