using AutoMapper;
using CFC.CoreApi.BusinessLogic.Exceptions;
using CFC.CoreApi.BusinessLogic.Interfaces;
using CFC.CoreApi.BusinessLogic.QuoteEngineComponents.Interfaces;
using CFC.CoreApi.BusinessLogicDto.Dto;
using CFC.CoreApi.BusinessLogicDto.Enum;
using CFC.CoreApi.Models.Nerd;
using CFC.CoreApi.Models.ViewModels.Policy;
using CFC.CoreApi.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Quote = CFC.CoreApi.Models.Nerd.Quote;
using QuoteSubjectivity = CFC.CoreApi.BusinessLogicDto.Dto.QuoteSubjectivity;
using Subjectivity = CFC.CoreApi.BusinessLogicDto.Dto.Subjectivity;

namespace CFC.CoreApi.BusinessLogic.QuoteEngineComponents
{
    public class PolicyCreationRequestBuilder : IPolicyCreationRequestBuilder
    {
        private readonly IQuoteRepository _quoteRepository;

        private readonly IPolicyRepository _policyRepository;

        private readonly IActivityMapRepository _activityMapRepository;

        private readonly ICommissionCalculationEngine _commissionCalculationEngine;

        private readonly IDateFormatEngine _dateFormatEngine;

        private readonly IMapper _mapper;

        private readonly IBinderValidationEngine _binderValidationEngine;

        public PolicyCreationRequestBuilder(
            IQuoteRepository quoteRepository,
            IPolicyRepository policyRepository,
            IActivityMapRepository activityMapRepository,
            ICommissionCalculationEngine commissionCalculationEngine,
            IDateFormatEngine dateFormatEngine,
            IMapper mapper,
            IBinderValidationEngine binderValidationEngine)
        {
            _quoteRepository = quoteRepository;
            _policyRepository = policyRepository;
            _activityMapRepository = activityMapRepository;
            _commissionCalculationEngine = commissionCalculationEngine;
            _dateFormatEngine = dateFormatEngine;
            _mapper = mapper;
            _binderValidationEngine = binderValidationEngine;
        }

        public async Task<PolicyCreationRequest> BuildPolicyCreationRequest(QuoteBindRequest quoteBindRequest)
        {
            try
            {
                var quote = _quoteRepository.GetQuote(quoteBindRequest.QuoteId);

                if (quote != null)
                {
                    if (quote.QuoteSubjectivities.Any(subjectivity => subjectivity.Subjectivity == null))
                    {
                        var updatedCustomSubjectivities = GetUpdatedQuoteSubjectivitiesFromConfiguration(quoteBindRequest, quote);

                        quoteBindRequest.QuoteSubjectivities = quoteBindRequest.QuoteSubjectivities
                           .Where(quoteSubjectivity => quoteSubjectivity.SubjectivityUid != null || quoteSubjectivity.CustomSubjectivityUid != null)
                           .Concat(updatedCustomSubjectivities);
                    }
                    else
                    {
                        var updatedCustomSubjectivities = GetUpdatedCustomSubjectivities(quoteBindRequest, quote);

                        quoteBindRequest.QuoteSubjectivities = quoteBindRequest.QuoteSubjectivities
                           .Where(quoteSubjectivity => quoteSubjectivity.Subjectivity.SubjectivityId != 0)
                           .Concat(updatedCustomSubjectivities);
                    }
                }

                if (quote == null)
                {
                    throw new ArgumentException(@"No quote exists for this quote ID.", nameof(quoteBindRequest));
                }

                if (quote.Status >= (int)QuoteState.Bound || !string.IsNullOrEmpty(_policyRepository.FindPolicyNumberByQuote(quoteBindRequest.QuoteId)))
                {
                    throw new ArgumentException(@"A policy already exists for this quote ID.", nameof(quoteBindRequest));
                }

                var policyCreationRequest = _mapper.Map<PolicyCreationRequest>(quote);
                _mapper.Map(quoteBindRequest, policyCreationRequest);

                MapValidBinderSectionIds(quoteBindRequest.InceptionDate, quoteBindRequest.PricingInformation, quote);

                policyCreationRequest.IsTriaPurchased = quote.HasTriaCoverage;
                policyCreationRequest.Commissions = _commissionCalculationEngine.CalculateBindCommission(quoteBindRequest, quote);
                policyCreationRequest.RequestTransactions = BuildPolicyCreationRequestTransactions(
                    quote.Lines,
                    quoteBindRequest.PricingInformation.ToList(),
                    quoteBindRequest.InceptionDate,
                    GetLastYearRevenueFromRiskQuestions(quote));
                policyCreationRequest.ProductCode = quote.Product.ProductName;
                policyCreationRequest.IsAdmitted = quote.Product.IsAdmitted;
                policyCreationRequest.MainActivityCode = _activityMapRepository.GetMainActivityFromQuote(quote.QuoteId)?.Code;
                policyCreationRequest.IsClientGstRegistered = IsClientRegisteredForGoodsAndServicesTax(quote);
                policyCreationRequest.BrokerName = quoteBindRequest.BrokerTeam.Broker.CompanyName;

                return policyCreationRequest;
            }
            catch (Exception ex)
            {
                throw new BindQuoteException("Exception when building the policy creation request", ex, BindQuoteErrorCode.BindError);
            }
        }

