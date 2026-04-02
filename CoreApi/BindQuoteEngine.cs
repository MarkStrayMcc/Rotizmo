namespace CFC.CoreApi.BusinessLogic.QuoteEngineComponents
{
    using System;
    using System.Collections.Generic;
    using System.Globalization;
    using System.IO;
    using System.Linq;
    using System.Net;
    using System.Threading.Tasks;
    using System.Web.Http;
    using CFC.CoreApi.BusinessLogic.Constants;
    using CFC.CoreApi.BusinessLogic.Exceptions;
    using CFC.CoreApi.BusinessLogic.Interfaces;
    using CFC.CoreApi.BusinessLogic.QuoteEngineComponents.Interfaces;
    using CFC.CoreApi.BusinessLogicDto.Dto;
    using CFC.CoreApi.BusinessLogicDto.Dto.DDPT;
    using CFC.CoreApi.BusinessLogicDto.Enum;
    using CFC.CoreApi.Constants;
    using CFC.CoreApi.Integration.DocumentsApi.Interfaces;
    using CFC.CoreApi.Models.Enums.Nerd;
    using CFC.CoreApi.Models.Nerd;
    using CFC.CoreApi.Models.ViewModels.Policy;
    using Cfc.CoreApi.Policy.Messages;
    using CFC.CoreApi.Repositories.Interfaces;
    using CFC.Utils.Helpers.Interfaces;
    using MediatR;
    using NLog;
    using EmailTemplate = Models.Mta.EmailTemplate;
    using Quote = BusinessLogicDto.Dto.Quote;
    using CFC.CoreApi.Integration.Infrastructure.SearchServiceClient;
    using CFC.CoreApi.Models.Constants;

    public class BindQuoteEngine : IBindQuoteEngine
    {
        private static readonly Logger Logger = LogManager.GetLogger("CoreAPI:BindQuoteEngine");

        private readonly IPolicyEngine _policyEngine;
        private readonly IPolicyDocumentEngine _policyDocumentEngine;
        private readonly IPolicyCreationRequestBuilder _policyCreationRequestBuilder;
        private readonly IAuditNoteWriter _auditNoteWriter;
        private readonly IQuoteRepository _quoteRepository;
        private readonly IWordingApi _wordingApi;
        private readonly IEmailEngine _emailEngine;
        private readonly IBrokerLoyaltyPointsEngine _brokerLoyaltyPointsEngine;
        private readonly ISubjectivityEngine _subjectivityEngine;
        private readonly IEnquiryEngine _enquiryEngine;
        private readonly ITelusSystemEngine _telusSystemEngine;
        private readonly IInsurerListEngine _insurerListEngine;
        private readonly IElCertificateEngine _elCertificateEngine;
        private readonly ITransactionRepository _transactionRepository;
        private readonly IEmailContactBuilder _emailContactBuilder;
        private readonly IQuoteResolver _quoteResolver;
        private readonly IAttachmentResolverFactory _attachmentResolverFactory;
        private readonly IUnderwriterValidationEngine _underwriterValidationEngine;
        private readonly IConfigHelper _configHelper;
        private readonly IPortfolioItemsClient _portfolioItemsClient;
        private readonly IMediator _mediator;
        private readonly IDateReceivedValidator _dateReceivedValidator;
        private readonly ICertificateOfInsuranceEngine _certificateOfInsuranceEngine;
        private readonly IFeatureEngine _featureEngine;

        public BindQuoteEngine(
            IPolicyEngine policyEngine,
            IPolicyDocumentEngine policyDocumentEngine,
            IPolicyCreationRequestBuilder policyCreationRequestBuilder,
            IAuditNoteWriter auditNoteWriter,
            IQuoteRepository quoteRepository,
            IWordingApi wordingApi,
            IEmailEngine emailEngine,
            IBrokerLoyaltyPointsEngine brokerLoyaltyPointsEngine,
            ISubjectivityEngine subjectivityEngine,
            IEnquiryEngine enquiryEngine,
            ITelusSystemEngine telusSystemEngine,
            IInsurerListEngine insurerListEngine,
            IElCertificateEngine elCertificateEngine,
            ITransactionRepository transactionRepository,
            IEmailContactBuilder emailContactBuilder,
            IQuoteResolver quoteResolver,
            IAttachmentResolverFactory attachmentResolverFactory,
            IUnderwriterValidationEngine underwriterValidationEngine,
            IConfigHelper configHelper,
            IPortfolioItemsClient portfolioItemsClient,
            IMediator mediator,
            IDateReceivedValidator dateReceivedValidator,
            ICertificateOfInsuranceEngine certificateOfInsuranceEngine,
            IFeatureEngine featureEngine)
        {
            _policyEngine = policyEngine;
            _policyDocumentEngine = policyDocumentEngine;
            _policyCreationRequestBuilder = policyCreationRequestBuilder;
            _auditNoteWriter = auditNoteWriter;
            _quoteRepository = quoteRepository;
            _wordingApi = wordingApi;
            _emailEngine = emailEngine;
            _brokerLoyaltyPointsEngine = brokerLoyaltyPointsEngine;
            _subjectivityEngine = subjectivityEngine;
            _enquiryEngine = enquiryEngine;
            _telusSystemEngine = telusSystemEngine;
            _insurerListEngine = insurerListEngine;
            _emailContactBuilder = emailContactBuilder;
            _quoteResolver = quoteResolver;
            _attachmentResolverFactory = attachmentResolverFactory;
            _underwriterValidationEngine = underwriterValidationEngine;
            _configHelper = configHelper;
            _elCertificateEngine = elCertificateEngine;
            _transactionRepository = transactionRepository;
            _portfolioItemsClient = portfolioItemsClient;
            _mediator = mediator;
            _dateReceivedValidator = dateReceivedValidator;
            _certificateOfInsuranceEngine = certificateOfInsuranceEngine;
            _featureEngine = featureEngine;
        }

        public async Task<QuoteBindResponse> BindQuote(QuoteBindRequest quoteBindRequest)
        {
            if (!await _dateReceivedValidator.IsValid(quoteBindRequest.ReceivedDate))
            {
                throw new HttpResponseException(HttpStatusCode.BadRequest);
            }

            if (!await _underwriterValidationEngine.IsValidUnderwriterForQuote(quoteBindRequest.CfcContactId, quoteBindRequest.QuoteId, true))
            {
                throw new HttpResponseException(HttpStatusCode.Unauthorized);
            }

            // In case of bind errors on any part of the process it should throw a BindQuoteException with a respective "BindQuoteErrorCode" status
            // (This method has been marked for refactoring as part of story #23170 -- https://dev.azure.com/cfcunderwriting/CFC/_workitems/edit/23170 )
            var quoteBindResponse = new QuoteBindResponse();
            try
            {
                var policyCreationRequest = await _policyCreationRequestBuilder.BuildPolicyCreationRequest(quoteBindRequest);
                CheckPolicyCreationRequestForInvalidSubjectivities(policyCreationRequest);
                var newPolicyNumber = _policyEngine.CreatePolicy(policyCreationRequest, out var policyNumberUid);

                var notification = new PolicyBoundNotification
                {
                    PolicyNumber = newPolicyNumber,
                    CompanyName = policyCreationRequest?.ClientName,
                    RequestTransactions = policyCreationRequest?.RequestTransactions
                };
                var publishTask = _mediator.Publish(notification);

                quoteBindResponse.PopulateWithNewPolicyInfo(newPolicyNumber, policyNumberUid);

                var policy = PersistPolicyRelatedDataToDb(quoteBindRequest, policyCreationRequest, quoteBindResponse);

                var fileGuid = Guid.NewGuid();

                await Task.WhenAll(
                    GeneratePolicyDocument(policy, fileGuid),
                    GenerateAdditionalPolicyDocuments(policyCreationRequest, policy),
                    HandleCanadaSpecificData(quoteBindRequest, policyCreationRequest, policy, fileGuid),
                    HandleAustraliaSpecificData(quoteBindRequest, policyCreationRequest),
                    IndexPolicyInSearchService(policyNumberUid),
                    publishTask);

                var @event = PolicyBoundEvent.From(policy.PolicyNumber);
                await _mediator.Publish(@event);
            }
            catch (BindQuoteException exception)
            {
                Logger.Error(exception, $"{exception.ErrorCode} when binding a quote");
                quoteBindResponse.PopulateWithCaughtExceptionInfo(exception, exception.ErrorCode);
            }
            catch (Exception exception)
            {
                Logger.Error(exception, "Unknown error when binding a quote");
                quoteBindResponse.PopulateWithCaughtExceptionInfo(exception, BindQuoteErrorCode.UnspecifiedError);
            }

            return quoteBindResponse;
        }

        public async Task<QuoteBindResponse> BindQuoteAndSendPolicyFromConnect(QuoteBindRequest quoteBindRequest)
        {
            var quote = await _quoteResolver.GetQuoteById(quoteBindRequest.QuoteId, false);
            quoteBindRequest.PopulateWithQuoteInfo(quote);
            var response = await this.BindQuote(quoteBindRequest);
            quote.PolicyNumber = response.PolicyNumber;
            if (response.BindError != null)
            {
                return response;
            }

            var policyAttachmentResolver = _attachmentResolverFactory.Create<string, ServerSideFileData>(EmailType.SendPolicy);
            var emailAttachments = await policyAttachmentResolver.GetAttachments(response.PolicyNumber);
            var email = BuildPolicyEmailRequest(quote);
            email.ServerSideAttachments = emailAttachments;
            try
            {
                _emailEngine.SendEmail(email, false);
            }
            catch
            {
                response.BindError = new QuoteBindResponse.QuoteBindError
                {
                    ErrorCode = BindQuoteErrorCode.SendEmailError,
                    ErrorMessage = "The quote has been bound but an error occurred when sending the policy confirmation email."
                };
            }

            return response;
        }

        private static Dictionary<string, string> CreatePolicyEmailMergeFields(EmailTemplate template, Quote quote)
        {
            return new Dictionary<string, string>
            {
                { "CustomBody", template.PlainTextTemplate },
                { "ClientName", quote.Client.CompanyName },
                { "PolicyNumber", quote.PolicyNumber },
                { "Commission", $"{(quote.CommissionInformation?.ActualGrossCommission ?? 0).ToString(CultureInfo.InvariantCulture)}%" },
                { "DisplayCommissionForCpa", quote.Product.ProductName == "CPA" ? "none" : "allow" }
            };
        }

        private static void CheckPolicyCreationRequestForInvalidSubjectivities(PolicyCreationRequest policyCreationRequest)
        {
            if (policyCreationRequest.IsAdmittedAndHoldsSlBrokerSubjectivity())
            {
                throw new BindQuoteException(
                    "Surplus line broker subjectivity should not be attached to an admitted product.",
                    BindQuoteErrorCode.SubjectivityError);
            }
        }

        private Policy PersistPolicyRelatedDataToDb(
            QuoteBindRequest quoteBindRequest,
            PolicyCreationRequest policyCreationRequest,
            QuoteBindResponse quoteBindResponse)
        {
            try
            {
                UpdatePostBindData(quoteBindRequest.QuoteId, policyCreationRequest);
                var policy = _policyEngine.GetPolicyByPolicyNumber(quoteBindResponse.PolicyNumber);
                SavePolicySubjectivities(policy, policyCreationRequest);
                SavePolicyLocationPremiums(policy.PolicyNumber, quoteBindRequest.PolicyLocationPremiums);
                return policy;
            }
            catch (Exception ex)
            {
                throw new BindQuoteException("Failed to persist policy related data", ex, BindQuoteErrorCode.PostBindUpdatesError);
            }
        }

        private void UpdatePostBindData(int quoteId, PolicyCreationRequest policyCreationRequest)
        {
            UpdateBoundStatusEnquiry(policyCreationRequest.EnquiryId, policyCreationRequest.AssignedToUnderwriterInitials);
            UpdateBoundStatusQuote(quoteId);
            _auditNoteWriter.SaveAuditNote(quoteId, policyCreationRequest.CreatedByUnderwriterInitials, "Bound");
            AddBrokerLoyaltyPoints(
                policyCreationRequest.BrokerContactId,
                policyCreationRequest.BrokerTeamId,
                policyCreationRequest.ClientId,
                policyCreationRequest.ClientName,
                policyCreationRequest.TransactionType);
        }

        private void UpdateBoundStatusEnquiry(int enquiryId, string assignedToUnderwriterInitials)
        {
            try
            {
                _enquiryEngine.UpdateStatus(enquiryId, EnquiryStatusUpdateType.Bind, assignedToUnderwriterInitials);
            }
            catch (Exception exception)
            {
                Logger.Error(exception, "The quote has been successfully bound but an error happened while updating the Enquiry status.");
            }
        }

        private void UpdateBoundStatusQuote(int quoteId)
        {
            try
            {
                UpdateStatus(quoteId, QuoteState.Bound);
            }
            catch (Exception exception)
            {
                Logger.Error(exception, "The quote has been successfully bound but an error happened while updating the Quote status.");
            }
        }

        private void SavePolicySubjectivities(Policy policy, PolicyCreationRequest policyCreationRequest)
        {
            var policySubjectivities = policyCreationRequest.PolicySubjectivities;
            foreach (var policySubjectivity in policySubjectivities)
            {
                policySubjectivity.PolicyNumber = policy.PolicyNumber;
                policySubjectivity.Subjectivity = null;
            }

            _subjectivityEngine.SaveSubjectivitiesForPolicy(policySubjectivities);
        }

        private void SavePolicyLocationPremiums(string policyNumber, ICollection<BusinessLogicDto.Dto.PolicyLocationPremiums> requestPolicyLocationPremiums)
        {
            if (requestPolicyLocationPremiums != null && requestPolicyLocationPremiums.Count > 0)
            {
                var policyLocationPremiums = from locationPremium in requestPolicyLocationPremiums
                                             select new Models.Nerd.PolicyLocationPremiums
                                             {
                                                 PolicyNumber = policyNumber,
                                                 PropertyLimitId = locationPremium.PropertyLimitId,
                                                 BusinessLineCode = locationPremium.BusinessLineCode,
                                                 ModelPremium = locationPremium.ModelPremium,
                                                 QuotedPremium = locationPremium.QuotedPremium,
                                                 SuggestedPremium = locationPremium.SuggestedPremium
                                             };
                _policyEngine.SavePolicyLocationPremiumValues(policyLocationPremiums.ToList());
            }
        }

        private void UpdateStatus(int quoteId, QuoteState state)
        {
            var quote = _quoteRepository.GetQuote(quoteId);
            quote.Status = (int)state;
            if (state == QuoteState.Bound)
            {
                quote.IsBindable = false;
            }

            _quoteRepository.Update(quote);
        }

        private async Task AddTelusSubmission(int quoteId, string policyNumber, Guid? fileGuid = null)
        {
            if (fileGuid == null)
            {
                fileGuid = Guid.NewGuid();
            }

            var filePath = await this.GetPolicyDocumentFullFilePath(policyNumber, fileGuid);
            var alternativeWordingFilePath = await this.GetWordingFileFullPath();
            var quote = await _quoteResolver.GetQuoteById(quoteId, false);

            await GenerateWordingDocument(quote, alternativeWordingFilePath);

            _telusSystemEngine.InsertTelusSubmission(policyNumber, filePath, true, null, fileGuid, alternativeWordingFilePath);
        }

        private async Task GenerateWordingDocument(Quote quote, string alternativeWordingFilePath)
        {
            var wordingDocument = await _wordingApi.GetWording(
                                      new PolicyWordingDocumentRequest
                                      {
                                          FileFormat = FileFormat.Pdf,
                                          PolicyWordingVersionId = quote.WordingVersionId,
                                          Territory = quote.InsuredLocation.Country.IsoCode,
                                          StateProvinceCode = quote.InsuredLocation.StateProvinceCode
                                      });

            File.WriteAllBytes(alternativeWordingFilePath, wordingDocument.Data);
        }

        private async Task ProcessInsurerList(int policyId, int clientId)
        {
            await _insurerListEngine.CreateAndSaveDocument(policyId, clientId, FileFormat.Pdf);
        }

        private void SaveAbnRiskQuestionAnswer(QuoteBindRequest quoteBindRequest)
        {
            _quoteRepository.UpdateRiskQuestionAnswer(quoteBindRequest.QuoteId, "ABN", quoteBindRequest.AustralianBusinessNumber, RiskQuestionType.FreeText);
        }

        private async Task<string> GetPolicyDocumentFullFilePath(string policyNumber, Guid? fileGuid = null)
        {
            var policyDocumentRequest = new PolicyDocumentRequest { FileFormat = FileFormat.Pdf, PolicyNumber = policyNumber };

            return (await _policyDocumentEngine.GetDocumentByPolicyNumber(policyDocumentRequest, fileGuid)).FullFilePath;
        }

        private async Task<string> GetWordingFileFullPath()
        {
            return _configHelper.GetAppSetting("AIFSubmissionFolder") + Guid.NewGuid() + ".pdf";
        }

        private Email BuildPolicyEmailRequest(Quote quote)
        {
            var brokerContact = _emailContactBuilder.CreateBrokerEmailContact(quote.BrokerContact);
            var underwriterContact = _emailContactBuilder.CreateUnderwriterEmailContact(quote.AssignedContact);
            var emailTemplate = _emailEngine.GetEmailTemplate(EmailType.SendPolicy);
            return new Email
            {
                To = brokerContact,
                Bcc = underwriterContact,
                Subject = emailTemplate.Subject,
                EmailBody = emailTemplate.Template,
                Sender = underwriterContact.First(),
                MergeFields = CreatePolicyEmailMergeFields(emailTemplate, quote),
                EmailType = EmailType.SendPolicy
            };
        }

        private void AddBrokerLoyaltyPoints(int brokerContactId, int brokerTeamId, int clientId, string clientName, string quoteType)
        {
            var description = quoteType == "NB" ? $"New Business Order: {clientName}" : $"Renewal Order: {clientName}";
            _brokerLoyaltyPointsEngine.AddLoyaltyPoints(
                brokerContactId,
                BrokerLoyaltyPoints.DefaultCredit,
                description,
                clientId,
                brokerTeamId,
                DateTime.Today.Year,
                true,
                true);
        }

        private Task HandleAustraliaSpecificData(QuoteBindRequest quoteBindRequest, PolicyCreationRequest policyCreationRequest)
        {
            try
            {
                if (policyCreationRequest.CountryIsoCode == CountryIsoCodes.AusIsoCode)
                {
                    SaveAbnRiskQuestionAnswer(quoteBindRequest);
                }
            }
            catch (Exception ex)
            {
                throw new BindQuoteException("Could not persist Australia-specific data.", ex, BindQuoteErrorCode.DocumentGenerationError);
            }

            return Task.CompletedTask;
        }

        private async Task HandleCanadaSpecificData(
            QuoteBindRequest quoteBindRequest,
            PolicyCreationRequest policyCreationRequest,
            Policy policy,
            Guid fileGuid)
        {
            try
            {
                if (policyCreationRequest.CountryIsoCode == CountryIsoCodes.CanadaIsoCode)
                {
                    await AddTelusSubmission(quoteBindRequest.QuoteId, policy.PolicyNumber, fileGuid);
                }
            }
            catch (Exception ex)
            {
                throw new BindQuoteException("Could not persist Canada-specific data.", ex, BindQuoteErrorCode.DocumentGenerationError);
            }
        }

        private async Task GenerateAdditionalPolicyDocuments(PolicyCreationRequest policyCreationRequest, Policy policy)
        {
            try
            {
                if (!(policyCreationRequest.CountryIsoCode == CountryIsoCodes.UsaIsoCode && policyCreationRequest.IsAdmitted))
                {
                    await ProcessInsurerList(policy.PolicyId, policy.ClientId);
                }

                if (policyCreationRequest.CountryIsoCode == CountryIsoCodes.GbIsoCode)
                {
                    var elTransaction = _transactionRepository.GetTransactionByPolicyNumberAndBusinessLine(policy.PolicyNumber, "EL");
                    if (elTransaction != null)
                    {
                        await _elCertificateEngine.CreateAndSaveDocument(policy.PolicyId, policy.ClientId, FileFormat.Pdf);
                    }
                }

                await _certificateOfInsuranceEngine.CreateAndSaveDocument(policy.PolicyId, policy.ClientId);
            }
            catch (Exception ex)
            {
                throw new BindQuoteException("Could not generate additional policy documents", ex, BindQuoteErrorCode.DocumentGenerationError);
            }
        }

        private async Task GeneratePolicyDocument(Policy policy, Guid fileGuid)
        {
            try
            {
                if (_featureEngine.IsFeatureActive(FeatureName.DocumentGenerationConfigService))
                {
                    await _policyDocumentEngine.SavePolicyDocumentV2(policy, aifFileGuid: fileGuid);
                }
                else
                {
                    await _policyDocumentEngine.SavePolicyDocument(policy.PolicyId, aifFileGuid: fileGuid);
                }
            }
            catch (Exception ex)
            {
                throw new BindQuoteException("Could not generate policy document", ex, BindQuoteErrorCode.DocumentGenerationError);
            }
        }

        private async Task IndexPolicyInSearchService(Guid policyNumberUid)
        {
            try
            {
                await _portfolioItemsClient.PoliciesPostAsync(policyNumberUid);
            }
            catch (Exception exception)
            {
                Logger.Error(exception, "The quote has been successfully bound but an error happened while updating the Azure search index.");
            }
        }
    }
}