        private static IEnumerable<QuoteSubjectivity> GetUpdatedCustomSubjectivities(QuoteBindRequest quoteBindRequest, Quote quote)
        {
            var updatedCustomSubjectivities = (from bindSubjectivities in quoteBindRequest.QuoteSubjectivities
                                               where bindSubjectivities.Subjectivity.SubjectivityId == 0
                                               join quoteSubjectivities in quote.QuoteSubjectivities on bindSubjectivities.Text equals
                                                   quoteSubjectivities.Subjectivity.Text
                                               select new QuoteSubjectivity
                                               {
                                                   QuoteSubjectivityId = bindSubjectivities.QuoteSubjectivityId,
                                                   QuoteId = bindSubjectivities.QuoteId,
                                                   Subjectivity = new Subjectivity
                                                   {
                                                       SubjectivityId = quoteSubjectivities.Subjectivity.SubjectivityId,
                                                       SubjectivityUid = quoteSubjectivities.Subjectivity.SubjectivityUid,
                                                       Text = quoteSubjectivities.Text,
                                                       SubjectivityType = quoteSubjectivities.Type,
                                                       LanguageIsoCode = quoteSubjectivities.Subjectivity.LanguageIsoCode,
                                                       CreatedBy = quoteSubjectivities.Subjectivity.CreatedBy
                                                   },
                                                   Text = quoteSubjectivities.Text,
                                                   Type = quoteSubjectivities.Type,
                                                   IsPost = bindSubjectivities.IsPost,
                                                   Days = bindSubjectivities.Days
                                               });
            return updatedCustomSubjectivities;
        }

        private static IEnumerable<QuoteSubjectivity> GetUpdatedQuoteSubjectivitiesFromConfiguration(QuoteBindRequest quoteBindRequest, Quote quote)
        {
            var updatedCustomSubjectivities = from bindSubjectivities in quoteBindRequest.QuoteSubjectivities
                                              where bindSubjectivities.CustomSubjectivityUid == null && bindSubjectivities.SubjectivityUid == null
                                              join quoteSubjectivities in quote.QuoteSubjectivities on bindSubjectivities.Text equals
                                                  quoteSubjectivities.Text
                                              select new QuoteSubjectivity()
                                              {
                                                  QuoteSubjectivityId = bindSubjectivities.QuoteSubjectivityId,
                                                  QuoteId = bindSubjectivities.QuoteId,
                                                  CustomSubjectivityUid = quoteSubjectivities.CustomSubjectivityUid,
                                                  Text = bindSubjectivities.Text,
                                                  Type = bindSubjectivities.Type,
                                                  IsPost = bindSubjectivities.IsPost,
                                                  Days = bindSubjectivities.Days
                                              };
            return updatedCustomSubjectivities;
        }

        private void MapValidBinderSectionIds(DateTime inceptionDate, IEnumerable<PricingInformation> pricingInformation, Quote quote)
        {
            var businessLineCodes = quote.Lines.Select(line => line.BusinessLine).Distinct().ToList();
            
            string enquiryCfcTeamCoverholder = quote.Enquiry?.CfcTeam?.Coverholder;

            var binderSectionIds = _binderValidationEngine.GetBinderSectionIdsByBusinessLine(
                businessLineCodes,
                inceptionDate,
                quote.Product.ProductId,
                quote.Currency.IsoCode,
                quote.Country.CountryId,
                quote.Client.HasEuSubsidiaries,
                GetLastYearRevenueFromRiskQuestions(quote),
                GetUsExposureFromRiskQuestions(quote), 
                enquiryCfcTeamCoverholder);

            foreach (var pricing in pricingInformation)
            {
                pricing.BinderSectionId = binderSectionIds[pricing.BusinessLine.Name];
            }
        }

        private static decimal? GetLastYearRevenueFromRiskQuestions(Quote quote)
        {
            return quote.RiskQuestionAnswers.Where(rqa => rqa.RiskQuestionTag == "TOTAL_REVENUE").Select(rqa => rqa.Currency).FirstOrDefault();
        }

        private static decimal? GetUsExposureFromRiskQuestions(Quote quote)
        {
            return quote.RiskQuestionAnswers.Where(rqa => rqa.RiskQuestionTag == "US_PERCENT").Select(rqa => (rqa.Percentage ?? 0) / 100).FirstOrDefault();
        }

        private static bool IsClientRegisteredForGoodsAndServicesTax(Quote quote)
        {
            var gstRegisteredAnswer = quote.RiskQuestionAnswers?.FirstOrDefault(answer => answer.RiskQuestionTag == "GST_Registered");
            return gstRegisteredAnswer?.Text == "Yes";
        }

        private IEnumerable<PolicyCreationRequestTransaction> BuildPolicyCreationRequestTransactions(
            IEnumerable<QuoteLine> quoteLines,
            IReadOnlyCollection<PricingInformation> bindLines,
            DateTime inceptionDate,
            decimal? lastYearRevenue)
        {
            return quoteLines.Select(line => this.BuildPolicyCreationRequestTransaction(line, bindLines, inceptionDate, lastYearRevenue)).ToList();
        }

        private PolicyCreationRequestTransaction BuildPolicyCreationRequestTransaction(
            QuoteLine line,
            IReadOnlyCollection<PricingInformation> bindLines,
            DateTime inceptionDate,
            decimal? lastYearRevenue)
        {
            var requestTransaction = _mapper.Map<PolicyCreationRequestTransaction>(line);
            requestTransaction.BinderSectionId = bindLines.Single(bl => bl.BusinessLine.Name == line.BusinessLine).BinderSectionId;
            requestTransaction.BinderCoverholder = line.BinderSection?.Coverholder;

            if (line.RetroDate != null)
            {
                requestTransaction.RetroDate = _dateFormatEngine.ConvertRetroDate(line.RetroDate, inceptionDate);
            }

            var bindRequestLine = bindLines.FirstOrDefault(l => l.BusinessLine.Name == line.BusinessLine);
            if (bindRequestLine != null && (bindRequestLine.Quoted != requestTransaction.QuotedPremium || requestTransaction.PolicyFee != bindRequestLine.Fee))
            {
                requestTransaction.QuotedPremium = bindRequestLine.Quoted;
                requestTransaction.ModelPremium = bindRequestLine.Model ?? requestTransaction.ModelPremium;
            }

            requestTransaction.PolicyFee = line.PolicyFee;
            requestTransaction.RatingParameter = lastYearRevenue;

            return requestTransaction;
        }
    }
}
